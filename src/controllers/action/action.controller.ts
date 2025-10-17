import type { Request, Response, NextFunction } from "express";
import { processFolderAction } from "../../services/action/action.service.js";
import { Types } from "mongoose";


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

        if (scope.type === "folder") {
            const result = await processFolderAction({ ownerId, scope, messages, actions });
            return res.json(result);
        }

        return res.status(400).json({ error: "Unsupported scope type" });
    } catch(err) {
        next(err);
    }
}