import { apiRequest } from "./api.js";

export async function fetchPlatformUsers() {
  const response = await apiRequest("/platform/users");
  return Array.isArray(response) ? response : response?.users || [];
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

export async function updatePlatformMembership(membershipId, changes) {
  return apiRequest(`/platform/memberships/${encodeURIComponent(membershipId)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}
