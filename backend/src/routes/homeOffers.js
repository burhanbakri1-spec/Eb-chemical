import { Router } from "express";
import { categoryCards, offers, persistStore } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function sortOffers(items) {
  return [...items].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

function sortCategoryCards(items) {
  return [...items].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

router.get("/", (_req, res) => {
  res.json(sortOffers(offers.filter((offer) => offer.isActive)));
});

router.get("/all", requireAuth, (_req, res) => {
  res.json(sortOffers(offers));
});

router.get("/category-cards", (_req, res) => {
  res.json(sortCategoryCards(categoryCards.filter((card) => card.isActive !== false)));
});

router.get("/category-cards/all", requireAuth, (_req, res) => {
  res.json(sortCategoryCards(categoryCards));
});

router.put("/category-cards/:key", requireAuth, async (req, res) => {
  const index = categoryCards.findIndex((card) => card.key === req.params.key);
  if (index === -1) return res.status(404).json({ message: "Category card not found." });

  categoryCards[index] = {
    ...categoryCards[index],
    ...req.body,
    key: req.params.key,
    updatedAt: new Date().toISOString(),
  };
  await persistStore();
  return res.json(categoryCards[index]);
});

router.post("/", requireAuth, async (req, res) => {
  const offer = {
    ...req.body,
    id: req.body.id || `offer-${Date.now()}`,
    isActive: req.body.isActive !== false,
  };
  offers.unshift(offer);
  await persistStore();
  res.status(201).json(offer);
});

router.put("/:id", requireAuth, async (req, res) => {
  const index = offers.findIndex((offer) => offer.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Offer not found." });

  offers[index] = { ...offers[index], ...req.body, id: req.params.id };
  await persistStore();
  return res.json(offers[index]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const index = offers.findIndex((offer) => offer.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Offer not found." });

  offers.splice(index, 1);
  await persistStore();
  return res.status(204).end();
});

export default router;
