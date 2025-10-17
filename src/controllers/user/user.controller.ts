import type { Request, Response, NextFunction } from "express";
import HTTPError from "../../utils/HTTPError.js";
import { updateUserRole } from "../../services/user/user.service.js";

export const assignRole = async (
    req: Request,
    res: Response,
    next: NextFunction
)=> {
     try {
        const userId: string = req.params.id!;
        const { role } = req.body

        if(req.user!.role !== "admin") throw new HTTPError(403, "Forbidden");

        if (!["admin", "moderator", "user"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await updateUserRole(userId, role);

        if (!user) throw new Error("User not found");
        
        res.status(200).json({
            success: true,
            message: "Users role updated successfully",
            data: user,
        });
    } catch(err) {
        next(err);
    }
}