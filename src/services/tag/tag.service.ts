import { Document } from "../../models/Document.js";
import { DocumentTag } from "../../models/DocumentTag.js";
import { Tag } from "../../models/Tag.js";
import { Types } from "mongoose";
import HTTPError from "../../utils/HTTPError.js";

interface PrimaryTagCount {
    tagId: Types.ObjectId;
    name: string;
    documentCount: number;
}

export async function listPrimaryTagsWithCount(ownerId: string) {
    const results = await DocumentTag.aggregate([
        { $match: { isPrimary: true, deleted: false } },

        {
            $lookup: {
                from: "documents",
                localField: "documentId",
                foreignField: "_id",
                as: "document",
            },
        },
        { $unwind: "$document" },

        { 
            $match: { 
                "document.ownerId": new Types.ObjectId(ownerId),
                "document.deleted": false,
        }   },

        {
            $lookup: {
                from: "tags",
                localField: "tagId",
                foreignField: "_id",
                as: "tag",
            },
        },
        { $unwind: "$tag" },

        {
            $group: {
                _id: "$tagId",
                name: { $first: "$tag.name" },
                documentCount: { $sum: 1 },
            },
        },

        {
            $project: {
                tagId: "$_id",
                name: 1,
                documentCount: 1,
                _id: 0,
            },
        },

        { $sort: { documentCount: -1 } },
    ]);

    return results;
}

export async function listDocumentsWithPrimaryTag(ownerId: string, tag: string) {
    const id = new Types.ObjectId(ownerId);
    const tagId = new Types.ObjectId(tag);

    const documents = await Document.find({ ownerId: id, primaryTagId: tagId, deleted: false }).sort({ createdAt: -1 });

    if(documents.length === 0) throw new HTTPError(404, "Folder doesn't exist/is empty");

    return documents;
}

export async function createTag(ownerId: string, name: string) {
    if (!name?.trim()) {
        throw new HTTPError(400, "Tag name is required");
    }

    const normalized = name.toLowerCase();

    const existingTag = await Tag.findOne({ name: normalized, ownerId });
    if (existingTag) {
        throw new HTTPError(409, "Tag already exists");
    }

    const tag = new Tag({ name: normalized, ownerId });
    await tag.save();

    return tag;
}
