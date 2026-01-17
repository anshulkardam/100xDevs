import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/errorHandler";
import { prisma } from "../lib/prisma";

export async function createBooking(
  req: Request<
    never,
    never,
    {
      carName: string;
      days: number;
      rentPerDay: number;
    },
    never
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    const { carName, days, rentPerDay } = req.body;

    if (!carName || !days || !rentPerDay) {
      throw new CustomError("Missing Required Fields", 400, "BadRequest");
    }

    const booking = await prisma.booking.create({
      data: {
        car_name: carName,
        days,
        rent_per_day: rentPerDay,
        status: "BOOKED",
        user_id: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: booking.id,
        totalCost: days * rentPerDay,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

export async function getBookings(
  req: Request<never, never, never, { bookingId?: string; summary?: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const bookingId = req.query.bookingId;
    const summary = req.query.summary || false;
    const userId = req.user!.userId;

    if (bookingId) {
      const data = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          user_id: userId,
        },
      });

      if (!data) {
        throw new CustomError("Booking not found", 404, "NotFound");
      }

      const totalCost = data.days * data.rent_per_day;

      res.status(200).json({
        success: true,
        data: {
          id: data.id,
          car_name: data.car_name,
          days: data.days,
          rent_per_day: data.rent_per_day,
          status: data.status,
          totalCost: totalCost,
        },
      });
    }
    if (summary === "true") {
      const bookings = await prisma.booking.findMany({
        where: {
          user_id: userId,
          status: {
            in: ["BOOKED", "COMPLETED"],
          },
        },
      });

      const totalAmount = bookings.reduce((sum, b) => sum + b.days * b.rent_per_day, 0);

      return res.status(200).json({
        success: true,
        data: {
          userId,
          username: req.user!.username,
          totalBookings: bookings.length,
          totalAmountSpent: totalAmount,
        },
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
}

export async function updateBooking(
  req: Request<
    { bookingId: string },
    never,
    {
      carName?: string;
      days?: number;
      rentPerDay?: number;
    },
    never
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, user_id: userId },
    });

    if (!booking) {
      throw new CustomError("Booking not found", 404, "NOT_FOUND");
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        car_name: req.body.carName,
        days: req.body.days,
        rent_per_day: req.body.rentPerDay,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        message: "Booking updated successfully",
        booking: {
          ...updated,
          totalCost: updated.days * updated.rent_per_day,
        },
      },
    });
  } catch (err) {
    console.error(err);
    next();
  }
}

export async function deleteBooking(
  req: Request<{ bookingId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        user_id: req.user!.userId,
      },
    });

    if (!booking) {
      throw new CustomError("Booking not found", 404, "NotFound");
    }

    if (booking.user_id !== req.user!.userId) {
      throw new CustomError("Booking does not belong to this user", 403, "Forbidden");
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    res.status(200).json({
      success: true,
      data: {
        message: "Booking deleted successfully",
      },
    });
  } catch (err) {
    next(err);
  }
}
