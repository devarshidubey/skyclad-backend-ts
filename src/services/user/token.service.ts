import jwt from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../../models/User.js";


export const generateTokens = async (user: HydratedDocument<IUser>)=> {
    const secret = process.env.JWT_ACCESS_SECRET!;
    const accessToken = jwt.sign(
        {id: user._id, email: user.email, role: user.role},
        secret,
        {expiresIn: "7d"},
    )

    return {accessToken: accessToken};
}
