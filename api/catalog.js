import { categories } from "../src/data/categories.js";
import { products as localProducts } from "../src/data/products.js";

const SITE_URL = "https://eb-chemical-full.vercel.app";
const BRAND = "EB Chemical";
const CURRENCY = "ILS";

function normalizeApiBase(value = "") {
  const trimmed = value.replace(/\/$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function getText(value, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.en || value.ar || fallback;
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(value = "", base = SITE_URL) {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function getCategoryName(product) {
  const category = categories.find((item) => item.id === product.categoryId);
  return getText(product.categoryLabel) || getText(category?.name) || product.categoryId || "";
}

function getProductPrice(product) {
  const variantPrices = (product.variants || [])
    .map((variant) => Number(variant.price || 0))
    .filter((price) => price > 0);
  const sizePrices = (product.sizes || [])
    .map((size) => Number(size.price || 0))
    .filter((price) => price > 0);
  const prices = [...variantPrices, ...sizePrices];
  return prices.length ? Math.min(...prices) : Number(product.price || 0);
}

function getAvailability(product) {
  const stockStatus = String(product.stockStatus || "").toLowerCase();
  if (stockStatus.includes("out")) return "out of stock";
  if (Number(product.stockQty || 0) > 0) return "in stock";
  if ((product.variants || []).some((variant) => Number(variant.stock || variant.stockQty || 0) > 0)) {
    return "in stock";
  }
  return stockStatus.includes("in") || !stockStatus ? "in stock" : "out of stock";
}

function isActiveProduct(product) {
  const status = String(product?.status || product?.stockStatus || "").toLowerCase();
  return (
    product &&
    product.isActive !== false &&
    product.is_active !== false &&
    product.active !== false &&
    product.isDeleted !== true &&
    product.deleted !== true &&
    status !== "inactive" &&
    status !== "hidden"
  );
}

async function fetchLiveProducts() {
  const apiBase = normalizeApiBase(process.env.CATALOG_API_URL || process.env.VITE_API_URL || "");
  if (!apiBase) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${apiBase}/products`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function productToItem(product) {
  const title = getText(product.name, product.slug || product.id);
  const description =
    getText(product.shortDescription) ||
    getText(product.longDescription) ||
    title;
  const price = getProductPrice(product);
  const productPath = `/products/${encodeURIComponent(product.slug || product.id)}`;
  const link = absoluteUrl(productPath);
  const imageLink = absoluteUrl(
    product.productsPageImage || product.image || product.hoverImage || product.fallbackImage || "",
  );

  if (!product.id || !title || !imageLink || !price) return "";

  return [
    "    <item>",
    `      <g:id>${escapeXml(product.id)}</g:id>`,
    `      <title>${escapeXml(title)}</title>`,
    `      <description>${escapeXml(description)}</description>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <g:image_link>${escapeXml(imageLink)}</g:image_link>`,
    `      <g:price>${escapeXml(`${price} ${CURRENCY}`)}</g:price>`,
    `      <g:availability>${escapeXml(getAvailability(product))}</g:availability>`,
    `      <g:brand>${escapeXml(product.brand || BRAND)}</g:brand>`,
    `      <g:product_type>${escapeXml(getCategoryName(product))}</g:product_type>`,
    "      <g:condition>new</g:condition>",
    `      <guid>${escapeXml(product.id)}</guid>`,
    "    </item>",
  ].join("\n");
}

function buildCatalogXml(products) {
  const items = products
    .filter(isActiveProduct)
    .map(productToItem)
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>EB Chemical Product Catalog</title>
    <link>${SITE_URL}</link>
    <description>EB Chemical product catalog</description>
${items}
  </channel>
</rss>
`;
}

export default async function handler(_req, res) {
  const liveProducts = await fetchLiveProducts();
  const xml = buildCatalogXml(liveProducts || localProducts);

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=900, s-maxage=900");
  res.status(200).send(xml);
}
