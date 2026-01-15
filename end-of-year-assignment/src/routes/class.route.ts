import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { addStudent, createClass, getAttendance, getClass } from "../controllers/class.cont";
import { authorize } from "../middleware/authorize";
import { ValidatePayload } from "../middleware/validatePayload";
import { AddStudentValidator, createClassValidator } from "../validators/class.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["teacher"]),
  ValidatePayload(createClassValidator),
  createClass
);

router.post(
  "/:id/add-student",
  authenticate,
  authorize(["teacher"]),
  ValidatePayload(AddStudentValidator),
  addStudent
);

router.get("/:id", authenticate, authorize(["teacher", "student"]), getClass);

router.get("/:id/my-attendance", authenticate, authorize(["student"]), getAttendance);

export default router;
