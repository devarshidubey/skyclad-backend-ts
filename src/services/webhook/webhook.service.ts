import type { Types } from "mongoose";
import { emailClasses, officialKeywords, promotionalKeywords } from "../../utils/textClassification.js";
import { askCerebras, askCerebrasWithRetry } from "../action/cerebras.service.js";
import { Task } from "../../models/Task.js";
import HTTPError from "../../utils/HTTPError.js";
import logger from "../../utils/logger.js";

interface UnsubscribeInfo {
    channel: "email" | "link";
    target: string;
}

export function classifyOCRInputDeterministic(textContent: string) {
    const text = textContent.toLowerCase();

    let unsubscribe: UnsubscribeInfo | undefined;

    const emailMatch = text.match(/mailto:([^\s,]+)/i);
    if (emailMatch) {
        unsubscribe = { channel: "email", target: emailMatch[1]!.trim() };
    } else {
        const urlMatch = text.match(/https?:\/\/[^\s,]+/i);
        if (urlMatch && /unsubscribe/i.test(urlMatch[0])) {
            unsubscribe = { channel: "link", target: urlMatch[0].trim() };
        }
    }

    const officialCount = officialKeywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    const promoCount = promotionalKeywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);

    const type: "ad" | "official" =
        promoCount > officialCount || unsubscribe ? "ad" : "official";

    return unsubscribe ? { type, unsubscribe } : { type };
}

export const createTask = async (ownerId: Types.ObjectId, target: string, channel: string, sourceId: string) => {
    const existingTask = await Task.findOne({
        ownerId,
        target,
    });

    if(!existingTask) {
        const task = await Task.create({
            ownerId,
            sourceId,
            type: "ocr_task",
            channel,
            target,
        });
        logger.info({
            at: new Date(),
            userId: ownerId,
            action: "TASK_CREATE",
            entityType: "Task",
            entityId: task._id,
            metadata: {}
        })
        return task;
    }
}

export const classifyOCRInput = async (textContent: string, ownerId: Types.ObjectId, sourceId: string) => {
    const llmPrompt = `
        You are given the follwing text fetched from an OCR.
        ---
        ${ textContent }
        ---
        1. You have to classify it into one of the following categories:
        ${ Object.keys(emailClasses).join(',') } based on the follwing rules:
        ${ JSON.stringify(emailClasses) }
        2. Extract unsubscribe email/link (if available) if it's an ad in the format:
            { channel: enum[email, link], target: <the target email/link> }
            Note: Remove prefixes like "mailto:" from emails
        Return only the JSON object with the following format and nothing else:
            {
                type: string, enum[ad, official],
                unsubscribe?: {channel: enum[email, link], target: string} //opt: send only if available
            }
    `
    let parsed;
    try {
        parsed = await askCerebrasWithRetry(llmPrompt);
    } catch (err) {
        if(err instanceof HTTPError && err.statusCode === 429) {
            parsed = await classifyOCRInputDeterministic(textContent.toLowerCase());     
        }
    }
    
    if(parsed.type === "ad" && parsed.unsubscribe) {
        await createTask(
            ownerId,
            parsed.unsubscribe.target,
            parsed.unsubscribe.channel,
            sourceId  
        );
    }

    return parsed;
}