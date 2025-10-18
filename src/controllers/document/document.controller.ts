import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { documentSchema, updateDocumentSchema } from "../../validators/document.validator.js";
import { createDocumentWithTags, fetchDocument, softDeleteDocumentWithTags, updateDocument } from "../../services/document/document.service.js";
import { Types } from "mongoose";
import logger from "../../utils/logger.js";

type DocumentInput = z.infer<typeof documentSchema>;

export const getDocumentController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const documentId = new Types.ObjectId(req.params.documentId);
        const userId = new Types.ObjectId(req.user!.id);
        const accessLevel = req.user!.accessLevel!;

        const document = await fetchDocument(documentId, userId, accessLevel);

        res.status(200).json({
            success: true,
            data: document
        });
    } catch(err) {
        next(err);
    }
}

export const updateDocumentController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const parsed = updateDocumentSchema.parse(req.body);

        const documentId = new Types.ObjectId(req.params.documentId);
        const userId = new Types.ObjectId(req.user!.id);
        const accessLevel = req.user!.accessLevel!;

        const updatedDoc = await updateDocument(documentId, userId, accessLevel, parsed);

        res.status(200).json({
            success: true,
            data: updatedDoc
        });
    } catch(err) {
        next(err);
    }
}

export const createDocumentController = async (
    req: Request<{}, {}, DocumentInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const documentData = documentSchema.parse(req.body);
        const ownerId = new Types.ObjectId(req.user!.id);

        const result = await createDocumentWithTags({
            ...documentData,
            ownerId,
        });

        logger.info({
            at: new Date(),
            userId: ownerId,
            action: "DOCUMENT_UPLOAD",
            entityType: "Document",
            entityId: result.document._id,
            metadata: {
                role: req.user!.role,
                accessLevel: req.user!.accessLevel,
                ownerId: ownerId,
            }
        })

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch(err) {
        next(err);
    }
}

export const deleteDocumentController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const documentId = new Types.ObjectId(req.params.documentId);
        const userId = new Types.ObjectId(req.user!.id);
        const accessLevel = req.user!.accessLevel!;

        const document = await fetchDocument(documentId, userId, accessLevel);
        const ownerId = document.ownerId as unknown as Types.ObjectId;

        await softDeleteDocumentWithTags(documentId, ownerId)

        res.status(200).json({
            success: true,
            message: "Document deleted",
            data: document
        });
    } catch(err) {
        next(err);
    }
}