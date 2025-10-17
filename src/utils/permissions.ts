import { ROLES, type Permission, type Role } from "../config/roles.js";

export function hasPermission(role: Role, permission: Permission): boolean {
    return (ROLES[role] as readonly Permission[]).includes(permission);
}
