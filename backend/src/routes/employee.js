import { Router } from "express";
import { persistStore, users, workSessions } from "../data/store.js";
import { publicUser, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, (_req, res) => {
  res.json(users.filter((user) => user.role === "employee").map(publicUser));
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const employee = {
    ...req.body,
    id: req.body.id || `employee-${Date.now()}`,
    role: "employee",
    password: req.body.password || "employee123",
    permissions: req.body.permissions || ["dashboard.view", "products.view", "orders.view"],
    isActive: req.body.isActive !== false,
  };
  users.push(employee);
  await persistStore();
  res.status(201).json(publicUser(employee));
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const employee = users.find((user) => user.id === req.params.id && user.role === "employee");
  if (!employee) return res.status(404).json({ message: "Employee not found." });

  Object.assign(employee, req.body, { id: employee.id, role: "employee" });
  await persistStore();
  return res.json(publicUser(employee));
});

router.put("/:id/permissions", requireAuth, requireAdmin, async (req, res) => {
  const employee = users.find((user) => user.id === req.params.id && user.role === "employee");
  if (!employee) return res.status(404).json({ message: "Employee not found." });

  employee.permissions = req.body.permissions || [];
  await persistStore();
  return res.json(publicUser(employee));
});

router.put("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const employee = users.find((user) => user.id === req.params.id && user.role === "employee");
  if (!employee) return res.status(404).json({ message: "Employee not found." });

  employee.isActive = Boolean(req.body.isActive);
  await persistStore();
  return res.json(publicUser(employee));
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const index = users.findIndex((user) => user.id === req.params.id && user.role === "employee");
  if (index === -1) return res.status(404).json({ message: "Employee not found." });

  users.splice(index, 1);
  await persistStore();
  return res.status(204).end();
});

router.get("/work-sessions", requireAuth, requireAdmin, (_req, res) => {
  res.json(workSessions);
});

export default router;
