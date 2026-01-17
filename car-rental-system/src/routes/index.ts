import { Router } from "express";
import authRouter from "./auth.route";
import bookingRouter from "./booking.route";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    version: 1,
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRouter);

router.use("/bookings", bookingRouter);

export default router;
