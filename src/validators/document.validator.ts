import { z } from "zod";
import { FILENAME_REGEX, TAG_REGEX } from "../utils/regex.js";

export const documentSchema = z.object({
    filename: z.string()
        .min(1)
        .max(100)
        .regex(FILENAME_REGEX, "Invalid filename"),
    mime: z.enum(["text/plain", "text/csv"]).default("text/plain"),
    textContent: z.string().min(0),
    primaryTag: z.string()
        .min(1)
        .max(50)
        .regex(TAG_REGEX, "Invalid tag name: only letters, numbers, and _ are allowed"),
    secondaryTags: z.array(
        z.string()
            .min(1)
            .max(50)
            .regex(TAG_REGEX, "Invalid tag name: only letters, numbers, and _ are allowed")
        ),
});

export const updateDocumentSchema = z.object({
    filename: z.string()
        .min(1)
        .max(100)
        .regex(FILENAME_REGEX, "Invalid filename").optional(),
    textContent: z.string().min(0).optional(),
    mime: z.enum(["text/plain", "text/csv"]).optional(),
});
