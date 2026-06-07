import { products } from "./products.js";
import { homepageCategoryCards, homepageOffers, reviews as initialReviews } from "../../../src/data/homeContent.js";
import { defaultWebsiteMedia } from "../../../src/data/websiteMedia.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isSupabaseConfigured,
  loadStoreFromSupabase,
  saveStoreToSupabase,
} from "./supabaseStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_STORE_DIR
  ? path.resolve(process.env.DATA_STORE_DIR)
  : path.resolve(__dirname, "../data-store");
const dataFile = path.join(dataDir, "store.json");

export const allPermissions = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.update",
  "products.delete",
  "orders.view",
  "orders.create",
  "orders.update",
  "orders.delete",
  "orders.updateStatus",
  "customers.view",
  "employees.view",
  "website_media.manage",
];

const seedUsers = [
  {
    id: "admin-demo",
    name: "EB Chemical Admin",
    email: "admin@epchemical.com",
    phone: "+970599000000",
    password: "admin123",
    role: "admin",
    permissions: allPermissions,
    isActive: true,
  },
  {
    id: "employee-demo",
    name: "EB Chemical Employee",
    email: "employee@epchemical.com",
    phone: "+970599000001",
    password: "employee123",
    role: "employee",
    department: "Sales",
    permissions: [
      "dashboard.view",
      "products.view",
      "orders.view",
      "orders.create",
      "orders.updateStatus",
    ],
    isActive: true,
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readPersistedStore() {
  try {
    if (!fs.existsSync(dataFile)) return null;
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (error) {
    console.warn("Could not read persistent store, using safe defaults.", error.message);
    return null;
  }
}

function ensureArray(value, fallback) {
  return Array.isArray(value) ? value : clone(fallback);
}

function normalizeGalleryImages(product) {
  const source = product.gallery_images || product.galleryImages || [];
  return source
    .map((entry, index) => {
      const imageUrl = typeof entry === "string" ? entry : entry?.image_url || entry?.image || entry?.url;
      if (!imageUrl) return null;
      return {
        id: typeof entry === "object" && entry?.id ? entry.id : `gallery-${index}-${Date.now()}`,
        image_url: imageUrl,
        sort_order: Number(typeof entry === "object" ? entry?.sort_order ?? entry?.sortOrder ?? index : index),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeVariants(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length) {
    return variants
      .map((variant, index) => ({
        id: variant.id || `${product.id || "product"}-variant-${index}-${Date.now()}`,
        color_name: variant.color_name || variant.colorName || "Default",
        color_value: variant.color_value || variant.colorValue || variant.colorHex || "",
        size: variant.size || "500ml",
        price: Number(variant.price || 0),
        stock: Math.max(0, Number(variant.stock ?? variant.stockQty ?? product.stockQty ?? 0)),
        image_url: variant.image_url || variant.imageUrl || variant.image || "",
        sort_order: Number(variant.sort_order ?? variant.sortOrder ?? index),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  return (product.sizes || []).map((sizeOption, index) => ({
    id: `${product.id || "product"}-variant-${index}`,
    color_name: "Default",
    color_value: "",
    size: sizeOption.size || "500ml",
    price: Number(sizeOption.price || 0),
    stock: Math.max(0, Number(product.stockQty ?? 24)),
    image_url: product.image || "",
    sort_order: index,
  }));
}

function sizesFromVariants(variants, fallbackSizes = []) {
  const bySize = new Map();
  variants.forEach((variant) => {
    const current = bySize.get(variant.size);
    if (!current || Number(variant.price) < Number(current.price)) {
      bySize.set(variant.size, { size: variant.size, price: Number(variant.price || 0) });
    }
  });
  return bySize.size ? Array.from(bySize.values()) : fallbackSizes;
}

function normalizeProduct(product, index = 0) {
  const image = product.image || "/images/products/product-placeholder.svg";
  const galleryImages = normalizeGalleryImages(product);
  const variants = normalizeVariants({ ...product, image });
  return {
    ...product,
    id: product.id || `product-${index}-${Date.now()}`,
    image,
    hoverImage:
      product.hoverImage ||
      product.secondaryImage ||
      product.gallery?.[1] ||
      "",
    variants,
    sizes: sizesFromVariants(variants, product.sizes || []),
    gallery_images: galleryImages,
    galleryImages: galleryImages.map((entry) => entry.image_url),
    fallbackImage: product.fallbackImage || "/images/products/product-placeholder.svg",
  };
}

function normalizeUser(user) {
  const previousBrand = [String.fromCharCode(69, 80), "Chemical"].join(" ");
  const name = user.name?.replace?.(previousBrand, "EB Chemical") || user.name;
  const ebPoints = Math.max(0, Number(user.ebPoints || 0));
  const totalPointsEarned = Math.max(0, Number(user.totalPointsEarned || 0));
  const totalPointsRedeemed = Math.max(0, Number(user.totalPointsRedeemed || 0));
  return {
    ...user,
    name,
    role: user.role || "customer",
    permissions: user.permissions || [],
    ebPoints,
    totalPointsEarned,
    totalPointsRedeemed,
    isActive: user.isActive !== false,
  };
}

function normalizeOrder(order) {
  const createdByEmployeeId = order.createdByEmployeeId || "";
  const handledByEmployeeId = order.handledByEmployeeId || order.assignedToEmployeeId || "";
  return {
    ...order,
    id: order.id || `ORD-${Date.now()}`,
    customer: order.customer || {},
    items: order.items || [],
    subtotal: Number(order.subtotal || order.total || 0),
    total: Number(order.total || order.subtotal || 0),
    pointsEarned: Math.max(0, Number(order.pointsEarned || 0)),
    pointsRedeemed: Math.max(0, Number(order.pointsRedeemed || 0)),
    discountFromPoints: Math.max(0, Number(order.discountFromPoints || 0)),
    status: order.status || "Pending",
    handledByEmployeeId,
    assignedToEmployeeId: order.assignedToEmployeeId || handledByEmployeeId,
    createdByEmployeeId,
    createdByEmployeeName: order.createdByEmployeeName || "",
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
  };
}

function normalizeOffer(offer, index = 0) {
  return {
    ...offer,
    id: offer.id || `offer-${index}-${Date.now()}`,
    title: offer.title || { en: "", ar: "" },
    description: offer.description || { en: "", ar: "" },
    ctaText: offer.ctaText || { en: "Shop now", ar: "تسوق الآن" },
    ctaLink: offer.ctaLink || "products",
    displayOrder: Number(offer.displayOrder || index + 1),
    isActive: offer.isActive !== false,
  };
}

function normalizeCategoryCard(card, index = 0) {
  return {
    ...card,
    key: card.key || `card-${index}`,
    image: card.image || "/images/products/product-placeholder.svg",
    label: card.label || { en: "", ar: "" },
    title: card.title || { en: "", ar: "" },
    displayOrder: Number(card.displayOrder || index + 1),
    isActive: card.isActive !== false,
  };
}

function normalizeReview(review, index = 0) {
  const type = review.type === "employee" || review.employeeId ? "employee" : "store";
  const status = review.status || (review.isApproved === false ? "rejected" : "approved");
  return {
    ...review,
    id: review.id || `review-${index}-${Date.now()}`,
    type,
    rating: Math.max(1, Math.min(5, Number(review.rating || 5))),
    customerName: review.customerName || "Customer",
    comment: review.comment || { en: "", ar: "" },
    employeeId: review.employeeId || "",
    employeeName: review.employeeName || "",
    orderId: review.orderId || "",
    status,
    isApproved: status === "approved",
    createdAt: review.createdAt || new Date().toISOString(),
    isActive: review.isActive !== false && status !== "rejected",
  };
}

function normalizeWebsiteMedia(item, index = 0) {
  return {
    ...item,
    id: item.id || `website-media-${index}`,
    sectionKey: item.sectionKey || item.section_key || `custom_section_${index}`,
    sectionLabel: item.sectionLabel || item.section_label || item.sectionKey || "Website image",
    groupKey: item.groupKey || item.group_key || "sections",
    fallbackImageUrl: item.fallbackImageUrl || item.fallback_image_url || "",
    imageUrl: item.imageUrl ?? item.image_url ?? "",
    title: item.title || "",
    subtitle: item.subtitle || "",
    linkUrl: item.linkUrl || item.link_url || "",
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
    isActive: item.isActive !== false && item.is_active !== false,
  };
}

function defaultWebsiteMediaDefinition(item) {
  return {
    ...item,
    fallbackImageUrl: item.fallbackImageUrl || item.imageUrl || "",
    imageUrl: "",
  };
}

function mediaTimestamp(item) {
  const timestamp = new Date(item?.updatedAt || item?.updated_at || item?.createdAt || item?.created_at || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function preferWebsiteMediaItem(current, next) {
  if (!current) return next;

  const currentHasImage = Boolean(current.imageUrl || current.image_url);
  const nextHasImage = Boolean(next.imageUrl || next.image_url);

  const preferred =
    nextHasImage && !currentHasImage
      ? next
      : !nextHasImage && currentHasImage
        ? current
        : mediaTimestamp(next) >= mediaTimestamp(current)
          ? next
          : current;

  return {
    ...current,
    ...preferred,
    id: preferred.id || current.id,
    sectionKey: preferred.sectionKey || preferred.section_key || current.sectionKey || current.section_key,
    sectionLabel: preferred.sectionLabel || preferred.section_label || current.sectionLabel || current.section_label,
    groupKey: preferred.groupKey || preferred.group_key || current.groupKey || current.group_key,
    fallbackImageUrl: current.fallbackImageUrl || current.fallback_image_url || preferred.fallbackImageUrl || "",
    imageUrl: preferred.imageUrl ?? preferred.image_url ?? "",
  };
}

async function readInitialStore() {
  if (!isSupabaseConfigured()) {
    return { persisted: readPersistedStore(), canPersistToSupabase: false };
  }

  try {
    const result = await loadStoreFromSupabase();
    return {
      persisted: result.isEmpty ? readPersistedStore() : result.store,
      canPersistToSupabase: true,
    };
  } catch (error) {
    console.warn("Could not read Supabase store, using local fallback without remote writes.", error.message);
    return { persisted: readPersistedStore(), canPersistToSupabase: false };
  }
}

const initialStore = await readInitialStore();
const persisted = initialStore.persisted;
let canPersistToSupabase = initialStore.canPersistToSupabase;

export const users = ensureArray(persisted?.users, seedUsers).map(normalizeUser);
export const orders = ensureArray(persisted?.orders, []).map(normalizeOrder);
export const sessions = new Map();
export const carts = new Map(Object.entries(persisted?.carts || {}));
export const workSessions = ensureArray(persisted?.workSessions, []);
export const productCatalog = ensureArray(persisted?.products, products).map(normalizeProduct);
export const offers = ensureArray(persisted?.offers, homepageOffers).map(normalizeOffer);
export const categoryCards = ensureArray(persisted?.categoryCards, homepageCategoryCards).map(normalizeCategoryCard);
export const reviews = ensureArray(persisted?.reviews, initialReviews).map(normalizeReview);
const persistedWebsiteMedia = Array.isArray(persisted?.websiteMedia) ? persisted.websiteMedia : [];
const websiteMediaBySection = new Map(
  clone(defaultWebsiteMedia).map((item) => {
    const definition = defaultWebsiteMediaDefinition(item);
    return [definition.sectionKey || definition.id, definition];
  }),
);
persistedWebsiteMedia.forEach((item, index) => {
  const sectionKey = item.sectionKey || item.section_key || item.id || `persisted-website-media-${index}`;
  websiteMediaBySection.set(sectionKey, preferWebsiteMediaItem(websiteMediaBySection.get(sectionKey), item));
});
export const websiteMedia = [...websiteMediaBySection.values()].map(normalizeWebsiteMedia);

export function currentStoreSnapshot() {
  const store = {
    version: 1,
    savedAt: new Date().toISOString(),
    users,
    orders,
    products: productCatalog,
    offers,
    categoryCards,
    reviews,
    websiteMedia,
    workSessions,
    carts: Object.fromEntries(carts.entries()),
  };
  return store;
}

function persistLocalStore(store) {
  fs.mkdirSync(dataDir, { recursive: true });
  const tempFile = `${dataFile}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, dataFile);
  return store;
}

export async function persistStore() {
  const store = currentStoreSnapshot();

  if (isSupabaseConfigured() && canPersistToSupabase) {
    try {
      await saveStoreToSupabase(store);
      return store;
    } catch (error) {
      console.error("Could not persist store to Supabase. Falling back to local store.", error.message);
      canPersistToSupabase = false;
    }
  }

  return persistLocalStore(store);
}

if (!isSupabaseConfigured() && !fs.existsSync(dataFile)) {
  await persistStore();
}
