import { ROLES, type Role as RoleName, type Permission } from "../config/roles.js";

type AccessLevel = "any" | "own" | "none";

export class Role {
    static getAccessLevel(role: RoleName, action: string): AccessLevel {
        const perms = ROLES[role] as readonly string[];

        if (perms.includes(`${action}:any`)) return "any";
        if (perms.includes(`${action}:own`)) return "own";
        return "none";
    }

  static getPermissions(role: RoleName) {
    return ROLES[role];
  }
}
