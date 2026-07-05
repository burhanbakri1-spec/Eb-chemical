import { apiRequest } from "./api.js";

export async function fetchInvoices() {
  return apiRequest("/admin/invoices");
}

export async function fetchInvoice(invoiceId) {
  return apiRequest(`/admin/invoices/${invoiceId}`);
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
