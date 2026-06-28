export const DEFAULT_COMPANY_ID = "eb-chemical";

export const defaultCompany = Object.freeze({
  id: DEFAULT_COMPANY_ID,
  slug: DEFAULT_COMPANY_ID,
  name: "EB Chemical",
  status: "active",
  isDefault: true,
});

export function normalizeCompanyId(companyId) {
  return typeof companyId === "string" && companyId.trim()
    ? companyId.trim()
    : DEFAULT_COMPANY_ID;
}

export function companyStorageSegment(companyId) {
  const normalized = normalizeCompanyId(companyId).toLowerCase();
  const segment = normalized
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return segment || DEFAULT_COMPANY_ID;
}

export function companyStoragePath(companyId, ...parts) {
  return [companyStorageSegment(companyId), ...parts.filter(Boolean)].join("/");
}
