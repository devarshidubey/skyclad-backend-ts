import type { Request, Response, NextFunction } from "express";

export const handleOCRInjestion = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        
    } catch(err) {
        next(err);
    }
}