import { Router } from "express";
import authRoutes from "./user.route";
import classRoutes from "./class.route";
import attendanceRoutes from "./attendance.router";
import { getStudents } from "../controllers/class.cont";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/class", classRoutes);
router.get("/students", authenticate, authorize(["teacher"]), getStudents);
router.use("/attendance", attendanceRoutes);

export default router;
