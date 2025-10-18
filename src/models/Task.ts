import mongoose, { Document, Schema } from "mongoose";
import { EMAIL_REGEX, URL_REGEX } from "../utils/regex.js";

export interface ITask extends Document {
    ownerId: Schema.Types.ObjectId;
    status: string;
    type: string;
    channel: string;
    target: string;
}

const taskSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    sourceId: {
        type: String,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
    },
    type: {
        type: String,
        enum: ["ocr_task"],
        required: true,
    },
    channel: {
        type: String,
        enum: ["email", "link"],
        required: true,
    },
    target: {
        type: String,
        validate: {
            validator: function(value: string) {
                return EMAIL_REGEX.test(value) || URL_REGEX.test(value);
            },
            message: "Target must be a valid email or URL"
        },
        required: true
    }
}, { timestamps: true });

taskSchema.index({ ownerId: 1, target: 1 }, { unique: true });

export const Task = mongoose.model('Task', taskSchema);