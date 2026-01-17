import type { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  public statusCode: number;
  public timestamp: string;
  public type: string;
  public details?: string | undefined;
  public path?: string | undefined;

  constructor(message: string, statusCode: number, type: string, details?: string, path?: string) {
    super(message);
    ((this.statusCode = statusCode), (this.details = details), (this.path = path));
    this.type = type;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export async function ErrorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("Common error handler", err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message ?? "Internal Server Error",
  });
}
