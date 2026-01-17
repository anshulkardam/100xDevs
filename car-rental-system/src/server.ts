import express from "express";
import helmet from "helmet";
import cors from "cors";
import v1Routes from "./routes";
import { ErrorHandler } from "./utils/errorHandler";
import { CONFIG } from "./lib/config";
import { prisma } from "./lib/prisma";
const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json());

async function start() {
  try {
    await prisma.$connect();

    app.use("/api/v1", v1Routes);

    app.use(ErrorHandler);

    app.listen(CONFIG.PORT, () =>
      console.log(`Server listening at http://localhost:${CONFIG.PORT}/api/v1`),
    );
  } catch (error) {
    console.error("Error Starting Server:", error);
    process.exit(1);
  }
}

start();

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
