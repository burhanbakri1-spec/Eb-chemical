const DEFAULT_CURRENCY = "ILS";
const trackedPurchaseKeys = new Set();

function normalizeIds(ids = []) {
  const values = Array.isArray(ids) ? ids : [ids];
  return values.filter(Boolean).map((id) => String(id));
}

function normalizeValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function safeUrl(url) {
  if (!url || typeof window === "undefined") return undefined;

  try {
    const parsed = new URL(url, window.location.origin);
    if (!["http:", "https:"].includes(parsed.protocol)) return undefined;
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return undefined;
  }
}

function cleanParameters(parameters) {
  return Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function track(method, eventName, parameters = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;

  try {
    window.fbq(method, eventName, cleanParameters(parameters));
    return true;
  } catch {
    return false;
  }
}

export function trackViewContent({ category, contentIds, contentName, currency = DEFAULT_CURRENCY, value } = {}) {
  return track("track", "ViewContent", {
    content_name: contentName,
    content_ids: normalizeIds(contentIds),
    content_type: "product",
    value: normalizeValue(value),
    currency,
    category,
  });
}

export function trackSearch(searchString) {
  const query = String(searchString || "").trim();
  if (!query) return false;
  return track("track", "Search", { search_string: query });
}

export function trackViewCategory(category) {
  const categoryName = String(category || "").trim();
  if (!categoryName) return false;
  return track("trackCustom", "ViewCategory", { category: categoryName });
}

export function trackAddToCart({ category, contentIds, contentName, currency = DEFAULT_CURRENCY, quantity = 1, value } = {}) {
  return track("track", "AddToCart", {
    content_name: contentName,
    content_ids: normalizeIds(contentIds),
    content_type: "product",
    value: normalizeValue(value),
    currency,
    quantity: Math.max(1, Number(quantity) || 1),
    category,
  });
}

export function trackRemoveFromCart({ category, contentIds, contentName, currency = DEFAULT_CURRENCY, quantity = 1, value } = {}) {
  return track("trackCustom", "RemoveFromCart", {
    content_name: contentName,
    content_ids: normalizeIds(contentIds),
    content_type: "product",
    value: normalizeValue(value),
    currency,
    quantity: Math.max(1, Number(quantity) || 1),
    category,
  });
}

export function trackInitiateCheckout({ contentIds, currency = DEFAULT_CURRENCY, numItems, value } = {}) {
  return track("track", "InitiateCheckout", {
    content_ids: normalizeIds(contentIds),
    content_type: "product",
    value: normalizeValue(value),
    currency,
    num_items: Math.max(0, Number(numItems) || 0),
  });
}

export function trackPurchase({ contentIds, currency = DEFAULT_CURRENCY, numItems, orderId, value } = {}) {
  if (typeof window === "undefined") return false;

  const normalizedIds = normalizeIds(contentIds);
  const normalizedValue = normalizeValue(value);
  const normalizedItemCount = Math.max(0, Number(numItems) || 0);
  const purchaseKey = orderId
    ? `order:${String(orderId)}`
    : `fallback:${normalizedIds.join(",")}:${normalizedValue}:${normalizedItemCount}`;

  try {
    if (trackedPurchaseKeys.has(purchaseKey) || window.sessionStorage.getItem(`eb-meta-pixel-purchase:${purchaseKey}`)) {
      return false;
    }
  } catch {
    if (trackedPurchaseKeys.has(purchaseKey)) return false;
  }

  const tracked = track("track", "Purchase", {
    content_ids: normalizedIds,
    content_type: "product",
    value: normalizedValue,
    currency,
    num_items: normalizedItemCount,
    ...(orderId ? { order_id: String(orderId) } : {}),
  });

  if (tracked) {
    trackedPurchaseKeys.add(purchaseKey);
    try {
      window.sessionStorage.setItem(`eb-meta-pixel-purchase:${purchaseKey}`, "1");
    } catch {
      // In-memory deduplication remains active when storage is unavailable.
    }
  }

  return tracked;
}

export function trackContact({ method = "contact", url } = {}) {
  const contactMethod = String(method || "contact").toLowerCase();
  const destination = safeUrl(url);
  const parameters = {
    contact_method: contactMethod,
    ...(destination ? { url: destination } : {}),
  };
  const tracked = track("track", "Contact", parameters);

  if (contactMethod === "whatsapp") {
    track("trackCustom", "WhatsAppClick", parameters);
  }

  return tracked;
}

export function trackSocialClick({ platform, url } = {}) {
  const platformName = String(platform || "").trim().toLowerCase();
  if (!platformName) return false;

  const destination = safeUrl(url);
  return track("trackCustom", "SocialClick", {
    platform: platformName,
    ...(destination ? { url: destination } : {}),
  });
}
