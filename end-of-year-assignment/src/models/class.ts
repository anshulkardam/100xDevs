import { model, Schema, Types } from "mongoose";

type IClass = {
  className: string;
  teacherId: Types.ObjectId;
  studentIds: Types.ObjectId[];
};

const classSchema = new Schema<IClass>(
  {
    className: {
      type: String,
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    studentIds: {
      type: [Schema.Types.ObjectId],
      ref: "user",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const ClassModel = model<IClass>("class", classSchema);
