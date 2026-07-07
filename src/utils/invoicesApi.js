import { apiRequest } from "./api.js";

function normalizeInvoiceList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.invoices)) return response.invoices;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function normalizeInvoice(response) {
  if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    return response.data;
  }
  if (response?.invoice && typeof response.invoice === "object" && !Array.isArray(response.invoice)) {
    return response.invoice;
  }
  return response && typeof response === "object" && !Array.isArray(response) ? response : null;
}

export async function fetchInvoices() {
  return normalizeInvoiceList(await apiRequest("/admin/invoices"));
}

export async function fetchInvoice(invoiceId) {
  return normalizeInvoice(await apiRequest(`/admin/invoices/${invoiceId}`));
}

export async function createInvoice(data) {
  return apiRequest("/admin/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(invoiceId, data) {
  return apiRequest(`/admin/invoices/${invoiceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function voidInvoice(invoiceId) {
  return apiRequest(`/admin/invoices/${invoiceId}`, {
    method: "DELETE",
  });
}
