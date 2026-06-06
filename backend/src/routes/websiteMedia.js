import { Router } from "express";
import { persistStore, websiteMedia } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const allowedRoles = new Set(["admin", "manager", "employee", "staff"]);
const mediaPermission = "website_media.manage";

function requireMediaEditor(req, res, next) {
  if (!allowedRoles.has(req.user?.role)) {
    return res.status(403).json({ message: "Admin or employee access required." });
  }

  if (req.user?.role !== "admin" && !req.user?.permissions?.includes(mediaPermission)) {
    return res.status(403).json({ message: "Website media permission required." });
  }

  return next();
}

function sortMedia(items) {
  return [...items].sort((a, b) => {
    const groupComparison = String(a.groupKey || "").localeCompare(String(b.groupKey || ""));
    return groupComparison || Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  });
}

function normalizeMedia(input, existing = {}) {
  return {
    ...existing,
    ...input,
    id: input.id || existing.id || `website-media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sectionKey: input.sectionKey || existing.sectionKey || "custom_section",
    sectionLabel: input.sectionLabel || existing.sectionLabel || input.sectionKey || "Website image",
    groupKey: input.groupKey || existing.groupKey || "sections",
    imageUrl: input.imageUrl ?? input.image_url ?? existing.imageUrl ?? "",
    title: input.title ?? existing.title ?? "",
    subtitle: input.subtitle ?? existing.subtitle ?? "",
    linkUrl: input.linkUrl ?? input.link_url ?? existing.linkUrl ?? "",
    sortOrder: Number(input.sortOrder ?? input.sort_order ?? existing.sortOrder ?? 0),
    isActive: input.isActive !== false,
    createdAt: existing.createdAt || input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

router.get("/", (_req, res) => {
  res.json(sortMedia(websiteMedia.filter((item) => item.isActive !== false)));
});

router.get("/all", requireAuth, requireMediaEditor, (_req, res) => {
  res.json(sortMedia(websiteMedia));
});

router.get("/:sectionKey", (req, res) => {
  res.json(sortMedia(websiteMedia.filter(
    (item) => item.sectionKey === req.params.sectionKey && item.isActive !== false,
  )));
});

router.post("/", requireAuth, requireMediaEditor, async (req, res) => {
  const item = normalizeMedia(req.body);
  websiteMedia.push(item);
  await persistStore();
  return res.status(201).json(item);
});

router.put("/:id", requireAuth, requireMediaEditor, async (req, res) => {
  const index = websiteMedia.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Website media item not found." });

  websiteMedia[index] = normalizeMedia({ ...req.body, id: req.params.id }, websiteMedia[index]);
  await persistStore();
  return res.json(websiteMedia[index]);
});

router.delete("/:id", requireAuth, requireMediaEditor, async (req, res) => {
  const index = websiteMedia.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Website media item not found." });

  websiteMedia.splice(index, 1);
  await persistStore();
  return res.status(204).end();
});

export default router;
