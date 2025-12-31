import { model, Schema } from "mongoose";

type IUser = {
  name: string;
  email: string;
  password: string;
  role: "teacher" | "student";
};

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>("user", userSchema);
