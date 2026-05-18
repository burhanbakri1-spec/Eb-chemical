const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const normalizedApiUrl = configuredApiUrl.replace(/\/$/, "");

export const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;
export const tokenStorageKey = "epChemicalJwt";
export const userStorageKey = "epChemicalUser";

export function getToken() {
  return localStorage.getItem(tokenStorageKey);
}

export function setAuthSession({ token, user }) {
  localStorage.setItem(tokenStorageKey, token);
  localStorage.setItem(userStorageKey, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem(userStorageKey);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const url = `${apiBaseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "API request failed.";
    console.error("API request failed", {
      endpoint: path,
      status: response.status,
      message,
    });
    throw new Error(message);
  }

  return data;
}
