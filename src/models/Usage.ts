import { Schema, model, Types } from "mongoose";

export interface IUsage {
    ownerId: Types.ObjectId;
    action: string;
    credits: number;
}

const usageSchema = new Schema<IUsage>({
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    credits: { type: Number, required: true },
}, { timestamps: true });

usageSchema.index({ ownerId: 1, createdAt: 1 });

export const Usage = model<IUsage>("Usage", usageSchema);
