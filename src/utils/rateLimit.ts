import type { Types } from "mongoose";
import HTTPError from "./HTTPError.js";
import { Task } from "../models/Task.js";

export async function enforceDailyLimit(
    ownerId: Types.ObjectId,
    sourceId: string,
    type: string
) {
    const maxPerDay = Number(process.env.TASKS_DAILY_LIMIT) || 3;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const countToday = await Task.countDocuments({
        ownerId,
        sourceId,
        type,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (countToday >= maxPerDay) {
        throw new HTTPError(429, `Daily limit of ${maxPerDay} tasks for "${type}" reached`);
    }
}
