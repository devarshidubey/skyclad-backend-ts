import type { Request, Response, NextFunction } from "express";
import { processFileAction, processFolderAction } from "../../services/action/action.service.js";
import { Types } from "mongoose";
import { fetchActionUsage, recordUsage } from "../../services/action/usage.service.js";
import HTTPError from "../../utils/HTTPError.js";


export const runAction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { scope, messages, actions } = req.body;
        const ownerId = new Types.ObjectId(req.user!.id);

        if (!scope || !messages || !actions)
            return res.status(400).json({ error: "Missing required fields" });

        let result;

        if (scope.type === "folder") result = await processFolderAction({ ownerId, scope, messages, actions }); 
        else if (scope.type === "file") result = await processFileAction({ ownerId, scope, messages, actions });
        else return res.status(400).json({ error: "Unsupported scope type" });
        

        await recordUsage(ownerId, "agent_run", 5);

        res.status(200).json({
            success: true,
            data: result,
        });

    } catch(err) {
        next(err);
    }
}

export const usageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const currentUserId = req.user!.id;
        const requestedOwnerId = req.query.ownerId as string | undefined;

        let ownerId = new Types.ObjectId(currentUserId);

        if(requestedOwnerId) {
            if (requestedOwnerId !== currentUserId && req.user!.accessLevel !== "any")
                throw new HTTPError(403, "Forbidden access");
            ownerId = new Types.ObjectId(requestedOwnerId);
        }

        const usageData = await fetchActionUsage(ownerId);

        res.status(200).json({
            success: true,
            data: usageData,
        })
    } catch(err) {
        next(err);
    }
}