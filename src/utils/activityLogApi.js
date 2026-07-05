import { apiRequest } from "./api.js";

export async function fetchActivityLogs(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", params.limit);
  if (params.page) query.set("page", params.page);
  if (params.action) query.set("action", params.action);
  if (params.entity_type) query.set("entity_type", params.entity_type);
  if (params.actor_email) query.set("actor_email", params.actor_email);
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  const qs = query.toString();
  return apiRequest(`/admin/activity-log${qs ? `?${qs}` : ""}`);
}

export async function fetchActivityLog(logId) {
  return apiRequest(`/admin/activity-log/${logId}`);
}
