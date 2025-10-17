import { userSchema, userLoginSchema } from "../../validators/user.validator.js";
import { generateTokens } from "../../services/user/token.service.js";
import { createUser, authenticateUser } from "../../services/user/auth.service.js";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

type UserInput = z.infer<typeof userSchema>;
type UserLoginInput = z.infer<typeof userLoginSchema>

export const signup = async (
    req: Request<{}, {}, UserInput>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try{
        const userData = userSchema.parse(req.body);

        const newUser = await createUser(userData);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: newUser._id,
                email: newUser.email,
            },
        })
    } catch(err) {
        next(err);
    }
}

export const login = async (
    req: Request<{}, {}, UserLoginInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const body: UserLoginInput = userLoginSchema.parse(req.body);

        const user = await authenticateUser(body);
        const { accessToken } = await generateTokens(user);

        res.status(200).json({
            success: true,
            message: "Logged in",
            data: {
                accessToken,
                user: { id: user._id, email: user.email },
            }
        })
    } catch(err) {
        next(err);
    }
}