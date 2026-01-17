import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/errorHandler";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { SignToken } from "../lib/jwt";

export async function signup(
  req: Request<never, never, { username: string; password: string }, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !password) {
      throw new CustomError("Missing Required Fields", 400, "BadRequest");
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hash,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return next(new CustomError("Username already exists", 409, "Conflict"));
    }
    next(err);
  }
}

export async function login(
  req: Request<never, never, { username: string; password: string }, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new CustomError("Missing Required Fields", 400, "BadRequest");
    }

    const user = await prisma.user.findUnique({ where: { username: username } });

    if (!user) {
      throw new CustomError("User not found", 404, "NotFound");
    }

    const verifyPass = await bcrypt.compare(password, user.password);

    if (!verifyPass) {
      throw new CustomError("Invalid Credentials", 401, "InvalidCredentials");
    }

    const token = await SignToken({
      userId: user.id,
      username: user.username,
    });

    res.status(200).json({
      success: true,
      data: {
        message: "Login successful",
        token: token,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}
