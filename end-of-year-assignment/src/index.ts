import express from "express";
import cors from "cors";
import authRoutes from "./routes/user.route";
import classRoutes from "./routes/class.route";
import attendanceRoutes from "./routes/attendance.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/class", classRoutes);
app.use("/attendance", attendanceRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
