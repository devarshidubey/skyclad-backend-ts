import { Schema, Document, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IDocumentTag extends Document {
    id: string;
    documentId: Schema.Types.ObjectId;
    tagId: Schema.Types.ObjectId;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const documentTagSchema = new Schema<IDocumentTag>({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
        index: true,
    },
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
        required: true
    }
}, { timestamps: true });

export const DocumentTag = model<IDocumentTag>("DocumentTag", documentTagSchema);