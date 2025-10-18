import type { Request, Response, NextFunction } from "express"
import { listPrimaryTagsWithCount, listDocumentsWithPrimaryTag, createTag } from "../../services/tag/tag.service.js"
import { Types } from "mongoose";
import HTTPError from "../../utils/HTTPError.js";
import { folderSchema } from "../../validators/folder.validator.js";

export const listTags = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const currentUserId: string = req.user!.id as string;
        const requestedUserId = req.query.ownerId as string | undefined;

        let ownerId = currentUserId;

        if(requestedUserId) {
            if(requestedUserId !== currentUserId && req.user!.accessLevel !== "any")
                throw new HTTPError(403, "Forbidden access");
            ownerId = requestedUserId;
        }

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
        const currentUserId: string = req.user!.id as string;
        const requestedUserId = req.query.ownerId as string | undefined;

        const tag = req.params.tag!;

        let ownerId = currentUserId;
        if(requestedUserId) {
            console.log(requestedUserId, )
            if(requestedUserId !== currentUserId && req.user!.accessLevel !== "any") throw new HTTPError(403, "Forbidden");
            ownerId = requestedUserId;
        }
        const documents = await listDocumentsWithPrimaryTag(ownerId, tag);

        res.status(200).json({
            success: true,
            data: documents,
        });
    } catch(err) {
        next(err);
    }
    
}

export const createTagController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { primaryTag } = folderSchema.parse(req.body);
        const ownerId = req.user!.id;

        const tag = await createTag(ownerId, primaryTag);

        res.status(201).json({
            success: true,
            data: tag,
        })
    } catch(err) {
        next(err);
    }
}