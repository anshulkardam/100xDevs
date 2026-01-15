export type AttendanceStatus = "present" | "absent";

export interface ActiveSession {
  classId: string;
  startedAt: string;
  attendance: Record<string, AttendanceStatus>;
}

let activeSession: ActiveSession | null = null;

export function getActiveSession() {
  return activeSession;
}

export function startSession(classId: string) {
  activeSession = {
    classId,
    startedAt: new Date().toISOString(),
    attendance: {},
  };
  return activeSession;
}

export function updateAttendance(studentId: string, status: AttendanceStatus) {
  if (!activeSession) throw new Error("No active session");
  activeSession.attendance[studentId] = status;
}

export function clearSession() {
  activeSession = null;
}
