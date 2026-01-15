import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
import { Role } from "./authorize";
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (typeof token !== "string" || token.trim().length === 0) {
    return res.status(401).json({ success: false, error: "Unauthorized, token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: Role;
    };

    req.user = {
      id: decoded.id as any,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Unauthorized, token missing or invalid" });
  }
}
