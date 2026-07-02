export const neutralImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='720' viewBox='0 0 960 720'%3E%3Crect width='960' height='720' fill='%23f1f1ed'/%3E%3Cpath d='M330 442l88-92 70 69 72-81 86 104H330z' fill='%23d8d8d1'/%3E%3Ccircle cx='590' cy='282' r='34' fill='%23d8d8d1'/%3E%3C/svg%3E";

const blockedImagePatterns = [
  "/images/products/",
  "/products/limescale-remover",
  "/homepage-categories/",
  "supabase.co",
];

export function safeImageUrl(value) {
  if (typeof value !== "string") return "";
  const imageUrl = value.trim();
  if (!imageUrl) return "";
  const normalized = imageUrl.toLowerCase();
  return blockedImagePatterns.some((pattern) => normalized.includes(pattern)) ? "" : imageUrl;
}

export function resolveImageUrl(...candidates) {
  for (const candidate of candidates) {
    const imageUrl = safeImageUrl(candidate);
    if (imageUrl) return imageUrl;
  }
  return neutralImage;
}

export function showNeutralImage(event) {
  const image = event.currentTarget;
  if (image.src === neutralImage) return;
  image.src = neutralImage;
}
