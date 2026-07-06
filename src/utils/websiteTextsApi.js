import { apiRequest } from "./api.js";
import { normalizeWebsiteText } from "../data/websiteTexts.js";

function normalizeList(items) {
  return (Array.isArray(items) ? items : []).map(normalizeWebsiteText);
}

export async function fetchWebsiteTexts() {
  return normalizeList(await apiRequest("/website-texts", { cache: "no-store" }));
}

export async function fetchAdminWebsiteTexts() {
  return normalizeList(await apiRequest("/admin/website-texts", { cache: "no-store" }));
}

export async function saveWebsiteText(item) {
  const saved = await apiRequest(item.id ? `/admin/website-texts/${item.id}` : "/admin/website-texts", {
    method: item.id ? "PATCH" : "POST",
    body: JSON.stringify(item),
  });
  return normalizeWebsiteText(saved);
}

export function deleteWebsiteText(id) {
  return apiRequest(`/admin/website-texts/${encodeURIComponent(id)}`, { method: "DELETE" });
}
