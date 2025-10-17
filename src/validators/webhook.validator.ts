import { z } from "zod";

export const ocrSchema = z.object({
    source: z.string()
        .min(1),
    imageId: z.string()
        .min(1)
        .max(50),
    text: z.string()
        .max(1000).trim(),
    meta: z.object({
        address: z.string().min(1).max(300)
    })
})