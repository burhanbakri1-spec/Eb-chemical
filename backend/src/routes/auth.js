import { Router } from "express";
import { persistStore, sessions, users, workSessions } from "../data/store.js";
import { getSessionUser, publicUser, requireAuth } from "../middleware/auth.js";

const router = Router();

function createToken() {
  return `ep-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function startEmployeeSession(user) {
  if (user.role !== "employee") return null;
  const today = new Date().toISOString().slice(0, 10);
  let session = workSessions.find(
    (entry) => entry.employeeId === user.id && entry.date === today && !entry.logoutTime,
  );
  if (!session) {
    session = {
      id: `session-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      date: today,
      loginTime: new Date().toISOString(),
      logoutTime: null,
    };
    workSessions.unshift(session);
    persistStore();
  }
  return session;
}

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (entry) => entry.email === email && entry.password === password && entry.isActive !== false,
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = createToken();
  sessions.set(token, user);
  return res.json({
    token,
    user: publicUser(user),
    workSession: startEmployeeSession(user),
  });
});

router.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;
  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const user = {
    id: `customer-${Date.now()}`,
    name,
    email,
    phone,
    password,
    role: "customer",
    permissions: [],
    ebPoints: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    isActive: true,
  };
  users.push(user);
  persistStore();
  const token = createToken();
  sessions.set(token, user);
  return res.status(201).json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

router.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const user = getSessionUser(req);
  if (token) sessions.delete(token);

  let workSession = null;
  if (user?.role === "employee") {
    workSession = workSessions.find((entry) => entry.employeeId === user.id && !entry.logoutTime);
    if (workSession) {
      workSession.logoutTime = new Date().toISOString();
      persistStore();
    }
  }

  res.json({ workSession });
});

export default router;
