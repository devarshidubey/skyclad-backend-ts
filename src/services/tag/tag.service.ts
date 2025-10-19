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
    const results = await Tag.aggregate([
        { $match: { ownerId: new Types.ObjectId(ownerId) } },

        {$lookup: {
                from: "documenttags",
                localField: "_id",
                foreignField: "tagId",
                as: "documentTags",
        },},

        { $unwind: { path: "$documentTags", preserveNullAndEmptyArrays: true } },

        {
        $lookup: {
            from: "documents",
            localField: "documentTags.documentId",
            foreignField: "_id",
            as: "document",
        },
        },
        { $unwind: { path: "$document", preserveNullAndEmptyArrays: true } },

        {
        $match: {
            $or: [
            { document: { $exists: false } }, // no documents
            {
                "document.ownerId": new Types.ObjectId(ownerId),
                "document.deleted": false,
                "documentTags.isPrimary": true,
                "documentTags.deleted": false,
            },
            ],
        },
        },

        {
        $group: {
            _id: "$_id",
            name: { $first: "$name" },
            documentCount: {
            $sum: {
                $cond: [
                {
                    $and: [
                    { $ifNull: ["$document._id", false] },
                    { $eq: ["$documentTags.isPrimary", true] },
                    ],
                },
                1,
                0,
                ],
            },
            },
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
