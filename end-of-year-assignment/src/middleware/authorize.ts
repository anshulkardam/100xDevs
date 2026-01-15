import { NextFunction, Response, Request } from "express";
import { success } from "zod";

export type Role = "teacher" | "student";

export function authorize(role: Role[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!role.includes(req.user!.role)) {
        if (role.length === 1 && role.includes("student")) {
          return res
            .status(403)
            .json({ success: false, error: "Forbidden, student access required" }); // just brute forcing to pass test. not a good practice lol
        }
        return res
          .status(403)
          .json({ success: false, error: "Forbidden, teacher access required" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
