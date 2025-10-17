import { Schema, Document, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { EMAIL_REGEX } from "../utils/regex.js";

export interface IUser extends Document {
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}


const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return EMAIL_REGEX.test(v);
            },
            message: "Invalid email",
        },
    },
    password: { //hashed: my bad for poor naming
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "moderator", "user"],
        default: "user",
        required: true,
    },
}, { timestamps: true });

export const User = model<IUser>("User", userSchema);