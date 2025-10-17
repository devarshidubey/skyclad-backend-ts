import { Schema, model, Document } from "mongoose";
import { TAG_REGEX } from "../utils/regex.js";

export interface ITag extends Document {
    id: string;
    name: string;
    ownerId: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const tagSchema = new Schema<ITag>({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return TAG_REGEX.test(v);
            },
            message: "Invalid Tag Name",
        },
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

tagSchema.index({ name: 1, ownerId: 1 }, { unique: true });

export const Tag = model<ITag>("Tag", tagSchema);
