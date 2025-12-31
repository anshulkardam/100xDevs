import z from "zod";

export const userRegisterValidator = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["teacher", "student"]),
});

export const userLoginValidator = z.object({
  email: z.email(),
  password: z.string(),
});
