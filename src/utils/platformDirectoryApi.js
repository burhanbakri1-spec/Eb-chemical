import { apiRequest } from "./api.js";

export async function fetchPlatformCompanies() {
  const response = await apiRequest("/platform/companies");
  return Array.isArray(response) ? response : response?.companies || response || [];
}

export async function fetchPlatformUsers() {
  const response = await apiRequest("/platform/users");
  return Array.isArray(response) ? response : response?.users || [];
}

export async function createPlatformUser(user) {
  return apiRequest("/platform/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export async function updatePlatformUser(userId, changes) {
  return apiRequest(`/platform/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export async function updatePlatformUserStatus(userId, isActive) {
  return apiRequest(`/platform/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function fetchPlatformMemberships() {
  const response = await apiRequest("/platform/memberships");
  return Array.isArray(response) ? response : response?.memberships || [];
}

export async function createPlatformMembership(membership) {
  const safe = {
    companyId: membership.companyId,
    email: membership.email,
    name: membership.name || "",
    role: membership.role,
    status: membership.status,
  };
  return apiRequest("/platform/memberships", {
    method: "POST",
    body: JSON.stringify(safe),
  });
}

export async function updatePlatformMembership(membershipId, changes) {
  return apiRequest(`/platform/memberships/${encodeURIComponent(membershipId)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}
