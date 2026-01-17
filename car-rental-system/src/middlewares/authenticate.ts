import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/errorHandler";
import { VerifyToken } from "../lib/jwt";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      throw new CustomError("Invalid Token", 401, "Unauthorized");
    }

    const token = auth?.split(" ")[1];

    if (!token) {
      throw new CustomError("Invalid Token", 401, "Unauthorized");
    }

    const verify = await VerifyToken(token);

    req.user = {
      userId: verify.userId,
      username: verify.username,
    };

    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
}
