import { Schema, Document, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IDocumentTag extends Document {
    id: string;
    documentId: Schema.Types.ObjectId;
    tagId: Schema.Types.ObjectId;
    isPrimary: boolean;
    deleted: boolean;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}


const documentTagSchema = new Schema<IDocumentTag>({
    documentId: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: true,
    },
    tagId: {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        required: true,
    },
    isPrimary: {
        type: Boolean,
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

documentTagSchema.index(
    { documentId: 1, isPrimary: 1 },
    {
        unique: true,
        partialFilterExpression: { isPrimary: true, deleted: false }, //only non dleted Pr. tags must be unique
        name: "unique_primary_tag_per_document"
    }
);

documentTagSchema.index(
    { documentId: 1, tagId: 1 },
    { 
        unique: true,
        partialFilterExpression: { deleted: false },
        name: "unique_tag_per_document"
    }
);

export const DocumentTag = model<IDocumentTag>("DocumentTag", documentTagSchema);