import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { createDocumentWithTags } from "../services/document/document.service.js";
import { Types } from "mongoose";
import logger from "../utils/logger.js";

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI!;

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        await User.deleteMany({});

        const adminPassword = await bcrypt.hash("Admin@123", Number(process.env.BCRYPT_SALT_ROUNDS));
        const admin = await User.create({
            email: "admin@example.com",
            password: adminPassword,
            role: "admin",
        });

        const userPassword = await bcrypt.hash("User@123", 12);
        const user = await User.create({
            email: "user@example.com",
            password: userPassword,
            role: "user",
        });

        console.log("Created admin and user");

        await createDocumentWithTags({
            ownerId: admin._id as Types.ObjectId,
            filename: "admin_doc1.txt",
            mime: "text/plain",
            textContent: "This is the admin's first document",
            primaryTag: "Important",
            secondaryTags: ["Admin", "Confidential"],
        });

        await createDocumentWithTags({
            ownerId: admin._id as Types.ObjectId,
            filename: "admin_doc2.csv",
            mime: "text/csv",
            textContent: "id,name\n1,AdminDoc2",
            primaryTag: "Reports",
            secondaryTags: ["CSV"],
        });

        await createDocumentWithTags({
            ownerId: user._id as Types.ObjectId,
            filename: "user_doc1.txt",
            mime: "text/plain",
            textContent: "This is user's first document",
            primaryTag: "Personal",
            secondaryTags: ["Notes"],
        });

        await createDocumentWithTags({
            ownerId: user._id as Types.ObjectId,
            filename: "user_doc2.csv",
            mime: "text/csv",
            textContent: "id,name\n1,UserDoc2",
            primaryTag: "Work",
            secondaryTags: ["CSV", "Tasks"],
        });


        await mongoose.disconnect();
    } catch (err) {
        logger.error("Seeding failed:", err);
        process.exit(1);
    } finally {
        console.log("finished");
    }
}

seed();
