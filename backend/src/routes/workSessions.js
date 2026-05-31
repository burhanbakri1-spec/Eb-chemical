import { Router } from "express";
import { persistStore, workSessions } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isStaffRole(role) {
  return role === "employee" || role === "staff";
}

function findOpenSession(user) {
  return workSessions.find(
    (session) => session.employeeId === user.id && session.date === todayKey() && !session.logoutTime,
  );
}

router.post("/start", (req, res) => {
  if (!isStaffRole(req.user.role)) {
    return res.status(403).json({ message: "Only employees can start work sessions." });
  }

  let session = findOpenSession(req.user);
  if (!session) {
    session = {
      id: `session-${Date.now()}`,
      employeeId: req.user.id,
      employeeName: req.user.name,
      date: todayKey(),
      loginTime: new Date().toISOString(),
      logoutTime: null,
    };
    workSessions.unshift(session);
    persistStore();
  }
  return res.json(session);
});

router.post("/end", (req, res) => {
  const session = findOpenSession(req.user);
  if (!session) return res.status(404).json({ message: "No open work session." });

  session.logoutTime = new Date().toISOString();
  persistStore();
  return res.json(session);
});

router.get("/my-today", (req, res) => {
  if (!isStaffRole(req.user.role)) return res.json(null);
  return res.json(findOpenSession(req.user) || null);
});

router.get("/employees", (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return res.json(workSessions);
});

router.get("/employees/:employeeId", (req, res) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.employeeId) {
    return res.status(403).json({ message: "Work session access denied." });
  }
  return res.json(workSessions.filter((session) => session.employeeId === req.params.employeeId));
});

export default router;
