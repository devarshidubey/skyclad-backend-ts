export const ROLES = {
    admin: [
        "documents:create:own",
        "documents:read:any",
        "documents:update:any",
        "documents:delete:any",
        "tags:read:any",
        "tags:update:any",
        "tags:delete:any",
        "actions:run:any",
        "usage:view:any",
    ],
    moderator: [
        "documents:read:any",
        "tags:read:any",
        "usage:view:any",
    ],
    user: [
        "documents:read:own",
        "documents:create:own",
        "documents:update:own",
        "documents:delete:own",
        "tags:read:own",
        "tags:create:own",
        "actions:run:own",
        "usage:view:own",
    ],
} as const;

export type Role = keyof typeof ROLES;
export type Permission = (typeof ROLES)[Role][number];
