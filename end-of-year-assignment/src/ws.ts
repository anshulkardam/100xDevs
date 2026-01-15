import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./utils/constants";
import { Role } from "./middleware/authorize";
import { clearSession, getActiveSession } from "./controllers/session";
import { ClassModel } from "./models/class";
import { AttendanceModel } from "./models/attendance";

let clients: WebSocket[] = [];

export function startWebSocketServer(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = new URL(req.url!, `http://${req.headers.host}`);

    if (pathname !== "/ws") {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    const sendAuthError = () => {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Unauthorized or invalid token" },
        })
      );
      ws.close(1008, "Unauthorized");
    };

    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token || token.trim() === "") {
        sendAuthError();
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: Role };

      (ws as any).user = decoded;
    } catch (err) {
      sendAuthError();
      return;
    }

    // only authenticated clients
    clients.push(ws);

    ws.on("message", async (data) => {
      const user = (ws as any).user;

      const session = getActiveSession();

      if (!session) {
        ws.send(
          JSON.stringify({ event: "ERROR", data: { message: "No active attendance session" } })
        );
        return;
      }

      if (user.role === "teacher") {
        const className = await ClassModel.findById(session.classId).lean();

        if (className && className.teacherId.toString() !== user.id.toString()) {
          ws.send(
            JSON.stringify({ event: "ERROR", data: { message: "No active attendance session" } })
          );
          return;
        }
      }

      const msg = JSON.parse(data.toString()) as {
        event: "ATTENDANCE_MARKED" | "TODAY_SUMMARY" | "MY_ATTENDANCE" | "DONE";
        data: any;
      };

      if (msg.event === "ATTENDANCE_MARKED") {
        if (user.role !== "teacher") {
          ws.send(
            JSON.stringify({ event: "ERROR", data: { message: "Forbidden, teacher event only" } })
          );
          return;
        }

        session.attendance[msg.data.studentId] = msg.data.status;

        // Send immediate response to teacher
        ws.send(
          JSON.stringify({
            event: "ATTENDANCE_MARKED",
            data: {
              studentId: msg.data.studentId,
              status: msg.data.status,
            },
          })
        );

        // Small delay before broadcasting to others
        setTimeout(() => {
          clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN && c !== ws) {
              c.send(
                JSON.stringify({
                  event: "ATTENDANCE_MARKED",
                  data: {
                    studentId: msg.data.studentId,
                    status: msg.data.status,
                  },
                })
              );
            }
          });
        }, 50); // 50ms delay
      } else if (msg.event === "MY_ATTENDANCE") {
        if (user.role !== "student") {
          ws.send(
            JSON.stringify({
              event: "ERROR",
              data: { message: "Forbidden, student event only" },
            })
          );
          return;
        }

        const status = session.attendance[user.id] ?? "not yet updated";

        ws.send(
          JSON.stringify({
            event: "MY_ATTENDANCE",
            data: { status },
          })
        );
      } else if (msg.event === "TODAY_SUMMARY") {
        if (user.role !== "teacher") {
          ws.send(
            JSON.stringify({
              event: "ERROR",
              data: { message: "Forbidden, teacher event only" },
            })
          );
          return;
        }

        const values = Object.keys(session.attendance);

        const present = values.filter((v) => v === "present").length;

        const absent = values.filter((v) => v === "absent").length;

        // Send immediate response to teacher
        ws.send(
          JSON.stringify({
            event: "TODAY_SUMMARY",
            data: {
              present,
              absent,
              total: present + absent,
            },
          })
        );

        // Small delay before broadcasting to others
        setTimeout(() => {
          clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN && c !== ws) {
              c.send(
                JSON.stringify({
                  event: "TODAY_SUMMARY",
                  data: {
                    present,
                    absent,
                    total: present + absent,
                  },
                })
              );
            }
          });
        }, 50); // 50ms delay
      } else if (msg.event === "DONE") {
        if (user.role !== "teacher") {
          ws.send(
            JSON.stringify({
              event: "ERROR",
              data: { message: "Forbidden, teacher event only" },
            })
          );
          return;
        }

        const className = await ClassModel.findById(session.classId).lean();

        if (!className) {
          return;
        }

        const allStudentIds = className.studentIds.map((s) => s.toString());

        for (const sid of allStudentIds) {
          const status = session.attendance[sid] ?? "absent";
          await AttendanceModel.create({
            classId: session.classId,
            studentId: sid,
            status,
          });
        }

        const values = Object.values(session.attendance);
        const present = values.filter((v) => v === "present").length;
        const absent = allStudentIds.length - present;

        clearSession();

        clients.forEach(
          (c) =>
            c.readyState === WebSocket.OPEN &&
            c.send(
              JSON.stringify({
                event: "DONE",
                data: {
                  message: "Attendance persisted",
                  present,
                  absent,
                  total: allStudentIds.length,
                },
              })
            )
        );
      }
    });

    ws.on("close", () => {
      clients = clients.filter((c) => c !== ws);
    });
  });
}
