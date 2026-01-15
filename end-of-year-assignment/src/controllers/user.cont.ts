import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
import { userLoginValidator } from "../validators/user";

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role } = req.body;

    if (await UserModel.exists({ email })) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hash,
      role,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
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

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({ success: false, error: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ success: false, error: "Invalid email or password" });
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
    const user = await UserModel.findById(req.user!.id).select("-password");

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}
