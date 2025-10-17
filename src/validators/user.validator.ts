import * as z from "zod";
import { PASSWORD_REGEX} from "../utils/regex.js";

export const userSchema = z.object({
    email: z.email(),
    password: z.string().regex(PASSWORD_REGEX, "Weak Password"),
}).strip();

export const userLoginSchema = z.object({
    email: z.email(),
    password: z.string(),
});