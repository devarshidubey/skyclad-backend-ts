import { createDocumentWithTags } from "../document/document.service.js";
import { Document } from "../../models/Document.js"; // adjust import path
import { Tag } from "../../models/Tag.js";
import { Types } from "mongoose";
import { askCerebras } from "./cerebras.service.js";
import HTTPError from "../../utils/HTTPError.js";

interface ProcessFolderInput {
    ownerId: Types.ObjectId;
    scope: { type: "folder"; name: string };
    messages: { role: string; content: string }[];
    actions: string[];
}

export async function processFolderAction(input: ProcessFolderInput) {
    const { ownerId, scope, messages, actions } = input;

    const primaryTag = await Tag.findOne({ name: scope.name, ownerId });

    if(!primaryTag) throw new HTTPError(404, `Primary tag not found for this owner`);

    const sampleDocs = await Document.find({ ownerId, primaryTagId: primaryTag })
      .limit(5)
      .lean();

    if (!sampleDocs.length) throw new HTTPError(404, "No documents found for this tag.");

    const sampleContent = sampleDocs
      .map((doc, i) => `--- Sample ${i + 1} ---\n${ doc.textContent.slice(0, 2000) }`)
      .join("\n");

    const llmPrompt = `
        You are given a folder of documents related to "${primaryTag}".
        User message: ${messages.map((m) => m.content).join("\n")}
        Here are ${ sampleDocs.length } sample documents for context:
        ---
        ${ sampleContent }
        ---

        Task:
        1. Identify 3 relevant keywords.
        2. Write a regex that can extract these keywords or related numerical fields.
        3. Decide which action to take among: ${actions.join(", ")}.
        Return JSON in this format:
        {
            "keywords": [ ... ],
            "regex": "<regex>",
            "action": "<chosen_action>"
        }
      `;


    const parsed = await askCerebras(llmPrompt);

    const regex = new RegExp(parsed.regex, "gi");
    const chosenAction = parsed.action;

    const docs = await Document.find({ ownerId, primaryTagId: primaryTag });
    const rows: any[] = [];

    for (const doc of docs) {
        const matches = doc.textContent.match(regex);
        rows.push({
            filename: doc.filename,
            extracted: matches?.[0] ?? "unknown",
        });
    }

    const output =
        chosenAction === "make_csv"
            ? rows.map((r) => `${r.filename},${r.extracted}`).join("\n")
            : rows.map((r) => `${r.filename}: ${r.extracted}`).join("\n");

    await createDocumentWithTags({
        ownerId,
        filename: `${scope.name}-result.${chosenAction === "make_csv" ? "csv" : "txt"}`,
        mime: chosenAction === "make_csv" ? "text/csv" : "text/plain",
        textContent: output,
        primaryTag: scope.name,
        secondaryTags: ["result", chosenAction],
    });

    return { keywords: parsed.keywords, regex: parsed.regex, action: chosenAction };
}
