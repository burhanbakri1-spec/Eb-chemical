import { apiRequest } from "./api.js";

const websiteMediaCacheKeys = [
  "websiteMedia",
  "website_media",
  "epWebsiteMedia",
  "epChemicalWebsiteMedia",
  "epChemicalWebsiteMediaCache",
];

export function clearWebsiteMediaCache() {
  if (typeof window === "undefined") return;

  websiteMediaCacheKeys.forEach((key) => {
    window.localStorage?.removeItem(key);
    window.sessionStorage?.removeItem(key);
  });
}

export async function fetchWebsiteMedia() {
  clearWebsiteMediaCache();
  return apiRequest("/website-media", { cache: "no-store" });
}

export async function fetchAllWebsiteMedia() {
  clearWebsiteMediaCache();
  const response = await apiRequest("/website-media/all", { cache: "no-store" });
  return Array.isArray(response)
    ? { items: response, hiddenSectionKeys: [] }
    : {
        items: Array.isArray(response?.items) ? response.items : [],
        hiddenSectionKeys: Array.isArray(response?.hiddenSectionKeys) ? response.hiddenSectionKeys : [],
      };
}

export function fetchWebsiteMediaSection(sectionKey) {
  clearWebsiteMediaCache();
  return apiRequest(`/website-media/${encodeURIComponent(sectionKey)}`, { cache: "no-store" });
}

export async function saveWebsiteMedia(item) {
  const saved = await apiRequest(item.id ? `/website-media/${item.id}` : "/website-media", {
    method: item.id ? "PUT" : "POST",
    body: JSON.stringify(item),
  });
  clearWebsiteMediaCache();
  return saved;
}

export async function deleteWebsiteMedia(item) {
  const path = item?.id
    ? `/website-media/${encodeURIComponent(item.id)}`
    : `/website-media/by-section/${encodeURIComponent(item?.sectionKey || "")}`;
  const result = await apiRequest(path, { method: "DELETE" });
  clearWebsiteMediaCache();
  return result;
}
