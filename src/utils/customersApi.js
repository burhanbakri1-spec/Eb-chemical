import { apiRequest } from "./api.js";

export async function fetchCustomers() {
  const response = await apiRequest("/admin/customers");
  return Array.isArray(response) ? response : [];
}

export async function updateUserAccountType(userId, accountType) {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}/account-type`, {
    method: "PATCH",
    body: JSON.stringify({ accountType }),
  });
}
