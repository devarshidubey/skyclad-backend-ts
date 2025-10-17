import type { Types } from "mongoose";
import { Usage } from "../../models/Usage.js";

export const recordUsage = async (ownerId: Types.ObjectId, action: string, credits: number)=> {
    await Usage.create({
        ownerId,
        action,
        credits,
    });

}

export async function fetchActionUsage(ownerId: Types.ObjectId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setMilliseconds(-1);

    const usageData = await Usage.aggregate([
        { $match: { ownerId, createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: "$action", totalCredits: { $sum: "$credits" } } },
    ]);

    return usageData;
}
