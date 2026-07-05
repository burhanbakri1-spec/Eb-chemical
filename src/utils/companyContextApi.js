import { apiBaseUrl } from "./api.js";

export async function fetchCompanyContext() {
  const response = await fetch(`${apiBaseUrl}/company/context`);
  if (!response.ok) return null;
  return response.json();
}
