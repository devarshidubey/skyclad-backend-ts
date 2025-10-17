import { User } from "../../models/User.js";
import HTTPError from "../../utils/HTTPError.js";
import { hashPassword, verifyPassword } from "../../utils/hash.js";
import { z } from "zod";
import { userSchema } from "../../validators/user.validator.js";
import type { IUser } from "../../models/User.js";
import type { HydratedDocument } from "mongoose"

type UserInput = z.infer<typeof userSchema>;

export const createUser = async (user: UserInput): Promise<HydratedDocument<IUser>>=> {
    const existing = await User.findOne({
            email: user.email,
    });
    if(existing) {
        throw new HTTPError(409, "User with this username/email already exists");
    }
    
    user.password = await hashPassword(user.password);
    const newUser = await User.create(user);
    return newUser;
}

export const authenticateUser = async (
    { email, password }: { email: string, password: string }
): Promise<HydratedDocument<IUser>> => {
    const user = await User.findOne({ email });
    if(!user) throw new HTTPError(401, "Invalid credentials");

    const valid = await verifyPassword(password, user.password); 
    if(!valid) throw new HTTPError(401, "Invalid credentials");

    return user;
}