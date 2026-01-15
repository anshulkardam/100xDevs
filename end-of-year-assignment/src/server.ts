import express from "express";
import cors from "cors";
import { connectToDatabase, disconnectFromDatabase } from "./utils/mongoose";
import v1Routes from "./routes";
import { config } from "./utils/config";
import http from "http";
import { startWebSocketServer } from "./ws";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await connectToDatabase();

    app.use(v1Routes);

    startWebSocketServer(server);

    server.listen(3000, () => {
      console.log("Server + ws running on http://localhost:3000");
    });
  } catch (error) {
    console.error("Failed to start the server", error);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();

    console.log("Server Shutdown!");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown", error);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
