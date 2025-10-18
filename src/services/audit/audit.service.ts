import mongoose from "mongoose";
import { Document } from "../../models/Document.js"
import { DocumentTag } from "../../models/DocumentTag.js";
import { Task } from "../../models/Task.js";

export const getTotalDocs = async ()=> {
    const total = await Document.countDocuments({ deleted: false });
    return total;
}

export const getTotalFolders = async ()=> {
    const total = await DocumentTag.countDocuments( { deleted: false, isPrimary: true });
    return total;
}

export const getTotalTasks = async ()=> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const total = await Task.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });
    return total;
}

export const getTotalActions = async ()=> {
    const conn = await mongoose.createConnection(process.env.MONGO_AUDIT_URI!, { dbName: process.env.MONGO_AUDIT_DB! });

    await new Promise<void>((resolve, reject) => {
        conn.once("connected", () => resolve());
        conn.once("error", (err) => reject(err));
    });
    
    try {

        const db = conn.db;
        if (!db) throw new Error("Database connection not available");

        const collection = db.collection("AuditLog");

        const startOfTheMonth = new Date();
        startOfTheMonth.setDate(1);
        startOfTheMonth.setHours(0, 0, 0, 0);

        const total = await collection.countDocuments({ 
            action: "SCOPED_ACTION",
            at: { $gte: startOfTheMonth },
        });
        
        return total;
    } catch(err) {
        throw err;
    } finally {
        await conn.close();
    }
}

export const fetchMetrics = async ()=> {
    const docs_total = await getTotalDocs();
    const folders_total = await getTotalFolders();
    const actions_month = await getTotalActions();
    const tasks_today = await getTotalTasks();

    return {
        docs_total,
        folders_total,
        actions_month,
        tasks_today,
    }
}