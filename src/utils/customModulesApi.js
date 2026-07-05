import { apiRequest } from "./api.js";

const basePath = "/admin/custom-modules";

export async function fetchCustomModules() {
  const response = await apiRequest(basePath);
  return Array.isArray(response) ? response : [];
}

export function fetchCustomModule(moduleId) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}`);
}

export function createCustomModule(config) {
  return apiRequest(basePath, { method: "POST", body: JSON.stringify(config) });
}

export function updateCustomModule(moduleId, config) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}`, {
    method: "PATCH",
    body: JSON.stringify(config),
  });
}

export function disableCustomModule(moduleId) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}`, { method: "DELETE" });
}

export async function fetchCustomModuleEntries(moduleId) {
  const response = await apiRequest(`${basePath}/${encodeURIComponent(moduleId)}/entries`);
  return Array.isArray(response) ? response : [];
}

export function fetchCustomModuleEntry(moduleId, entryId) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}/entries/${encodeURIComponent(entryId)}`);
}

export function createCustomModuleEntry(moduleId, data) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}/entries`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export function updateCustomModuleEntry(moduleId, entryId, data) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}/entries/${encodeURIComponent(entryId)}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
}

export function deleteCustomModuleEntry(moduleId, entryId) {
  return apiRequest(`${basePath}/${encodeURIComponent(moduleId)}/entries/${encodeURIComponent(entryId)}`, {
    method: "DELETE",
  });
}
