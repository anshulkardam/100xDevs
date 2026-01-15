import z from "zod";

export const createClassValidator = z.object({
  className: z.string(),
});

export const AddStudentValidator = z.object({
  studentId: z.string(),
});

export const getClassValidator = z.object({
  classId: z.string(),
});
