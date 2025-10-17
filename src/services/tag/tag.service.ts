import { Document } from "../../models/Document.js";
import { DocumentTag } from "../../models/DocumentTag.js";
import { Tag } from "../../models/Tag.js";
import { Types } from "mongoose";

interface PrimaryTagCount {
    tagId: Types.ObjectId;
    name: string;
    documentCount: number;
}

export async function listPrimaryTagsWithCount(ownerId: string) {
    const results = await DocumentTag.aggregate([
        { $match: { isPrimary: true } }, // only primary tags

        // Join with Document to access ownerId
        {
            $lookup: {
                from: "documents",
                localField: "documentId",
                foreignField: "_id",
                as: "document",
            },
        },
        { $unwind: "$document" },

        // Filter by ownerId
        { $match: { "document.ownerId": new Types.ObjectId(ownerId) } },

        // Join with Tag collection to get tag name
        {
            $lookup: {
                from: "tags",
                localField: "tagId",
                foreignField: "_id",
                as: "tag",
            },
        },
        { $unwind: "$tag" },

        // Group by tag to count documents
        {
            $group: {
                _id: "$tagId",
                name: { $first: "$tag.name" },
                documentCount: { $sum: 1 },
            },
        },

        // Shape the output
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

    const documents = Document.find({ ownerId, primaryTagId: tagId }).sort({ createdAt: -1 });

    return documents;
}