import { Router } from "express";
import { startAttendance } from "../controllers/attendance.cont";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { ValidatePayload } from "../middleware/validatePayload";
import { getClassValidator } from "../validators/class.validator";

const router = Router();

router.post(
  "/start",
  authenticate,
  authorize(["teacher"]),
  ValidatePayload(getClassValidator),
  startAttendance
);

export default router;
