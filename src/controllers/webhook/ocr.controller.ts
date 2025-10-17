import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ocrSchema } from "../../validators/webhook.validator.js";
import { classifyOCRInput } from "../../services/webhook/webhook.service.js";
import { enforceDailyLimit } from "../../utils/rateLimit.js"

export const ocrController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { source, imageId, text, meta }= ocrSchema.parse(req.body);
        const ownerId = new Types.ObjectId(req.user!.id);

        await enforceDailyLimit(ownerId, source, "ocr_task");

        const result = await classifyOCRInput( text, ownerId, source );
        
        res.status(200).json({
            success: true,
            data: result,
        })
    } catch(err) {
        next(err);
    }
}