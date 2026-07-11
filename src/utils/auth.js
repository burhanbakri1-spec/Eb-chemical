import {
  apiRequest,
  clearAuthSession,
  getToken,
  getStoredUser,
  setAuthSession,
} from "./api.js";

export function getCurrentUser() {
  return getStoredUser();
}

export function setCurrentUser(user) {
  if (!user) {
    clearAuthSession();
    return;
  }

  localStorage.setItem("epChemicalUser", JSON.stringify(user));
}

export async function loginUser(email, password) {
  const session = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthSession(session);
  return session;
}

export async function registerCustomer({ name, email, phone, password }) {
  const session = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
  setAuthSession(session);
  return {
    error: "",
    user: session.user,
  };
}

export async function fetchCurrentUser() {
  if (!getToken()) {
    setCurrentUser(null);
    return null;
  }

  const user = await apiRequest("/auth/me");
  setCurrentUser(user);
  return user;
}

export async function updateCurrentUser(updates) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), 15000);
  try {
    const updated = await apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
      signal: controller.signal,
    });
    setCurrentUser(updated);
    return updated;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Profile update timed out. Please try again.");
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function logoutUser() {
  try {
    return await apiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAuthSession();
  }
}
