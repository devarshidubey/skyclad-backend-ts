
import { z } from "zod";

const messageSchema = z.object({
    role: z.enum(["user", "system", "assistant"]), // can extend roles if needed
    content: z.string().min(1)
});

const actionsSchema = z.array(z.enum(["make_document", "make_csv"]))
    .nonempty("At least one action is required");

const scopeSchema = z.object({
    type: z.enum(["folder", "file"]),
    name: z.string().min(1),
    folder: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.type === "file" && !data.folder) {
        ctx.addIssue({
            code: "custom",
            message: "folder field is required when type is 'file'",
            path: ["folder"]
        });
    }
    if (data.type === "folder" && data.folder) {
        ctx.addIssue({
            code: "custom",
            message: "folder field must not be present when type is 'folder'",
            path: ["folder"]
        });
    }
});

export const actionSchema = z.object({
    scope: scopeSchema,
    messages: z.array(messageSchema).min(1),
    actions: actionsSchema
});
