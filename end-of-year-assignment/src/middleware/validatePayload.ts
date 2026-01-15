import z, { success } from "zod";
import { Request, Response, NextFunction } from "express";

export const ValidatePayload =
  (schema: z.ZodType) => async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.safeParseAsync(req.body);

    if (!parsed.success) {
      const formattedErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }));

      return res.status(400).json({
        success: false,
        error: "Invalid request schema",
      });
    }

    next();
  };
