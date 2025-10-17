export const ROLES = {
    admin: [
        "documents:create:own",
        "documents:read:any",
        "documents:update:any",
        "documents:delete:any",
        "actions:usage:any"
    ],
    moderator: [
        "documents:read:any",
        "actions:usage:any",
    ],
    user: [
        "documents:read:own",
        "documents:create:own",
        "documents:update:own",
        "documents:delete:own",
        "actions:run:own",
        "actions:usage:own",
    ],
} as const;

export type Role = keyof typeof ROLES;
export type Permission = (typeof ROLES)[Role][number];
