import { Document, type IDocument } from "../../models/Document.js";
import { Tag } from "../../models/Tag.js";
import { DocumentTag } from "../../models/DocumentTag.js";
import { runInTransaction } from "../../utils/transaction.js";
import type { HydratedDocument, Types } from "mongoose";
import HTTPError from "../../utils/HTTPError.js";

interface CreateDocInput {
    ownerId: Types.ObjectId;
    filename: string;
    mime: string;
    textContent: string;
    primaryTag: string;
    secondaryTags: string[];
}

export async function updateDocument(
    documentId: Types.ObjectId,
    userId: Types.ObjectId,
    accessLevel: AccessLevel,
    update: { filename?: string | undefined, textContent?: string | undefined; mime?: string | undefined }
) {
    const doc = await fetchDocument(documentId, userId, accessLevel);

    if(update.filename !== undefined) doc.filename = update.filename;
    if (update.textContent !== undefined) doc.textContent = update.textContent;
    if (update.mime !== undefined) doc.mime = update.mime;

    await Document.updateOne({ _id: doc._id }, { $set: doc });

    return doc;
}


export async function fetchDocument(documentId: Types.ObjectId, userId: Types.ObjectId, accessLevel: AccessLevel) {
    const doc = await Document.findById(documentId).lean();
    
    if(!doc) throw new HTTPError(404, "Document Not Found");

    if(accessLevel === "any") return doc;
    
    else if(accessLevel === "own" && doc.ownerId.toString() === userId.toString()) return doc;

    else throw new HTTPError(403, "Forbidden");
}

export async function createDocumentWithTags(input: CreateDocInput) {
    return runInTransaction(async (session) => {
        const { ownerId, filename, mime, textContent, primaryTag, secondaryTags } = input;

            const existingDoc = await Document.findOne({
            ownerId,
            filename,
        // Assuming primaryTagId will be looked up below, convert to lowercase for consistency
        }).session(session);

        if (existingDoc) {
            throw new HTTPError(409, "Document with this name and primary tag already exists");
        }


        const primaryTagDoc = await Tag.findOneAndUpdate(
            { name: primaryTag.toLowerCase(), ownerId },
            { $setOnInsert: { ownerId } },
            { upsert: true, new: true, session }
        );

        const doc = new Document({
            ownerId,
            filename,
            mime,
            textContent,
            primaryTagId: primaryTagDoc!._id,
        });

        await doc.save({ session });

        const secondaryTagNames = secondaryTags.map(t => t.toLowerCase());
        const existingSecondaryTags = await Tag.find({ name: { $in: secondaryTagNames }, ownerId }).session(session);

        const existingMap = new Map(existingSecondaryTags.map(t => [t.name.toLowerCase(), t]));

        const newSecondaryTags = secondaryTags
            .filter(t => !existingMap.has(t.toLowerCase()))
            .map(t => ({ name: t.toLowerCase(), ownerId }));

        const createdSecondaryTags = newSecondaryTags.length
            ? await Tag.insertMany(newSecondaryTags, { session, ordered: true })
            : [];

        const allSecondaryTags = [...existingSecondaryTags, ...createdSecondaryTags];

        const docTagDocs = [
            { documentId: doc._id, tagId: primaryTagDoc!._id, isPrimary: true },
            ...allSecondaryTags.map(t => ({ documentId: doc._id, tagId: t._id, isPrimary: false })),
        ];

        await DocumentTag.insertMany(docTagDocs, { session, ordered: true });

        return { document: doc, primaryTag: primaryTagDoc, secondaryTags: allSecondaryTags };
    });
}