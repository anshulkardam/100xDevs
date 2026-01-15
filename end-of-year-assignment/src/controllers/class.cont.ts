import { NextFunction, Request, Response } from "express";
import { ClassModel } from "../models/class";
import { Types } from "mongoose";
import { UserModel } from "../models/user";
import { AttendanceModel } from "../models/attendance";

export async function createClass(
  req: Request<never, never, { className: string }, never>,
  res: Response,
  next: NextFunction
) {
  try {
    const { className } = req.body;

    const newClass = await ClassModel.create({
      className,
      teacherId: req.user?.id,
    });

    if (!newClass) {
      return res.status(500).json({ msg: "internal server error" });
    }

    return res.status(201).json({
      success: true,
      data: {
        _id: newClass._id,
        teacherId: newClass.teacherId,
        className: newClass.className,
        studentIds: newClass.studentIds,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addStudent(
  req: Request<{ id: string }, never, { studentId: string }, never>,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = req.body;
    const { id } = req.params;

    const student = await UserModel.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const className = await ClassModel.findById(id);

    if (!className) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    const userId = new Types.ObjectId(req.user!.id);

    if (!className.teacherId.equals(userId)) {
      return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    if (className.studentIds.some((id) => id.equals(student._id))) {
      return res.status(200).json({ success: true, data: className });
    }

    className.studentIds.push(student._id);

    const updatedClass = await className.save();

    return res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (err) {
    next(err);
  }
}

export async function getClass(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const className = await ClassModel.findById(id).populate("studentIds").lean();

    if (!className) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    const { studentIds, ...rest } = className;

    const userId = new Types.ObjectId(req.user!.id);

    if (req.user!.role === "teacher" && !rest.teacherId.equals(userId)) {
      return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    if (req.user!.role === "student" && !studentIds.some((s) => s._id.equals(userId))) {
      return res.status(403).json({ success: false, error: "Forbidden, not class teacher" });
    }

    const result = {
      ...rest,
      students: studentIds,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await UserModel.find({ role: "student" }).select("-password").lean();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const classDoc = await ClassModel.findById(id).lean();

    if (!classDoc) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    const userId = req.user!.id.toString();

    const isEnrolled = classDoc.studentIds.some((s) => s.toString() === userId);

    if (!isEnrolled) {
      return res.status(403).json({ success: false, error: "Forbidden, not enrolled in class" });
    }

    const attendance = await AttendanceModel.findOne({
      classId: classDoc._id,
      studentId: req.user!.id,
    })
      .select("status")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        classId: classDoc._id,
        status: attendance?.status ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}
