import { model, Schema, Types } from "mongoose";

export type IAttendance = {
  classId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: "present" | "absent";
};

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "absent",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true }); //prevent data rewrite for attendance.

export const AttendanceModel = model<IAttendance>("attendance", attendanceSchema);
