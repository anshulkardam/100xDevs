import { NextFunction, Response, Request } from "express";
import { ClassModel } from "../models/class";
import { ActiveSession, getActiveSession, startSession } from "./session";

export async function startAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { classId } = req.body;

    const className = await ClassModel.findById(classId).lean();

    if (!className) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    if (className.teacherId.toString() !== req.user?.id.toString()) {
      return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    const session = startSession(className._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        classId: session.classId,
        startedAt: session.startedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
