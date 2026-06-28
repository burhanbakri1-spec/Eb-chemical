import { DEFAULT_COMPANY_ID, defaultCompany } from "../tenancy/company.js";

export function resolveCompany(req, _res, next) {
  // TODO(phase-3): resolve a verified company_domains record from req.hostname.
  // Do not trust a client-supplied company_id when domain switching is added.
  req.companyId = DEFAULT_COMPANY_ID;
  req.company = defaultCompany;
  next();
}
