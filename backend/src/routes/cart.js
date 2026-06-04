import { Router } from "express";
import { carts, persistStore } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(carts.get(req.user.id) || []);
});

router.put("/", async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  carts.set(req.user.id, items);
  await persistStore();
  res.json(items);
});

router.delete("/", async (req, res) => {
  carts.delete(req.user.id);
  await persistStore();
  res.status(204).end();
});

export default router;
