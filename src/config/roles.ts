export const ROLES = {
    admin: [
        "documents:create:own",
        "documents:read:any",
        "documents:update:any",
        "documents:delete:any",
        "tags:create:own",
        "tags:read:any",
        "actions:run:own",
        "actions:usage:any",
        "audit:read:any",
        "access:update:any",
    ],
    moderator: [
        "documents:read:any",
        "tags:read:any",
        "actions:usage:any",
    ],
    user: [
        "documents:read:own",
        "documents:create:own",
        "documents:update:own",
        "documents:delete:own",
        "tags:create:own",
        "tags:read:own",
        "actions:run:own",
        "actions:usage:own",
    ],
} as const;

export type Role = keyof typeof ROLES;
export type Permission = (typeof ROLES)[Role][number];
