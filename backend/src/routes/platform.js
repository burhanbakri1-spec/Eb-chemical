import { Router } from "express";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";
import { createPublicCompanyContext, defaultCompany } from "../tenancy/company.js";

const router = Router();

router.use(requireAuth, requireSuperAdmin);

router.get("/companies", (_req, res) => {
  res.json([createPublicCompanyContext(defaultCompany)]);
});

export default router;
