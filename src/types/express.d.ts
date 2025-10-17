import { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "admin" | "moderator" | "user";
        accessLevel?: AccessLevel;
        iat?: number;
        exp?: number;
      } & Partial<IUser>;
    }
  }
}
