import { apiRequest } from "./api.js";

export async function fetchReportsSummary(params = {}) {
  const query = new URLSearchParams();
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  const qs = query.toString();
  return apiRequest(`/admin/reports/summary${qs ? `?${qs}` : ""}`);
}
