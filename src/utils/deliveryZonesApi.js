import { apiRequest } from "./api.js";

export async function fetchDeliveryZones() {
  return apiRequest("/delivery-zones");
}

export async function fetchAdminDeliveryZones() {
  return apiRequest("/admin/delivery-zones");
}

export async function fetchDeliveryZone(zoneId) {
  return apiRequest(`/admin/delivery-zones/${zoneId}`);
}

export async function createDeliveryZone(data) {
  return apiRequest("/admin/delivery-zones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeliveryZone(zoneId, data) {
  return apiRequest(`/admin/delivery-zones/${zoneId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteDeliveryZone(zoneId) {
  return apiRequest(`/admin/delivery-zones/${zoneId}`, {
    method: "DELETE",
  });
}
