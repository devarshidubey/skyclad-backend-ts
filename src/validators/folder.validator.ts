import { z } from "zod";
import { TAG_REGEX } from "../utils/regex.js";

export const folderSchema = z.object({
    primaryTag: z
        .string()
        .regex(TAG_REGEX, "Invalid Tag Name")
});
