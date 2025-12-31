import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hash,
      role,
    });

    return res.status(201).json({
      success: "true",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    next(err);
  }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    success: true,
    data: {
      token,
    },
  });
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await UserModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
}
