import { Router } from "express";
import { createBooking, deleteBooking, getBookings, updateBooking } from "../controllers/booking.cont";
import { authenticate } from "../middlewares/authenticate";

const bookingRouter: Router = Router()

bookingRouter.post("/", authenticate, createBooking)

bookingRouter.get("/", authenticate, getBookings)

bookingRouter.put("/:bookingId", authenticate, updateBooking)

bookingRouter.delete("/:bookingId", authenticate, deleteBooking)

export default bookingRouter