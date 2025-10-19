import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import logger from "../utils/logger.js";

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

        await mongoose.disconnect();
    } catch (err) {
        logger.log("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
