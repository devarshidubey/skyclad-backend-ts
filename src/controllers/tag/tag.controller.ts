import type { Request, Response, NextFunction } from "express"
import { listPrimaryTagsWithCount, listDocumentsWithPrimaryTag } from "../../services/tag/tag.service.js"
import { Types } from "mongoose";

export const listTags = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ownerId: string = req.user!.id as string;

        const result = await listPrimaryTagsWithCount(ownerId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch(err) {
        next(err);
    }
    
}

export const findDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ownerId: string = req.user!.id as string;
        const tag = req.params.tag!;

        const documents = await listDocumentsWithPrimaryTag(ownerId, tag);

        res.status(200).json({
            success: true,
            data: documents,
        });
    } catch(err) {
        next(err);
    }
    
}