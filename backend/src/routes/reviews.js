import { Router } from "express";
import { orders, persistStore, reviews } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function isStaffRole(role) {
  return role === "employee" || role === "staff";
}

function visibleReviews(items) {
  return items
    .filter((review) => review.isActive && review.isApproved !== false && review.status === "approved")
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

router.get("/", (_req, res) => {
  res.json(visibleReviews(reviews).filter((review) => review.type === "store"));
});

router.get("/all", requireAuth, (req, res) => {
  if (isStaffRole(req.user.role)) {
    return res.json(reviews.filter((review) => review.employeeId === req.user.id));
  }
  return res.json(reviews);
});

router.post("/", requireAuth, (req, res) => {
  const order = req.body.orderId
    ? orders.find((entry) => entry.id === req.body.orderId)
    : orders.find((entry) => entry.customerUserId === req.user.id);

  if (
    req.user.role === "customer" &&
    (!order || order.customerUserId !== req.user.id)
  ) {
    return res.status(403).json({ message: "A completed interaction is required before reviewing." });
  }

  const type =
    req.body.type === "employee" || req.body.employeeId ? "employee" : "store";

  const review = {
    ...req.body,
    id: req.body.id || `review-${Date.now()}`,
    type,
    customerName: req.body.customerName || req.user.name || "Customer",
    employeeId: type === "employee" ? req.body.employeeId || order?.handledByEmployeeId || order?.assignedToEmployeeId || "" : "",
    employeeName: req.body.employeeName || order?.createdByEmployeeName || "",
    orderId: req.body.orderId || order?.id || "",
    createdAt: req.body.createdAt || new Date().toISOString(),
    status: req.user.role === "customer" ? "pending" : req.body.status || "approved",
    isApproved: req.user.role === "customer" ? false : req.body.status !== "rejected",
    isActive: req.user.role === "customer" ? false : req.body.isActive !== false,
  };
  reviews.unshift(review);
  persistStore();
  res.status(201).json(review);
});

router.put("/:id/status", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const review = reviews.find((entry) => entry.id === req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found." });

  const status = req.body.status || review.status || "approved";
  review.status = status;
  review.isApproved = status === "approved";
  review.isActive = status === "approved" ? req.body.isActive !== false : false;
  persistStore();
  return res.json(review);
});

router.put("/:id", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const index = reviews.findIndex((review) => review.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Review not found." });

  const status = req.body.status || reviews[index].status || "approved";
  reviews[index] = {
    ...reviews[index],
    ...req.body,
    id: req.params.id,
    type: req.body.type === "employee" || req.body.employeeId ? "employee" : "store",
    status,
    isApproved: status === "approved",
  };
  persistStore();
  return res.json(reviews[index]);
});

router.delete("/:id", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const index = reviews.findIndex((review) => review.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Review not found." });

  reviews.splice(index, 1);
  persistStore();
  return res.status(204).end();
});

export default router;
