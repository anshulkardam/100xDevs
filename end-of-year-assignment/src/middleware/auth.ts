import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
export async function auth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ msg: "Not Authorized" });
  }

  const [_, token] = authorization.split(" ");

  if (!token) {
    return res.status(401).json({ msg: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    
    req.user = {
      id: decoded.id as any,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
