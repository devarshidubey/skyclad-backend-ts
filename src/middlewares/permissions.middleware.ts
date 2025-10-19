import HTTPError from "../utils/HTTPError.js";
import type { Request, Response, NextFunction } from "express";
import { hasPermission } from "../utils/permissions.js";
import type { Permission } from "../config/roles.js";
import { Role } from "../utils/rbac.js";

export function authorizePermission(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const accessLevel = Role.getAccessLevel(req.user!.role, action);

    if (accessLevel === "none") {
      throw new HTTPError(403, "Forbidden: insufficient permissions");
    }
    req.user!.accessLevel = accessLevel; 
    next();
  };
}

