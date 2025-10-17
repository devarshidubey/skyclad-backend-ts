import { Schema, model, Document as MongooseDocument } from "mongoose";
import { FILENAME_REGEX } from "../utils/regex.js";

export interface IDocument extends MongooseDocument {
    filename: string;
    ownerId: Schema.Types.ObjectId;
    primaryTagId: Schema.Types.ObjectId;
    mime: string;
    textContent: string;
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    primaryTagId: {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        required: true,
    },
    filename: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return FILENAME_REGEX.test(v);
            },
            message: "Invalid filename",
        },
    },
    mime: {
        type: String,
        enum: ["text/plain", "text/csv"],
        default: "text/plain",
    },
    textContent: {
        type: String,
        required: true,
        max_length: 10000
    },
}, { timestamps: true });

documentSchema.index({ ownerId: 1, primaryTagId: 1, filename: 1 }, { unique: true });

export const Document = model<IDocument>("Document", documentSchema);
