import type { Request, Response, NextFunction } from "express";
import HTTPError from "../../utils/HTTPError.js";
import { fetchMetrics } from "../../services/audit/audit.service.js";

export const auditController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let result;
        
        if(req.user!.accessLevel === "any") {
            result = await fetchMetrics();
        } else {
            throw new HTTPError(403, "Forbidden access");
        }

        res.status(200).json({
            status: 200,
            data: result,
        })
    } catch(err) {
        next(err);
    }
}