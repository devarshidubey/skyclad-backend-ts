import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { ZodError } from "zod";

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction,
)=> {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500? "Internal Server Error": err.message;

    if(res.headersSent) return;

    if(err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map(issue=> ({
                field: issue.path.join("."),
                message: issue.message,
            }))
        });
    }

    if(statusCode >= 500) {
        logger.error({
            message: err.message,
            stack: err.stack,
        });
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
}

export default errorHandler;