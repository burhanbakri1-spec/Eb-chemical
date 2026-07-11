import React from "react";
import { Minus, Plus, Search, Upload } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminOrdersTable from "../components/AdminOrdersTable.jsx";
import WebsiteMediaManager from "../components/WebsiteMediaManager.jsx";
import { uploadImage, uploadImages } from "../utils/api.js";
import { isVariantVisible } from "../utils/productVariants.js";
import { enabledProductField, productFieldLabel } from "../data/productSchema.js";
import {
  adminCategoriesStorageKey,
  defaultAdminCategories,
  getSelectableAdminCategories,
} from "../utils/adminCategories.js";
import { fetchCustomers, updateUserAccountType } from "../utils/customersApi.js";

const storageKeys = {
  brands: "ebAdminBrands",
  categories: adminCategoriesStorageKey,
  inventory: "ebAdminInventory",
  movements: "ebAdminStockMovements",
  settings: "ebAdminSettings",
  stores: "ebAdminStores",
  vlogHero: "ebAdminVlogHero",
  vlogs: "ebAdminVlogs",
};

const pageMeta = {
  admin: [
    { en: "Dashboard", ar: "لوحة التحكم", he: "לוח בקרה" },
    { en: "Overview of your store performance", ar: "نظرة عامة على أداء متجرك", he: "סקירת ביצועי החנות" },
  ],
  "admin-products": [
    { en: "Products", ar: "المنتجات", he: "מוצרים" },
    { en: "Manage your product catalog", ar: "إدارة كتالوج المنتجات", he: "ניהול קטלוג המוצרים" },
  ],
  "admin-products-new": [
    { en: "New Product", ar: "منتج جديد", he: "מוצר חדש" },
    { en: "Create or update product catalog details", ar: "إنشاء أو تحديث تفاصيل كتالوج المنتجات", he: "יצירה או עדכון פרטי קטלוג מוצרים" },
  ],
  "admin-categories": [
    { en: "Categories", ar: "التصنيفات", he: "קטגוריות" },
    { en: "Organize your product hierarchy", ar: "تنظيم هيكل المنتجات", he: "ארגן היררכיית המוצרים" },
  ],
  "admin-categories-new": [
    { en: "New Category", ar: "تصنيف جديد", he: "קטגוריה חדשה" },
    { en: "Create a storefront category", ar: "إنشاء تصنيف للمتجر", he: "צור קטגוריה לחנות" },
  ],
  "admin-brands": [
    { en: "Brands", ar: "العلامات التجارية", he: "מותגים" },
    { en: "Manage brand manufacturers and lines", ar: "إدارة العلامات التجارية والخطوط", he: "ניהול מותגים וקווי מוצרים" },
  ],
  "admin-brands-new": [
    { en: "New Brand", ar: "علامة تجارية جديدة", he: "מותג חדש" },
    { en: "Create a brand profile", ar: "إنشاء ملف تعريف للعلامة التجارية", he: "צור פרופיל מותג" },
  ],
  "admin-vlogs": [
    { en: "Vlogs", ar: "المدونات", he: "בלוגים" },
    { en: "Manage storefront vlog entries", ar: "إدارة مدونات المتجر", he: "ניהול רשומות בלוג בחנות" },
  ],
  "admin-vlogs-new": [
    { en: "New Vlog", ar: "مدونة جديدة", he: "בלוג חדש" },
    { en: "Create a storefront vlog entry", ar: "إنشاء مدونة للمتجر", he: "צור רשומת בלוג לחנות" },
  ],
  "admin-store-locator": [
    { en: "Store Locator", ar: "تحديد موقع المتجر", he: "איתור חנויות" },
    { en: "Manage physical store locations", ar: "إدارة مواقع المتاجر", he: "ניהול מיקומי חנויות פיזיות" },
  ],
  "admin-store-locator-new": [
    { en: "New Store", ar: "متجر جديد", he: "חנות חדשה" },
    { en: "Create a retail location", ar: "إنشاء موقع بيع بالتجزئة", he: "צור מיקום חנות" },
  ],
  "admin-website-media": [
    { en: "Website Media", ar: "وسائط الموقع", he: "מדיה אתר" },
    { en: "Manage images used across storefront sections", ar: "إدارة الصور المستخدمة في أقسام المتجر", he: "ניהול תמונות המשמשות בחלקי החנות" },
  ],
  "admin-orders": [
    { en: "Orders", ar: "الطلبات", he: "הזמנות" },
    { en: "Manage and track customer orders", ar: "إدارة وتتبع طلبات العملاء", he: "ניהול ומעקב אחר הזמנות לקוחות" },
  ],
  "admin-reviews": [
    { en: "Reviews", ar: "التقييمات", he: "ביקורות" },
    { en: "Moderate customer reviews and ratings", ar: "إدارة تقييمات العملاء", he: "ניהול ביקורות ודירוגי לקוחות" },
  ],
  "admin-inventory": [
    { en: "Inventory Management", ar: "إدارة المخزون", he: "ניהול מלאי" },
    { en: "Monitor stock levels, adjust quantities, and review movement history", ar: "مراقبة مستويات المخزون وضبط الكميات ومراجعة تاريخ الحركة", he: "מעקב אחר רמות מלאי, התאמת כמויות והיסטוריית תנועות" },
  ],
  "admin-customers": [
    { en: "Customers", ar: "العملاء", he: "לקוחות" },
    { en: "Manage customer accounts and view order history", ar: "إدارة حسابات العملاء وعرض سجل الطلبات", he: "ניהול חשבונות לקוחות וצפייה בהיסטוריית הזמנות" },
  ],
  "admin-settings": [
    { en: "Settings", ar: "الإعدادات", he: "הגדרות" },
    { en: "Manage site identity, metadata, social links, and shipping rules from one page.", ar: "إدارة هوية الموقع والبيانات الوصفية وروابط التواصل الاجتماعي وقواعد الشحن من صفحة واحدة.", he: "ניהול זהות האתר, מטא-דאטה, קישורים חברתיים וחוקי משלוח מעמוד אחד." },
  ],
};

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local admin drafts are optional; failing storage should not break the panel.
  }
}

function getText(value, language = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

function makeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProductSku(product) {
  return product.sku || product.id || product.slug || "-";
}

function getProductPrice(product) {
  const prices = (product.sizes || []).map((size) => Number(size.price || 0)).filter(Boolean);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

function getStockQty(product) {
  if (Number.isFinite(Number(product.stockQty))) return Number(product.stockQty);
  if ((product.stockStatus || "").toLowerCase().includes("out")) return 0;
  return 24;
}

function loc(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.ar || value.en || "";
}

function localized(en, ar, he, language) {
  if (language === "ar") return ar;
  if (language === "he") return he;
  return en;
}

function formatDate(value, language = "en") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const localeMap = { ar: "ar-SA", he: "he-IL" };
  return date.toLocaleDateString(localeMap[language] || "en-US");
}

function uniqueCustomersFromOrders(orders) {
  const customers = new Map();
  orders.forEach((order) => {
    const key = order.customer?.email || order.customer?.phone || order.customer?.name || order.id;
    const current = customers.get(key) || {
      createdAt: order.createdAt,
      email: order.customer?.email || "-",
      name: order.customer?.name || "-",
      orders: 0,
      phone: order.customer?.phone || "-",
      status: "Active",
      updatedAt: order.updatedAt || order.createdAt,
    };
    current.orders += 1;
    current.updatedAt = order.updatedAt || current.updatedAt;
    customers.set(key, current);
  });
  return Array.from(customers.values());
}

function createLocalizedCopy(en, ar) {
  return { en, ar };
}

function normalizeFormVariant(variant = {}, index = 0, product = {}) {
  return {
    ...variant,
    id: variant.id || `${product.id || "product"}-variant-${index}`,
    color_name: variant.color_name || variant.colorName || "Default",
    color_value: variant.color_value || variant.colorValue || "",
    size: variant.size || product.size || "500ml",
    price: Number(variant.price ?? product.price ?? 0),
    wholesalePrice: variant.wholesalePrice != null ? Number(variant.wholesalePrice) : undefined,
    stock: Math.max(0, Number(variant.stock ?? variant.stockQty ?? product.stockQty ?? 0)),
    image_url: variant.image_url || variant.imageUrl || variant.image || "",
    sort_order: Number(variant.sort_order ?? variant.sortOrder ?? index),
    isVisible: isVariantVisible(variant),
    attributes: variant.attributes && typeof variant.attributes === "object" ? { ...variant.attributes } : {},
  };
}

function cleanupDuplicateVariants(variants) {
  const groups = new Map();

  variants.forEach((variant) => {
    const key = `${(variant.color_name || "").toLowerCase()}|${(variant.color_value || "").toLowerCase()}|${(variant.size || "").toLowerCase()}|${JSON.stringify(variant.attributes || {})}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(variant);
  });

  const result = [];
  groups.forEach((group) => {
    if (group.length === 1) {
      result.push(group[0]);
      return;
    }

    const best = group.reduce((a, b) => {
      const score = (v) =>
        (v.image_url ? 100 : 0) +
        (v.price && Number(v.price) > 0 ? 10 : 0) +
        (v.stock !== undefined && v.stock !== null && Number(v.stock) >= 0 ? 5 : 0) +
        (v.id ? 2 : 0);
      return score(a) >= score(b) ? a : b;
    });

    const bestImage = best.image_url || group.find((v) => v.image_url)?.image_url || "";
    result.push({ ...best, image_url: bestImage });
  });

  return result;
}

function normalizeProductVariantsForForm(product = {}) {
  product = product || {};
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.map((variant, index) => normalizeFormVariant(variant, index, product));
  }

  const variants = (product.sizes || []).map((sizeOption, index) =>
    normalizeFormVariant(
      {
        color_name: "Default",
        size: sizeOption.size,
        price: sizeOption.price,
        stock: product.stockQty ?? 24,
        image_url: product.image || "",
      },
      index,
      product,
    ),
  );

  return variants.length
    ? variants
    : [
        normalizeFormVariant(
          {
            color_name: "Default",
            color_value: "#1db7d8",
            size: "500ml",
            price: 18,
            stock: 24,
            image_url: product.image || "",
          },
          0,
          product,
        ),
      ];
}

function normalizeGalleryImagesForForm(product = {}) {
  product = product || {};
  const source = product.gallery_images || product.galleryImages || [];
  return source
    .map((entry, index) => ({
      id: typeof entry === "object" && entry?.id ? entry.id : `gallery-${index}`,
      image_url: typeof entry === "string" ? entry : entry?.image_url || entry?.image || entry?.url || "",
      sort_order: Number(typeof entry === "object" ? entry?.sort_order ?? entry?.sortOrder ?? index : index),
    }))
    .filter((entry) => entry.image_url);
}

function createGalleryImageEntry(index = 0, imageUrl = "") {
  return {
    id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    image_url: imageUrl,
    sort_order: index,
  };
}

function parseVariantGeneratorColors(value = "") {
  const seen = new Set();
  const result = [];

  value
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [name = "", colorValue = "", imageUrl = ""] = line.split("|").map((part) => part.trim());
      const colorName = name || "Default";
      const hex = (colorValue || "#1db7d8").toLowerCase();
      const key = `${colorName.toLowerCase()}|${hex}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ name: colorName, value: hex, imageUrl });
    });

  return result;
}

function parseVariantGeneratorSizes(value = "") {
  return value
    .split(/\n|,|;/)
    .map((size) => size.trim())
    .filter(Boolean);
}

function sizesFromFormVariants(variants, fallbackSize, fallbackPrice) {
  const bySize = new Map();
  variants.filter(isVariantVisible).forEach((variant) => {
    if (!variant.size) return;
    const current = bySize.get(variant.size);
    if (!current || Number(variant.price) < Number(current.price)) {
      bySize.set(variant.size, { size: variant.size, price: Number(variant.price || 0) });
    }
  });
  if (bySize.size) return Array.from(bySize.values());
  return variants.length
    ? []
    : [{ size: fallbackSize || "500ml", price: Number(fallbackPrice || 0) || 0 }];
}

function createProductFromForm(form) {
  const id = form.id || `product-${Date.now()}`;
  const slug = form.slug || makeSlug(form.nameEn);
  let variants = (form.variants || [])
    .filter((variant) => variant.color_name && variant.size)
    .map((variant, index) => ({
      ...normalizeFormVariant(variant, index, form),
      id: variant.id || `${id}-variant-${index}`,
      price: Number(variant.price || 0),
      wholesalePrice: variant.wholesalePrice != null ? Number(variant.wholesalePrice) : undefined,
      stock: Math.max(0, Number(variant.stock || 0)),
      sort_order: index,
    }));

  variants = cleanupDuplicateVariants(variants).map((v, i) => ({ ...v, sort_order: i }));
  const galleryImages = (form.galleryImages || [])
    .filter((image) => image.image_url)
    .map((image, index) => ({
      id: image.id || `gallery-${index}`,
      image_url: image.image_url,
      sort_order: index,
    }));
  const parsedSizes = sizesFromFormVariants(variants, form.size, form.price);

  return {
    id,
    slug,
    sku: form.sku || slug.toUpperCase(),
    name: createLocalizedCopy(form.nameEn, form.nameAr || form.nameEn),
    categoryId: form.categoryId,
    brand: form.brand || "EB Chemical",
    shortDescription: createLocalizedCopy(form.shortDescription, form.shortDescriptionAr || form.shortDescription),
    longDescription: createLocalizedCopy(form.fullDescription, form.fullDescriptionAr || form.fullDescription || form.shortDescription),
    howToUse: form.howToUse,
    ingredients: form.ingredients,
    benefits: form.benefits,
    skinTypes: form.skinTypes,
    concerns: form.concerns,
    image: form.image || "/images/products/product-placeholder.svg",
    hoverImage: form.hoverImage || form.image || "/images/products/product-placeholder.svg",
    productsPageImage: form.productsPageImage || "",
    productsPageHoverImage: form.productsPageHoverImage || "",
    fallbackImage: "/images/products/product-placeholder.svg",
    variants,
    gallery_images: galleryImages,
    galleryImages: galleryImages.map((image) => image.image_url),
    sizes: parsedSizes,
    badge: createLocalizedCopy(form.label || "Featured", form.labelAr || "مميز"),
    status: form.active ? "Active" : "Inactive",
    isActive: form.active,
    isFeatured: form.featured,
    isNewArrival: form.newArrival,
    isBestseller: form.bestseller,
    stockQty: variants.length
      ? variants.filter(isVariantVisible).reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
      : Number(form.stockQty || 0) || 0,
    stockStatus:
      (variants.length
        ? variants.filter(isVariantVisible).reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
        : Number(form.stockQty || 0)) > 0
        ? "In Stock"
        : "Out of Stock",
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    detailSectionImages: {
      howItWorks: form.dsiHowItWorks || "",
      howItWorks1: form.dsiHowItWorks1 || "",
      howItWorks2: form.dsiHowItWorks2 || "",
      howItWorks3: form.dsiHowItWorks3 || "",
      impact: form.dsiImpact || "",
      impact1: form.dsiImpact1 || "",
      impact2: form.dsiImpact2 || "",
      safeToUse: form.dsiSafeToUse || "",
      practicalBanner: form.dsiPracticalBanner || "",
      ingredients: form.dsiIngredients || "",
      faq: form.dsiFaq || "",
      mainImage: form.dsiMainImage || "",
    },
    detailStatements: form.detailStatements || [],
    customFields: form.customFields || {},
    customMedia: form.customMedia || {},
    customShowcase: form.customShowcase || {},
    createdAt: form.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function AdminMetricCard({ label, value, icon }) {
  return (
    <article className="admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{icon || ""}</small>
    </article>
  );
}

function Toolbar({ children, onAdd, addLabel }) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-main">{children}</div>
      {onAdd && (
        <button className="admin-primary-button" onClick={onAdd} type="button">
          {addLabel}
        </button>
      )}
    </div>
  );
}

function SearchField({ placeholder, value, onChange }) {
  return (
    <label className="admin-search-field">
      <Search size={15} />
      <input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AdminTable({ children }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">{children}</table>
    </div>
  );
}

function Badge({ tone = "active", children }) {
  return <span className={`admin-status-pill ${tone}`}>{children}</span>;
}

function MediaField({ label, language, name, value, onChange }) {
  const [isUploading, setIsUploading] = React.useState(false);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadImage(file);
      onChange({ target: { name, value: uploaded.url || uploaded.path } });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="admin-media-field">
      <label>
        {label}
        <input name={name} placeholder="https://..." value={value || ""} onChange={onChange} />
      </label>
      <label className="admin-upload-button">
        <Upload size={14} />
        {isUploading ? localized("Uploading...", "جاري الرفع...", "מעלה...", language) : localized("Upload", "رفع", "העלה", language)}
        <input accept="image/*" hidden type="file" onChange={handleUpload} />
      </label>
      {value && (
        <div className="admin-media-preview">
          <img alt="" src={value} />
        </div>
      )}
    </div>
  );
}

function PermissionNotice({ language, role }) {
  if (role === "admin") return null;
  return (
    <div className="message-panel warning">
      {role === "manager"
        ? localized("Manager access: content, catalog, orders, customers, and reviews can be managed. Staff and settings are restricted.", "وصول المدير: يمكن إدارة المحتوى والكتالوج والطلبات والعملاء والتقييمات. الموظفون والإعدادات مقيدة.", "גישת מנהל: ניתן לנהל תוכן, קטלוג, הזמנות, לקוחות וביקורות. צוות והגדרות מוגבלים.", language)
        : localized("Employee access: admin sections are available in view-only mode.", "وصول الموظف: أقسام الإدارة متاحة في وضع العرض فقط.", "גישת עובד: חלקי הניהול זמינים במצב צפייה בלבד.", language)}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="admin-empty-state">
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  );
}

function DashboardHome({ customers, language, orders, products, t }) {
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return (
    <>
      <div className="admin-range-row">
        <div className="admin-range-toggle">
          <button type="button">7d</button>
          <button className="active" type="button">30d</button>
          <button type="button">90d</button>
        </div>
        <div className="admin-date-filter">
          <span>{localized("or custom:", "أو مخصص:", "או מותאם:", language)}</span>
          <input type="date" />
          <span>{localized("to", "إلى", "עד", language)}</span>
          <input type="date" />
        </div>
      </div>
      <div className="admin-metric-grid">
        <AdminMetricCard label={localized("Sales", "المبيعات", "מכירות", language)} value={`${revenue} ${t("common.ils")}`} />
        <AdminMetricCard label={localized("Orders", "الطلبات", "הזמנות", language)} value={orders.length} />
        <AdminMetricCard label={localized("Customers", "العملاء", "לקוחות", language)} value={customers.length} />
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel-card">
          <h2>{localized("Revenue over time", "الإيرادات بمرور الوقت", "הכנסות לאורך זמן", language)}</h2>
          <p>{localized("Orders and revenue across the last 30 days", "الطلبات والإيرادات عبر آخر 30 يومًا", "הזמנות והכנסות ב-30 הימים האחרונים", language)}</p>
          <div className="admin-empty-chart">{orders.length ? `${revenue} ${t("common.ils")}` : localized("No revenue for this date range", "لا توجد إيرادات لهذا النطاق الزمني", "אין הכנסות לטווח תאריכים זה", language)}</div>
        </section>
        <section className="admin-panel-card">
          <h2>{localized("Order status distribution", "توزيع حالة الطلبات", "התפלגות סטטוס הזמנות", language)}</h2>
          <p>{localized("Current order mix for the selected range", "مزيج الطلبات الحالي للنطاق المحدد", "תערובת הזמנות נוכחית לטווח הנבחר", language)}</p>
          <div className="admin-empty-chart">{orders.length ? `${orders.length} ${localized("orders", "طلبات", "הזמנות", language)}` : localized("No orders for this date range", "لا توجد طلبات لهذا النطاق الزمني", "אין הזמנות לטווח תאריכים זה", language)}</div>
        </section>
        <section className="admin-panel-card">
          <h2>{localized("Top selling products", "المنتجات الأكثر مبيعًا", "מוצרים נמכרים ביותר", language)}</h2>
          <p>{localized("Ranked by units sold", "مرتبة حسب الوحدات المباعة", "מדורג לפי יחידות שנמכרו", language)}</p>
          <div className="admin-empty-chart">{products.length ? `${products.length} ${localized("products available", "منتجات متاحة", "מוצרים זמינים", language)}` : localized("No product sales for this date range", "لا توجد مبيعات منتجات لهذا النطاق الزمني", "אין מכירות מוצרים לטווח תאריכים זה", language)}</div>
        </section>
        <section className="admin-panel-card">
          <h2>{localized("Customer growth", "نمو العملاء", "גידול בלקוחות", language)}</h2>
          <p>{localized("New customer trend", "اتجاه العملاء الجدد", "מגמת לקוחות חדשים", language)}</p>
          <div className="admin-empty-chart">{customers.length ? `${customers.length} ${localized("customers", "عملاء", "לקוחות", language)}` : localized("No customers for this date range", "لا يوجد عملاء لهذا النطاق الزمني", "אין לקוחות לטווח תאריכים זה", language)}</div>
        </section>
      </div>
      <section className="admin-panel-card">
        <h2>{localized("Recent Orders", "الطلبات الأخيرة", "הזמנות אחרונות", language)}</h2>
        {orders.length ? (
          <AdminOrdersTable canAssign={false} canDelete={false} canUpdateStatus={false} language={language} orders={orders.slice(0, 5)} products={products} t={t} />
        ) : (
          <EmptyState title={localized("No recent orders", "لا توجد طلبات حديثة", "אין הזמנות אחרונות", language)} />
        )}
      </section>
    </>
  );
}

function ProductsListPage({ categories, filters, language, onAdd, onDeleteProduct, onEdit, products, readOnly, setFilters }) {
  const filtered = products.filter((product) => {
    const name = getText(product.name).toLowerCase();
    const sku = getProductSku(product).toLowerCase();
    const matchesSearch = !filters.search || name.includes(filters.search.toLowerCase()) || sku.includes(filters.search.toLowerCase());
    const matchesBrand = filters.brand === "all" || (product.brand || "EB Chemical") === filters.brand;
    const matchesCategory = filters.category === "all" || product.categoryId === filters.category;
    const matchesStatus = filters.status === "all" || (filters.status === "active" ? product.isActive !== false : product.isActive === false);
    return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
  });

  return (
    <section className="admin-panel-card">
      <Toolbar addLabel={localized("Add Product", "إضافة منتج", "הוסף מוצר", language)} onAdd={readOnly ? null : onAdd}>
        <SearchField placeholder={localized("Search by name, SKU...", "بحث بالاسم، رمز المنتج...", "חפש לפי שם, מק״ט...", language)} value={filters.search} onChange={(value) => setFilters((current) => ({ ...current, search: value }))} />
        <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
          <option value="all">{localized("All categories", "جميع التصنيفات", "כל הקטגוריות", language)}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{getText(category.name)}</option>
          ))}
        </select>
        <select value={filters.brand} onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}>
          <option value="all">{localized("All brands", "جميع العلامات التجارية", "כל המותגים", language)}</option>
          <option value="EB Chemical">EB Chemical</option>
        </select>
        <div className="admin-segmented">
          {["all", "active", "inactive"].map((status) => (
            <button className={filters.status === status ? "active" : ""} key={status} onClick={() => setFilters((current) => ({ ...current, status }))} type="button">
              {status === "all" ? localized("All", "الكل", "הכל", language) : status[0].toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </Toolbar>
      <AdminTable>
        <thead>
          <tr>
            <th>{localized("Image", "الصورة", "תמונה", language)}</th>
            <th>{localized("Name", "الاسم", "שם", language)}</th>
            <th>{localized("Category", "التصنيف", "קטגוריה", language)}</th>
            <th>{localized("Brand", "العلامة التجارية", "מותג", language)}</th>
            <th>{localized("Variants", "البدائل", "וריאציות", language)}</th>
            <th>{localized("Price", "السعر", "מחיר", language)}</th>
            <th>{localized("Stock", "المخزون", "מלאי", language)}</th>
            <th>{localized("Status", "الحالة", "סטטוס", language)}</th>
            <th>{localized("Created", "تاريخ الإنشاء", "נוצר", language)}</th>
            <th>{localized("Updated", "آخر تحديث", "עודכן", language)}</th>
            {!readOnly && <th>{localized("Actions", "الإجراءات", "פעולות", language)}</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.map((product) => {
            const category = categories.find((entry) => entry.id === product.categoryId);
            const stock = getStockQty(product);
            return (
              <tr key={product.id}>
                <td><img className="admin-thumb" alt="" src={product.image || product.fallbackImage} /></td>
                <td><strong>{getText(product.name)}</strong><span className="table-muted">{getProductSku(product)}</span></td>
                <td>{getText(category?.name) || "-"}</td>
                <td>{product.brand || "EB Chemical"}</td>
                <td>{product.sizes?.length || 1}</td>
                <td><strong>{getProductPrice(product)} ILS</strong></td>
                <td>{stock}</td>
                <td>
                  <div className="admin-badge-stack">
                    <Badge tone={product.isActive === false ? "neutral" : "active"}>{product.isActive === false ? localized("Inactive", "غير نشط", "לא פעיל", language) : localized("Active", "نشط", "פעיל", language)}</Badge>
                    {product.isFeatured && <Badge>{localized("Featured", "مميز", "מומלץ", language)}</Badge>}
                    {stock <= 0 && <Badge tone="danger">{localized("Out of stock", "نفد من المخزون", "אזל מהמלאי", language)}</Badge>}
                  </div>
                </td>
                <td>{formatDate(product.createdAt, language)}</td>
                <td>{formatDate(product.updatedAt, language)}</td>
                {!readOnly && (
                  <td>
                    <div className="row-actions">
                      <button className="text-action" onClick={() => onEdit(product)} type="button">{localized("Edit", "تعديل", "ערוך", language)}</button>
                      <button className="text-action danger" onClick={() => onDeleteProduct(product.id)} type="button">{localized("Delete", "حذف", "מחק", language)}</button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </AdminTable>
    </section>
  );
}

function ProductWizard({ categories, editingProduct, language, onCancel, onSave, productSchema }) {
  const [step, setStep] = React.useState("basic");
  const initialCategoryOptions = getSelectableAdminCategories(categories, editingProduct?.categoryId);
  const [uploadError, setUploadError] = React.useState("");
  const [uploadingField, setUploadingField] = React.useState("");
  const [uploadingVariantIndex, setUploadingVariantIndex] = React.useState(-1);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = React.useState(-1);
  const [variantGenerator, setVariantGenerator] = React.useState({
    colorsText: "Default|#1db7d8",
    sizesText: "500ml, 1L, 5L",
    defaultPrice: "18",
    defaultWholesalePrice: "",
    defaultStock: "24",
  });
  const [form, setForm] = React.useState(() => ({
    id: editingProduct?.id || "",
    nameEn: getText(editingProduct?.name) || "",
    nameAr: editingProduct?.name?.ar || "",
    slug: editingProduct?.slug || "",
    sku: editingProduct?.sku || "",
    categoryId: editingProduct?.categoryId || initialCategoryOptions[0]?.id || "",
    brand: editingProduct?.brand || "EB Chemical",
    size: editingProduct?.sizes?.[0]?.size || "500ml",
    price: editingProduct?.sizes?.[0]?.price || "",
    stockQty: getStockQty(editingProduct || {}),
    shortDescription: getText(editingProduct?.shortDescription),
    shortDescriptionAr: editingProduct?.shortDescription?.ar || "",
    fullDescription: getText(editingProduct?.longDescription),
    fullDescriptionAr: editingProduct?.longDescription?.ar || "",
    howToUse: editingProduct?.howToUse || "",
    ingredients: editingProduct?.ingredients || "",
    benefits: editingProduct?.benefits || "",
    skinTypes: editingProduct?.skinTypes || "",
    concerns: editingProduct?.concerns || "",
    image: editingProduct?.image || "",
    hoverImage: editingProduct?.hoverImage || "",
    productsPageImage: editingProduct?.productsPageImage || "",
    productsPageHoverImage: editingProduct?.productsPageHoverImage || "",
    galleryImages: normalizeGalleryImagesForForm(editingProduct),
    variants: normalizeProductVariantsForForm(editingProduct),
    videoUrl: editingProduct?.videoUrl || "",
    metaTitle: editingProduct?.metaTitle || "",
    metaDescription: editingProduct?.metaDescription || "",
    dsiHowItWorks: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).howItWorks || "",
    dsiHowItWorks1: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).howItWorks1 || "",
    dsiHowItWorks2: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).howItWorks2 || "",
    dsiHowItWorks3: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).howItWorks3 || "",
    dsiImpact: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).impact || "",
    dsiImpact1: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).impact1 || "",
    dsiImpact2: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).impact2 || "",
    dsiSafeToUse: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).safeToUse || "",
    dsiPracticalBanner: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).practicalBanner || "",
    dsiIngredients: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).ingredients || "",
    dsiFaq: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).faq || "",
    dsiMainImage: (editingProduct?.detailSectionImages || editingProduct?.detail_section_images || {}).mainImage || "",
    label: editingProduct?.badge?.en || "",
    labelAr: editingProduct?.badge?.ar || "",
    active: editingProduct?.isActive !== false,
    featured: Boolean(editingProduct?.isFeatured),
    newArrival: Boolean(editingProduct?.isNewArrival),
    bestseller: Boolean(editingProduct?.isBestseller),
    detailStatements: editingProduct?.detailStatements || editingProduct?.detail_statements || [],
    customFields: editingProduct?.customFields || {},
    customMedia: editingProduct?.customMedia || {},
    customShowcase: editingProduct?.customShowcase || {},
  }));

  const enabledTabs = productSchema.tabs.filter((tab) => tab.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder);
  const tabs = enabledTabs.map((tab) => tab.key);
  const tabLabels = enabledTabs.map((tab) => tab.label?.[language] || tab.label?.en || tab.key);
  const selectableCategories = getSelectableAdminCategories(categories, form.categoryId);
  const knownFieldKeys = new Set([
    "nameEn", "nameAr", "slug", "sku", "categoryId", "brand", "shortDescription", "shortDescriptionAr",
    "fullDescription", "fullDescriptionAr", "howToUse", "ingredients", "benefits", "skinTypes", "concerns",
    "active", "featured", "newArrival", "bestseller", "label", "labelAr", "metaTitle", "metaDescription",
  ]);
  const builtInMediaKeys = new Set(["image", "hoverImage", "videoUrl", "galleryImages", "detailStatements", "dsiHowItWorks1", "dsiHowItWorks2", "dsiHowItWorks3", "dsiImpact1", "dsiImpact2", "dsiSafeToUse", "dsiPracticalBanner", "dsiIngredients", "dsiFaq"]);
  const variantAttributes = productSchema.variantAttributes.filter((field) => field.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder);

  React.useEffect(() => {
    if (!tabs.includes(step)) setStep(tabs[0] || "basic");
  }, [step, tabs.join("|")]);

  function schemaValue(field, bucket = "customFields") {
    if (knownFieldKeys.has(field.key)) return form[field.key] ?? field.defaultValue ?? "";
    return form[bucket]?.[field.key] ?? field.defaultValue ?? (field.type === "multi_select" ? [] : "");
  }

  function setSchemaValue(field, value, bucket = "customFields") {
    setForm((current) => knownFieldKeys.has(field.key)
      ? { ...current, [field.key]: value }
      : { ...current, [bucket]: { ...(current[bucket] || {}), [field.key]: value } });
  }

  function renderSchemaField(field, bucket = "customFields") {
    const label = productFieldLabel(field, language);
    const value = schemaValue(field, bucket);
    if (field.key === "categoryId") {
      return <label key={field.key}>{label}{field.required ? " *" : ""}<select required={field.required} value={value} onChange={(event) => setSchemaValue(field, event.target.value, bucket)}>{selectableCategories.map((category) => <option key={category.id} value={category.id}>{getText(category.name)}</option>)}</select></label>;
    }
    if (field.type === "boolean") return <label className="checkbox-line" key={field.key}><input checked={value === true} type="checkbox" onChange={(event) => setSchemaValue(field, event.target.checked, bucket)} />{label}</label>;
    if (field.type === "textarea") return <label key={field.key}>{label}{field.required ? " *" : ""}<textarea required={field.required} value={value || ""} onChange={(event) => setSchemaValue(field, event.target.value, bucket)} /></label>;
    if (field.type === "select") return <label key={field.key}>{label}{field.required ? " *" : ""}<select required={field.required} value={value || ""} onChange={(event) => setSchemaValue(field, event.target.value, bucket)}><option value="">Select…</option>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label?.[language] || option.label?.en || option.value}</option>)}</select></label>;
    if (field.type === "multi_select") return <label key={field.key}>{label}<select multiple value={Array.isArray(value) ? value : []} onChange={(event) => setSchemaValue(field, [...event.target.selectedOptions].map((option) => option.value), bucket)}>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label?.[language] || option.label?.en || option.value}</option>)}</select></label>;
    const type = ["number", "date", "url"].includes(field.type) ? field.type : "text";
    return <label key={field.key}>{label}{field.required ? " *" : ""}<input required={field.required} type={type} value={value ?? ""} onChange={(event) => setSchemaValue(field, event.target.value, bucket)} /></label>;
  }

  function mediaEnabled(key) {
    return Boolean(enabledProductField(productSchema, key));
  }

  function change(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...(current.variants || []),
        normalizeFormVariant(
          {
            color_name: "",
            color_value: "#1db7d8",
            size: "",
            price: 0,
            stock: 0,
            image_url: current.image || "",
          },
          current.variants?.length || 0,
          current,
        ),
      ],
    }));
  }

  function updateVariant(index, field, value) {
    const directFields = new Set([
      "color_name",
      "color_value",
      "size",
      "price",
      "stock",
      "image_url",
      "isVisible",
    ]);
    setForm((current) => ({
      ...current,
      variants: (current.variants || []).map((variant, variantIndex) =>
        variantIndex === index
          ? directFields.has(field)
            ? { ...variant, [field]: value }
            : { ...variant, attributes: { ...(variant.attributes || {}), [field]: value } }
          : variant,
      ),
    }));
  }

  function removeVariant(index) {
    setForm((current) => ({
      ...current,
      variants: (current.variants || []).filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function updateVariantGenerator(field, value) {
    setVariantGenerator((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateVariants() {
    const colors = parseVariantGeneratorColors(variantGenerator.colorsText);
    const sizes = parseVariantGeneratorSizes(variantGenerator.sizesText);

    if (!colors.length || !sizes.length) {
      setUploadError(localized("Add at least one color and one size.", "أضف لونًا واحدًا وحجمًا واحدًا على الأقل.", "הוסף לפחות צבע אחד ומידה אחת.", language));
      return;
    }

    setUploadError("");
    setForm((current) => {
      const currentVariants = current.variants || [];
      const existingKeys = new Set(
        currentVariants.map(
          (variant) => `${(variant.color_name || "").toLowerCase()}|${(variant.color_value || "").toLowerCase()}|${(variant.size || "").toLowerCase()}`,
        ),
      );
      const generated = [];
      const batchKeys = new Set();

      colors.forEach((color) => {
        sizes.forEach((size) => {
          const key = `${color.name.toLowerCase()}|${color.value.toLowerCase()}|${size.toLowerCase()}`;
          if (existingKeys.has(key) || batchKeys.has(key)) return;
          batchKeys.add(key);

          generated.push(
            normalizeFormVariant(
              {
                color_name: color.name,
                color_value: color.value,
                size,
                price: variantGenerator.defaultPrice,
                wholesalePrice: variantGenerator.defaultWholesalePrice || undefined,
                stock: variantGenerator.defaultStock,
                image_url: color.imageUrl || current.image || "",
              },
              currentVariants.length + generated.length,
              current,
            ),
          );
        });
      });

      return {
        ...current,
        variants: [...currentVariants, ...generated],
      };
    });
  }

  async function uploadVariantImage(index, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploadingVariantIndex(index);
    try {
      const uploaded = await uploadImage(file);
      updateVariant(index, "image_url", uploaded.url || uploaded.path || "");
    } catch (error) {
      setUploadError(localized("Variant image upload failed.", "فشل رفع صورة البديل.", "העלאת תמונת הווריאציה נכשלה.", language));
    } finally {
      setUploadingVariantIndex(-1);
    }
  }

  async function uploadGallery(event) {
    const files = event.target.files;
    event.target.value = "";
    if (!files?.length) return;

    setUploadError("");
    setUploadingField("galleryImages");
    try {
      const uploaded = await uploadImages(files);
      setForm((current) => {
        const currentImages = current.galleryImages || [];
        return {
          ...current,
          galleryImages: [
            ...currentImages,
            ...uploaded
              .map((item, index) => ({
                id: `gallery-${Date.now()}-${index}`,
                image_url: item.url || item.path,
                sort_order: currentImages.length + index,
              }))
              .filter((item) => item.image_url),
          ],
        };
      });
    } catch (error) {
      setUploadError(localized("Gallery images upload failed.", "فشل رفع صور المعرض.", "העלאת תמונות הגלריה נכשלה.", language));
    } finally {
      setUploadingField("");
    }
  }

  function removeGalleryImage(index) {
    setForm((current) => ({
      ...current,
      galleryImages: (current.galleryImages || [])
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, sortIndex) => ({ ...image, sort_order: sortIndex })),
    }));
  }

  function addGalleryImageField() {
    setForm((current) => {
      const currentImages = current.galleryImages || [];
      return {
        ...current,
        galleryImages: [...currentImages, createGalleryImageEntry(currentImages.length)],
      };
    });
  }

  function updateGalleryImage(index, value) {
    setForm((current) => ({
      ...current,
      galleryImages: (current.galleryImages || []).map((image, imageIndex) =>
        imageIndex === index ? { ...image, image_url: value } : image,
      ),
    }));
  }

  async function uploadGalleryItem(index, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploadingGalleryIndex(index);
    try {
      const uploaded = await uploadImage(file);
      updateGalleryImage(index, uploaded.url || uploaded.path || "");
    } catch (error) {
      setUploadError(localized("Gallery image upload failed.", "فشل رفع صورة المعرض.", "העלאת תמונת הגלריה נכשלה.", language));
    } finally {
      setUploadingGalleryIndex(-1);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const payload = createProductFromForm(form);
    payload.customFields = Object.fromEntries(productSchema.fields.filter((field) => field.enabled !== false && !knownFieldKeys.has(field.key)).map((field) => [field.key, form.customFields?.[field.key] ?? field.defaultValue ?? ""]));
    payload.customMedia = Object.fromEntries(productSchema.mediaFields.filter((field) => field.enabled !== false && !builtInMediaKeys.has(field.key)).map((field) => [field.key, form.customMedia?.[field.key] ?? field.defaultValue ?? ""]));
    payload.customShowcase = Object.fromEntries(productSchema.showcaseSections.filter((section) => section.enabled !== false).map((section) => [section.key, Object.fromEntries((section.fields || []).filter((field) => field.enabled !== false).map((field) => [field.key, form.customShowcase?.[section.key]?.[field.key] ?? field.defaultValue ?? ""]))]));
    const customVariantKeys = new Set(variantAttributes.filter((field) => !["color_name", "color_value", "size"].includes(field.key)).map((field) => field.key));
    payload.variants = payload.variants.map((variant) => ({ ...variant, attributes: Object.fromEntries(Object.entries(variant.attributes || {}).filter(([key]) => customVariantKeys.has(key))) }));
    const result = await onSave(payload);
    if (result?.ok) onCancel();
  }

  return (
    <section className="admin-panel-card">
      <div className="admin-tabs">
        {tabs.map((tab, index) => (
          <button className={step === tab ? "active" : ""} key={tab} onClick={() => setStep(tab)} type="button">
            {index + 1}. {tabLabels[index]}
          </button>
        ))}
      </div>
      <form className="admin-form admin-wizard-form" onSubmit={submit}>
        {step === "basic" && (
          <>
            {productSchema.fields.filter((field) => field.tab === "basic" && field.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder).map((field) => renderSchemaField(field))}
            <p className="admin-note full-field">{localized("Pricing managed per variant. Set price, sale price, and stock individually for each variant below.", "تتم إدارة التسعير لكل بديل. حدد السعر وسعر البيع والمخزون لكل بديل أدناه.", "התמחור מנוהל לפי וריאציה. הגדר מחיר, מחיר מבצע ומלאי בנפרד עבור כל וריאציה למטה.", language)}</p>
          </>
        )}
        {step === "variants" && (
          <div className="full-field admin-variants-editor">
            <div className="admin-inline-heading">
              <strong>{localized("Color, size, price, and stock combinations", "مجموعات الألوان والأحجام والأسعار والمخزون", "שילובי צבע, מידה, מחיר ומלאי", language)}</strong>
              <button className="secondary-action compact-action" onClick={addVariant} type="button">
                {localized("Add Variant", "إضافة بديل", "הוסף וריאציה", language)}
              </button>
            </div>
            {variantAttributes.some((field) => field.key === "color_name") && variantAttributes.some((field) => field.key === "size") && <div className="variant-generator-panel">
              <div>
                <strong>{localized("Variant Generator", "مولد البدائل", "מחולל וריאציות", language)}</strong>
                <p>{localized("Enter each color on a new line: name|hex|optional image URL. Separate sizes with commas.", "أدخل كل لون في سطر جديد: الاسم|اللون|رابط الصورة الاختياري. افصل الأحجام بفواصل.", "הזן כל צבע בשורה חדשה: שם|הקסדצימלי|כתובת תמונה אופציונלית. הפרד מידות בפסיקים.", language)}</p>
              </div>
              <label>
                {localized("Colors", "الألوان", "צבעים", language)}
                <textarea
                  value={variantGenerator.colorsText}
                  onChange={(event) => updateVariantGenerator("colorsText", event.target.value)}
                />
              </label>
              <label>
                {localized("Sizes", "الأحجام", "גדלים", language)}
                <input
                  value={variantGenerator.sizesText}
                  onChange={(event) => updateVariantGenerator("sizesText", event.target.value)}
                />
              </label>
              <label>
                {localized("Default price", "السعر الافتراضي", "מחיר ברירת מחדל", language)}
                <input
                  min="0"
                  type="number"
                  value={variantGenerator.defaultPrice}
                  onChange={(event) => updateVariantGenerator("defaultPrice", event.target.value)}
                />
              </label>
              <label>
                {localized("Default wholesale price", "سعر الجملة الافتراضي", "מחיר סיטונאי ברירת מחדל", language)}
                <input
                  min="0"
                  type="number"
                  value={variantGenerator.defaultWholesalePrice}
                  onChange={(event) => updateVariantGenerator("defaultWholesalePrice", event.target.value)}
                />
              </label>
              <label>
                {localized("Default stock", "المخزون الافتراضي", "מלאי ברירת מחדל", language)}
                <input
                  min="0"
                  type="number"
                  value={variantGenerator.defaultStock}
                  onChange={(event) => updateVariantGenerator("defaultStock", event.target.value)}
                />
              </label>
              <button className="admin-primary-button compact-action" onClick={generateVariants} type="button">
                {localized("Generate Variants", "توليد البدائل", "צור וריאציות", language)}
              </button>
            </div>}
            <div className="admin-variant-grid">
              {(form.variants || []).map((variant, index) => (
                <div className="admin-variant-row" key={variant.id || index}>
                  {variantAttributes.map((field) => {
                    const value = ["color_name", "color_value", "size"].includes(field.key) ? variant[field.key] : variant.attributes?.[field.key] ?? field.defaultValue ?? "";
                    if (field.type === "boolean") return <label className="checkbox-line" key={field.key}><input checked={value === true} type="checkbox" onChange={(event) => updateVariant(index, field.key, event.target.checked)} />{productFieldLabel(field, language)}</label>;
                    if (field.type === "select") return <label key={field.key}>{productFieldLabel(field, language)}<select required={field.required} value={value} onChange={(event) => updateVariant(index, field.key, event.target.value)}><option value="">Select…</option>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label?.[language] || option.label?.en || option.value}</option>)}</select></label>;
                    if (field.type === "multi_select") return <label key={field.key}>{productFieldLabel(field, language)}<select multiple value={Array.isArray(value) ? value : []} onChange={(event) => updateVariant(index, field.key, [...event.target.selectedOptions].map((option) => option.value))}>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label?.[language] || option.label?.en || option.value}</option>)}</select></label>;
                    if (field.type === "textarea") return <label key={field.key}>{productFieldLabel(field, language)}<textarea required={field.required} value={value} onChange={(event) => updateVariant(index, field.key, event.target.value)} /></label>;
                    return <label key={field.key}>{productFieldLabel(field, language)}<input required={field.required} type={field.type === "number" ? "number" : "text"} value={value} onChange={(event) => updateVariant(index, field.key, event.target.value)} /></label>;
                  })}
                  <label>{localized("Price", "السعر", "מחיר", language)}<input min="0" required type="number" value={variant.price} onChange={(event) => updateVariant(index, "price", event.target.value)} /></label>
                  <label>{localized("Wholesale Price", "سعر الجملة", "מחיר סיטונאי", language)}<input min="0" type="number" value={variant.wholesalePrice ?? ""} onChange={(event) => updateVariant(index, "wholesalePrice", event.target.value ? Number(event.target.value) : undefined)} /></label>
                  <label>{localized("Stock", "المخزون", "מלאי", language)}<input min="0" required type="number" value={variant.stock} onChange={(event) => updateVariant(index, "stock", event.target.value)} /></label>
                  <label>
                    {localized("Variant image", "صورة البديل", "תמונת וריאציה", language)}
                    <span className="image-upload-row">
                      <input value={variant.image_url} onChange={(event) => updateVariant(index, "image_url", event.target.value)} />
                      <span className="upload-button-shell">
                        <input accept="image/*" type="file" onChange={(event) => uploadVariantImage(index, event)} />
                        <span>{uploadingVariantIndex === index ? localized("Uploading...", "جاري الرفع...", "מעלה...", language) : localized("Upload", "رفع", "העלה", language)}</span>
                      </span>
                    </span>
                    {variant.image_url && <img className="admin-image-preview small-preview" alt="" src={variant.image_url} />}
                  </label>
                  <label className="checkbox-line">
                    <input
                      checked={variant.isVisible !== false}
                      onChange={(event) => updateVariant(index, "isVisible", event.target.checked)}
                      type="checkbox"
                    />
                    {localized("Show on website", "عرض على الموقع", "הצג באתר", language)}
                    <span>{variant.isVisible !== false ? localized("Visible", "مرئي", "גלוי", language) : localized("Hidden", "مخفي", "מוסתר", language)}</span>
                  </label>
                  <button className="text-action danger" onClick={() => removeVariant(index)} type="button">{localized("Remove", "إزالة", "הסר", language)}</button>
                </div>
              ))}
            </div>
            {uploadError && <div className="message-panel error full-field">{uploadError}</div>}
          </div>
        )}
        {step === "media" && (
          <>
            {mediaEnabled("image") && <MediaField label={productFieldLabel(enabledProductField(productSchema, "image"), language)} language={language} name="image" value={form.image} onChange={change} />}
            {mediaEnabled("hoverImage") && <MediaField label={productFieldLabel(enabledProductField(productSchema, "hoverImage"), language)} language={language} name="hoverImage" value={form.hoverImage} onChange={change} />}
            {mediaEnabled("videoUrl") && <label>{productFieldLabel(enabledProductField(productSchema, "videoUrl"), language)}<input name="videoUrl" value={form.videoUrl} onChange={change} /></label>}
            {mediaEnabled("galleryImages") && <div className="full-field admin-gallery-editor">
              <div className="admin-inline-heading">
                <strong>{localized("Vertical Gallery Images", "صور المعرض العمودي", "תמונות גלריה אנכיות", language)}</strong>
                <label className="admin-upload-button">
                  <Upload size={14} />
                  {uploadingField === "galleryImages" ? localized("Uploading...", "جاري الرفع...", "מעלה...", language) : localized("Upload Gallery Images", "رفع صور المعرض", "העלה תמונות גלריה", language)}
                  <input accept="image/*" hidden multiple type="file" onChange={uploadGallery} />
                </label>
                <button className="secondary-action compact-action" onClick={addGalleryImageField} type="button">
                  {localized("+ Add image field", "+ إضافة حقل صورة", "+ הוסף שדה תמונה", language)}
                </button>
              </div>
              <div className="admin-gallery-preview-grid">
                {(form.galleryImages || []).map((image, index) => (
                  <figure className="admin-gallery-preview" key={`${image.image_url}-${index}`}>
                    <label>
                      {localized("Image URL", "رابط الصورة", "כתובת תמונה", language)}
                      <span className="image-upload-row">
                        <input
                          value={image.image_url}
                          onChange={(event) => updateGalleryImage(index, event.target.value)}
                        />
                        <span className="upload-button-shell">
                          <input
                            accept="image/*"
                            aria-label="Upload gallery image"
                            onChange={(event) => uploadGalleryItem(index, event)}
                            type="file"
                          />
                          <span>{uploadingGalleryIndex === index ? localized("Uploading...", "جاري الرفع...", "מעלה...", language) : localized("Upload", "رفع", "העלה", language)}</span>
                        </span>
                      </span>
                    </label>
                    {image.image_url && <img alt="" src={image.image_url} />}
                    <button onClick={() => removeGalleryImage(index)} type="button">{localized("Remove", "إزالة", "הסר", language)}</button>
                  </figure>
                ))}
              </div>
              {uploadError && <div className="message-panel error full-field">{uploadError}</div>}
            </div>}
            <div className="full-field">
              <strong>{localized("Product Details Section Images", "صور قسم تفاصيل المنتج", "תמונות חלק פרטי המוצר", language)}</strong>
              <div className="admin-dsi-grid">
                {[
                  { key: "dsiHowItWorks1", label: localized("How it Works image 1", "صورة كيف يعمل 1", "תמונה איך זה עובד 1", language) },
                  { key: "dsiHowItWorks2", label: localized("How it Works image 2", "صورة كيف يعمل 2", "תמונה איך זה עובד 2", language) },
                  { key: "dsiHowItWorks3", label: localized("How it Works image 3", "صورة كيف يعمل 3", "תמונה איך זה עובד 3", language) },
                  { key: "dsiImpact1", label: localized("Impact section image 1", "صورة قسم التأثير 1", "תמונת קטע השפעה 1", language) },
                  { key: "dsiImpact2", label: localized("Impact section image 2", "صورة قسم التأثير 2", "תמונת קטע השפעה 2", language) },
                  { key: "dsiSafeToUse", label: localized("Safe to use image", "صورة آمن للاستخدام", "תמונה בטוח לשימוש", language) },
                  { key: "dsiPracticalBanner", label: localized("Practical banner image", "صورة اللافتة العملية", "תמונת באנר מעשי", language) },
                  { key: "dsiIngredients", label: localized("Ingredients section image", "صورة قسم المكونات", "תמונת קטע רכיבים", language) },
                  { key: "dsiFaq", label: localized("FAQ side image", "صورة جانب الأسئلة الشائعة", "תמונת צד לשאלות נפוצות", language) },
                ].filter(({ key }) => mediaEnabled(key)).map(({ key, label }) => (
                  <MediaField key={key} label={productFieldLabel(enabledProductField(productSchema, key), language) || label} language={language} name={key} value={form[key] || ""} onChange={change} />
                ))}
              </div>
            </div>
            {mediaEnabled("detailStatements") && <div className="full-field">
              <strong>{localized("Product Details Banner Statements", "عبارات لافتة تفاصيل المنتج", "הצהרות באנר לפרטי המוצר", language)}</strong>
              <div className="admin-dsi-grid">
                {(form.detailStatements || []).map((statement, index) => (
                  <div className="admin-media-field" key={index}>
                    <label>
                      {localized("Statement", "عبارة", "הצהרה", language)} {index + 1} - English
                      <input
                        value={statement.en || ""}
                        onChange={(event) =>
                          setForm((current) => {
                            const updated = [...(current.detailStatements || [])];
                            updated[index] = { ...updated[index], en: event.target.value, ar: updated[index]?.ar || "" };
                            return { ...current, detailStatements: updated };
                          })
                        }
                      />
                    </label>
                    <label>
                      {localized("Statement", "عبارة", "הצהרה", language)} {index + 1} - Arabic
                      <input
                        value={statement.ar || ""}
                        onChange={(event) =>
                          setForm((current) => {
                            const updated = [...(current.detailStatements || [])];
                            updated[index] = { ...updated[index], ar: event.target.value, en: updated[index]?.en || "" };
                            return { ...current, detailStatements: updated };
                          })
                        }
                      />
                    </label>
                    <button
                      className="text-action danger"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          detailStatements: (current.detailStatements || []).filter((_, i) => i !== index),
                        }))
                      }
                      type="button"
                    >
                      {localized("Remove", "إزالة", "הסר", language)}
                    </button>
                  </div>
                ))}
                <button
                  className="secondary-action compact-action"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      detailStatements: [...(current.detailStatements || []), { en: "", ar: "" }],
                    }))
                  }
                  type="button"
                >
                  {localized("+ Add statement", "+ إضافة عبارة", "+ הוסף הצהרה", language)}
                </button>
              </div>
            </div>}
            {productSchema.mediaFields.filter((field) => field.enabled !== false && !builtInMediaKeys.has(field.key)).sort((a, b) => a.sortOrder - b.sortOrder).map((field) => renderSchemaField(field, "customMedia"))}
          </>
        )}
        {step === "seo" && (
          <>
            {productSchema.fields.filter((field) => field.tab === "seo" && field.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder).map((field) => renderSchemaField(field))}
          </>
        )}
        {step === "showcase" && (
          <div className="full-field product-showcase-form-sections">
            {productSchema.showcaseSections.filter((section) => section.enabled !== false).map((section) => (
              <section className="product-showcase-form-section" key={section.key}>
                <h3>{section.title?.[language] || section.title?.en || section.key}</h3>
                {(section.fields || []).filter((field) => field.enabled !== false).map((field) => {
                  const value = form.customShowcase?.[section.key]?.[field.key] ?? field.defaultValue ?? "";
                  const setValue = (nextValue) => setForm((current) => ({ ...current, customShowcase: { ...(current.customShowcase || {}), [section.key]: { ...(current.customShowcase?.[section.key] || {}), [field.key]: nextValue } } }));
                  if (field.type === "textarea") return <label key={field.key}>{productFieldLabel(field, language)}<textarea value={value} onChange={(event) => setValue(event.target.value)} /></label>;
                  if (field.type === "boolean") return <label className="checkbox-line" key={field.key}><input checked={value === true} type="checkbox" onChange={(event) => setValue(event.target.checked)} />{productFieldLabel(field, language)}</label>;
                  if (field.type === "select") return <label key={field.key}>{productFieldLabel(field, language)}<select value={value} onChange={(event) => setValue(event.target.value)}><option value="">Select…</option>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label?.[language] || option.label?.en || option.value}</option>)}</select></label>;
                  if (field.type === "multi_select") return <label key={field.key}>{productFieldLabel(field, language)}<select multiple value={Array.isArray(value) ? value : []} onChange={(event) => setValue([...event.target.selectedOptions].map((option) => option.value))}>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label?.[language] || option.label?.en || option.value}</option>)}</select></label>;
                  return <label key={field.key}>{productFieldLabel(field, language)}<input type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"} value={value} onChange={(event) => setValue(event.target.value)} /></label>;
                })}
                {!section.fields?.length && <p className="admin-note">{localized("This section uses the existing EB Chemical product content.", "يستخدم هذا القسم محتوى منتج EB Chemical الحالي.", "סעיף זה משתמש בתוכן המוצר הקיים של EB Chemical.", language)}</p>}
              </section>
            ))}
          </div>
        )}
        {step === "custom_sections" && <>{productSchema.fields.filter((field) => field.tab === "custom_sections" && field.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder).map((field) => renderSchemaField(field))}</>}
        <div className="form-actions full-field">
          <button className="secondary-action" disabled={tabs.indexOf(step) === 0} onClick={() => setStep(tabs[tabs.indexOf(step) - 1])} type="button">{localized("Previous", "السابق", "הקודם", language)}</button>
          <button className="secondary-action" disabled={tabs.indexOf(step) === tabs.length - 1} onClick={() => setStep(tabs[tabs.indexOf(step) + 1])} type="button">{localized("Next", "التالي", "הבא", language)}</button>
          <button className="secondary-action" onClick={onCancel} type="button">{localized("Cancel", "إلغاء", "ביטול", language)}</button>
          <button className="admin-primary-button" type="submit">{editingProduct ? localized("Save Product", "حفظ المنتج", "שמור מוצר", language) : localized("Create Product", "إنشاء منتج", "צור מוצר", language)}</button>
        </div>
      </form>
    </section>
  );
}

function GenericEntityForm({ fields, initial, language, onCancel, onSave, submitLabel, title }) {
  const [form, setForm] = React.useState(initial);
  function change(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }
  return (
    <section className="admin-panel-card">
      <h2>{title}</h2>
      <form className="admin-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
        {fields.map((field) => {
          if (field.type === "textarea") return <label key={field.name}>{field.label}<textarea name={field.name} value={form[field.name] || ""} onChange={change} /></label>;
          if (field.type === "checkbox") return <label className="checkbox-line" key={field.name}><input name={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={change} />{field.label}</label>;
          if (field.type === "media") return <MediaField key={field.name} label={field.label} language={language} name={field.name} value={form[field.name]} onChange={change} />;
          if (field.type === "select") return <label key={field.name}>{field.label}<select name={field.name} value={form[field.name] || ""} onChange={change}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
          return <label key={field.name}>{field.label}<input name={field.name} required={field.required} value={form[field.name] || ""} onChange={change} /></label>;
        })}
        <div className="form-actions full-field">
          <button className="secondary-action" onClick={onCancel} type="button">{localized("Cancel", "إلغاء", "ביטול", language)}</button>
          <button className="admin-primary-button" type="submit">{submitLabel || localized("Create", "إنشاء", "צור", language)}</button>
        </div>
      </form>
    </section>
  );
}

function SettingsPage({ language }) {
  const [tab, setTab] = React.useState("general");
  const [settings, setSettings] = React.useState(() => readStorage(storageKeys.settings, {}));
  const tabLabels = {
    general: localized("General", "عام", "כללי", language),
    social: localized("Social", "وسائل التواصل", "חברתית", language),
    shipping: localized("Shipping", "الشحن", "משלוח", language),
  };
  const fields = {
    general: [
      "Site Name", "Site Description", "Meta Title", "Meta Description", "Open Graph Image URL", "Site URL",
      "Maintenance Mode", "Tax Rate (%)", "Currency Code", "Items Per Page", "Enable Wishlist",
      "Enable Product Reviews", "Enable Guest Checkout", "Default Country", "Announcement Bar Text",
      "Home Hero Headline", "Home Hero Image URL", "Trending Section Title", "Promo Badge Text",
      "Promo Headline", "Promo Description", "Promo CTA Label", "Promo Image URL", "Philosophy Headline",
      "Philosophy Text", "Philosophy CTA", "Philosophy Background Image URL", "Marquee Scrolling Text",
      "Commitment Headline", "Commitment CTA", "Commitment Image URL", "Social Grid Heading",
      "Social Grid CTA", "Social Grid Image 1 URL", "Social Grid Image 2 URL", "Social Grid Image 3 URL",
      "Social Grid Image 4 URL", "Intentional Skincare Title", "Intentional Skincare Text",
      "Foundation Label", "Foundation Title", "Foundation Text 1", "Foundation Text 2", "Team Label",
      "Team Title", "Team Description", "Founder Note Heading", "Founder Letter", "Store Locator Tagline",
      "About Hero Headline", "About Hero CTA", "About Hero Image URL", "Login Page Image URL",
      "Product Showcase Empty Text", "Back to All Products", "Add to Bag Button Text", "Checkout Button Text",
      "Login Heading", "Signup Heading", "Search Placeholder", "Verified Buyer Label",
    ],
    social: ["Facebook URL", "Instagram URL", "X / Twitter URL", "YouTube URL", "TikTok URL", "Snapchat URL", "LinkedIn URL", "Pinterest URL"],
    shipping: ["Free Shipping Threshold", "Default Shipping Cost", "Shipping Rates JSON", "Free Shipping Unlocked Text", "Shipping Page Content JSON"],
  };

  function save() {
    writeStorage(storageKeys.settings, settings);
  }

  return (
    <section className="admin-panel-card">
      <div className="admin-tabs">
        {["general", "social", "shipping"].map((item) => (
          <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)} type="button">{tabLabels[item]}</button>
        ))}
      </div>
      <form className="admin-form settings-form" onSubmit={(event) => { event.preventDefault(); save(); }}>
        {fields[tab].map((label) => {
          const key = `${tab}.${label}`;
          const isJson = label.includes("JSON");
          const isImage = label.includes("Image URL");
          const localizedLabel = loc({ en: label, ar: label, he: label }, language);
          if (isImage) return <MediaField key={key} label={localizedLabel} language={language} name={key} value={settings[key] || ""} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} />;
          if (isJson) return <label key={key}>{localizedLabel}<textarea value={settings[key] || ""} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} /></label>;
          return <label key={key}>{localizedLabel}<input value={settings[key] || ""} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} /></label>;
        })}
        <div className="form-actions full-field">
          <button className="admin-primary-button" type="submit">{localized("Save", "حفظ", "שמור", language)} {tabLabels[tab]} {localized("Settings", "الإعدادات", "הגדרות", language)}</button>
        </div>
      </form>
    </section>
  );
}

function InventoryPage({ inventoryRows, language, movements, onAdjust, onOpenModal, products }) {
  return (
    <>
      <section className="admin-panel-card">
        <Toolbar addLabel={localized("Stock Update", "تحديث المخزون", "עדכון מלאי", language)} onAdd={onOpenModal}>
          <SearchField placeholder={localized("Search by product name, SKU...", "بحث باسم المنتج، رمز المنتج...", "חפש לפי שם מוצר, מק״ט...", language)} value="" onChange={() => {}} />
        </Toolbar>
        <AdminTable>
          <thead><tr><th>{localized("Product Name", "اسم المنتج", "שם מוצר", language)}</th><th>{localized("Variant", "البديل", "וריאציה", language)}</th><th>{localized("SKU", "رمز المنتج", "מק״ט", language)}</th><th>{localized("Stock Qty", "كمية المخزون", "כמות במלאי", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Actions", "الإجراءات", "פעולות", language)}</th></tr></thead>
          <tbody>
            {products.map((product) => {
              const stock = inventoryRows[product.id] ?? getStockQty(product);
              return (
                <tr key={product.id}>
                  <td>{getText(product.name)}</td>
                  <td>{product.sizes?.[0]?.size || "Default"}</td>
                  <td>{getProductSku(product)}</td>
                  <td>{stock}</td>
                  <td><Badge tone={stock <= 0 ? "danger" : stock < 5 ? "warning" : "active"}>{stock <= 0 ? localized("Out of Stock", "نفد من المخزون", "אזל מהמלאי", language) : stock < 5 ? localized("Low Stock", "مخزون منخفض", "מלאי נמוך", language) : localized("In Stock", "في المخزون", "במלאי", language)}</Badge></td>
                  <td><button className="icon-action" onClick={() => onAdjust(product.id, 1)} type="button"><Plus size={14} /></button><button className="icon-action" onClick={() => onAdjust(product.id, -1)} type="button"><Minus size={14} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      </section>
      <section className="admin-panel-card">
        <h2>{localized("Stock Movement History", "سجل حركة المخزون", "היסטוריית תנועות מלאי", language)}</h2>
        <p>{localized("Last 50 stock movements across all products", "آخر 50 حركة مخزون لجميع المنتجات", "50 תנועות המלאי האחרונות בכל המוצרים", language)}</p>
        <AdminTable>
          <thead><tr><th>{localized("Date", "التاريخ", "תאריך", language)}</th><th>{localized("Product", "المنتج", "מוצר", language)}</th><th>{localized("Variant", "البديل", "וריאציה", language)}</th><th>{localized("Delta", "التغير", "שינוי", language)}</th><th>{localized("Reason", "السبب", "סיבה", language)}</th><th>{localized("Operator / Order", "المشغل / الطلب", "מפעיל / הזמנה", language)}</th></tr></thead>
          <tbody>
            {movements.length ? movements.slice(0, 50).map((move) => <tr key={move.id}><td>{formatDate(move.date, language)}</td><td>{move.product}</td><td>{move.variant}</td><td>{move.delta}</td><td>{move.reason}</td><td>{move.operator}</td></tr>) : <tr><td colSpan="6">{localized("No stock movements yet.", "لا توجد حركات مخزون بعد.", "אין תנועות מלאי עדיין.", language)}</td></tr>}
          </tbody>
        </AdminTable>
      </section>
    </>
  );
}

function StockUpdateModal({ inventoryRows, language, onApply, onClose, products }) {
  const [reason, setReason] = React.useState("Adjustment");
  const [note, setNote] = React.useState("");
  const [deltas, setDeltas] = React.useState({});
  const pending = Object.values(deltas).filter((value) => Number(value) !== 0).length;
  return (
    <div className="admin-modal-backdrop">
      <section className="admin-modal">
        <div className="admin-section-head"><div><h2>{localized("Stock Update", "تحديث المخزون", "עדכון מלאי", language)}</h2><p>{localized("Sync database stock with physical counts.", "مزامنة مخزون قاعدة البيانات مع الأعداد الفعلية.", "סנכרן מלאי מסד נתונים עם ספירה פיזית.", language)}</p></div><button className="text-action" onClick={onClose} type="button">{localized("Close", "إغلاق", "סגור", language)}</button></div>
        <div className="admin-toolbar">
          <SearchField placeholder={localized("Search inventory", "بحث في المخزون", "חפש במלאי", language)} value="" onChange={() => {}} />
          <select value={reason} onChange={(event) => setReason(event.target.value)}>
            {["Adjustment", "Restock", "Correction", "Damaged", "Return"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="admin-inventory-list">
          {products.map((product) => (
            <label className="admin-inventory-row" key={product.id}>
              <input type="checkbox" checked={Number(deltas[product.id] || 0) !== 0} readOnly />
              <span><strong>{getText(product.name)}</strong><small>{getProductSku(product)} · {localized("current", "الحالي", "נוכחי", language)} {inventoryRows[product.id] ?? getStockQty(product)}</small></span>
              <input type="number" value={deltas[product.id] || ""} onChange={(event) => setDeltas((current) => ({ ...current, [product.id]: event.target.value }))} />
            </label>
          ))}
        </div>
        <label>{localized("Note optional", "ملاحظة اختيارية", "הערה אופציונלית", language)}<textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <div className="form-actions">
          <span>{pending} {localized("pending non-zero updates", "تحديثات غير صفرية معلقة", "עדכונים שאינם אפס בהמתנה", language)}</span>
          <button className="admin-primary-button" onClick={() => onApply(deltas, reason, note)} type="button">{localized("Apply Stock Updates", "تطبيق تحديثات المخزون", "החל עדכוני מלאי", language)}</button>
        </div>
      </section>
    </div>
  );
}

function AdminDashboardPage({
  activePage = "admin",
  currentUser,
  employees,
  homepageCategoryCards,
  language,
  homepageOffers,
  onDeleteProduct,
  onDeleteOffer,
  onAssignEmployee,
  onDeleteOrder,
  onLogout,
  onLanguageChange,
  onNavigate,
  onSaveCategoryCard,
  onSaveOffer,
  onSaveProduct,
  onSaveWebsiteMedia,
  onDeleteWebsiteMedia,
  onModerateReview,
  onDeleteReview,
  onStatusChange,
  isDarkMode,
  onToggleDarkMode,
  orders,
  products,
  productSchema,
  reviews,
  statusMessage,
  t,
  websiteMedia = [],
  websiteMediaHiddenKeys = [],
}) {
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [filters, setFilters] = React.useState({ brand: "all", category: "all", search: "", status: "all" });
  const [adminCategories, setAdminCategories] = React.useState(() => readStorage(storageKeys.categories, defaultAdminCategories));
  const [editingCategoryId, setEditingCategoryId] = React.useState("");
  const [categoryMessage, setCategoryMessage] = React.useState(null);
  const [brands, setBrands] = React.useState(() => readStorage(storageKeys.brands, [{ id: "eb-chemical", name: "EB Chemical", slug: "eb-chemical", country: "Palestine", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]));
  const [vlogs, setVlogs] = React.useState(() => readStorage(storageKeys.vlogs, []));
  const [vlogHero, setVlogHero] = React.useState(() => readStorage(storageKeys.vlogHero, { image: "", title: "EB Chemical care stories" }));
  const [stores, setStores] = React.useState(() => readStorage(storageKeys.stores, []));
  const [inventoryRows, setInventoryRows] = React.useState(() => readStorage(storageKeys.inventory, {}));
  const [movements, setMovements] = React.useState(() => readStorage(storageKeys.movements, []));
  const [stockModalOpen, setStockModalOpen] = React.useState(false);
  const [apiCustomers, setApiCustomers] = React.useState([]);
  const [customersLoading, setCustomersLoading] = React.useState(true);
  const [customerMessage, setCustomerMessage] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    setCustomersLoading(true);
    fetchCustomers().then((result) => {
      if (active) {
        setApiCustomers(result);
        setCustomersLoading(false);
      }
    }).catch(() => {
      if (active) {
        setApiCustomers([]);
        setCustomersLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const accountSnapshotRef = React.useRef(null);

  async function handleAccountTypeChange(customerId, newAccountType) {
    accountSnapshotRef.current = null;
    setCustomerMessage(null);
    setApiCustomers((current) => {
      accountSnapshotRef.current = current;
      return current.map((c) => (c.id === customerId ? { ...c, accountType: newAccountType } : c));
    });
    try {
      const result = await updateUserAccountType(customerId, newAccountType);
      if (result?.accountType) {
        setApiCustomers((current) =>
          current.map((c) =>
            c.id === customerId ? { ...c, ...result } : c,
          ),
        );
      }
      setCustomerMessage({
        type: "success",
        text: localized("Customer account type updated successfully", "تم تحديث نوع حساب العميل بنجاح", "סוג חשבון הלקוח עודכן בהצלחה", language),
      });
    } catch (error) {
      if (accountSnapshotRef.current) setApiCustomers(accountSnapshotRef.current);
      setCustomerMessage({
        type: "error",
        text: error?.message || localized("Failed to update customer account type", "فشل تحديث نوع حساب العميل", "עדכון סוג חשבון הלקוח נכשל", language),
      });
    }
  }

  const role = currentUser?.role;
  const canEdit = role === "admin" || role === "manager";
  const canManageSensitive = role === "admin";
  const readOnly = !canEdit;
  const customers = uniqueCustomersFromOrders(orders);
  const meta = pageMeta[activePage] || pageMeta.admin;
  const title = loc(meta[0], language);
  const subtitle = loc(meta[1], language);

  if (!currentUser || currentUser.role === "customer") {
    return (
      <AdminLayout
        activePage={activePage}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        language={language}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onToggleDarkMode={onToggleDarkMode}
        subtitle={localized("Admin access is required", "مطلوب وصول المسؤول", "נדרשת גישת מנהל", language)}
        title={localized("Access denied", "تم رفض الوصول", "גישה נדחתה", language)}
      >
        <EmptyState title={localized("Access denied", "تم رفض الوصول", "גישה נדחתה", language)} description={localized("This portal is for admin and staff only.", "هذه البوابة مخصصة للمسؤولين والموظفين فقط.", "פורטל זה מיועד למנהלים ולצוות בלבד.", language)} />
      </AdminLayout>
    );
  }

  function saveCategories(next) { setAdminCategories(next); writeStorage(storageKeys.categories, next); }
  function saveBrands(next) { setBrands(next); writeStorage(storageKeys.brands, next); }
  function saveVlogs(next) { setVlogs(next); writeStorage(storageKeys.vlogs, next); }
  function saveStores(next) { setStores(next); writeStorage(storageKeys.stores, next); }
  function saveInventory(next) { setInventoryRows(next); writeStorage(storageKeys.inventory, next); }
  function saveMovements(next) { setMovements(next); writeStorage(storageKeys.movements, next); }

  function categoryFormFields(excludeCategoryId = "") {
    return [
      { name: "name", label: localized("Category Name *", "اسم التصنيف *", "שם קטגוריה *", language), required: true },
      { name: "image", label: localized("Icon / Image", "الأيقونة / الصورة", "אייקון / תמונה", language), type: "media" },
      {
        name: "parentId",
        label: localized("Parent Category", "التصنيف الأب", "קטגוריית אב", language),
        type: "select",
        options: [
          { value: "", label: localized("None (top-level)", "لا شيء (المستوى الأعلى)", "ללא (רמה עליונה)", language) },
          ...adminCategories
            .filter((category) => category.id !== excludeCategoryId)
            .map((category) => ({ value: category.id, label: getText(category.name, language) || category.id })),
        ],
      },
      { name: "active", label: localized("Active", "نشط", "פעיל", language), type: "checkbox" },
    ];
  }

  function categoryToForm(category) {
    return {
      name: getText(category?.name, language) || getText(category?.name) || "",
      image: category?.image || "",
      parentId: category?.parentId || "",
      active: category?.active !== false,
    };
  }

  function saveEditedCategory(form) {
    const category = adminCategories.find((item) => item.id === editingCategoryId);
    if (!category) return;
    const name = String(form.name || "").trim();
    if (!name) {
      setCategoryMessage({ type: "error", text: localized("Category name is required.", "اسم التصنيف مطلوب.", "שם הקטגוריה נדרש.", language) });
      return;
    }
    const next = adminCategories.map((item) =>
      item.id === editingCategoryId
        ? {
            ...item,
            name: createLocalizedCopy(name, name),
            image: form.image || "",
            parentId: form.parentId || "",
            active: form.active !== false,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    saveCategories(next);
    setEditingCategoryId("");
    setCategoryMessage({ type: "success", text: localized("Category updated.", "تم تحديث التصنيف.", "הקטגוריה עודכנה.", language) });
  }

  function deleteCategory(categoryId) {
    const hasProducts = products.some((product) => product.categoryId === categoryId);
    const hasChildren = adminCategories.some((category) => category.parentId === categoryId);
    if (hasProducts || hasChildren) {
      setCategoryMessage({
        type: "error",
        text: hasProducts
          ? localized("Cannot delete this category while products use it.", "لا يمكن حذف هذا التصنيف لأنه مستخدم في منتجات.", "לא ניתן למחוק קטגוריה זו כל עוד מוצרים משתמשים בה.", language)
          : localized("Cannot delete this category while it has child categories.", "لا يمكن حذف هذا التصنيف لأنه يحتوي على تصنيفات فرعية.", "לא ניתן למחוק קטגוריה זו כל עוד יש לה קטגוריות משנה.", language),
      });
      return;
    }
    if (!window.confirm(localized("Delete this category?", "حذف هذا التصنيف؟", "למחוק קטגוריה זו?", language))) return;
    saveCategories(adminCategories.filter((category) => category.id !== categoryId));
    if (editingCategoryId === categoryId) setEditingCategoryId("");
    setCategoryMessage({ type: "success", text: localized("Category deleted.", "تم حذف التصنيف.", "הקטגוריה נמחקה.", language) });
  }

  function renderSimpleTable(kind) {
    const config = {
      categories: { rows: adminCategories, add: "admin-categories-new", search: localized("Search by name...", "بحث بالاسم...", "חפש לפי שם...", language), title: localized("Add Category", "إضافة تصنيف", "הוסף קטגוריה", language) },
      brands: { rows: brands, add: "admin-brands-new", search: localized("Search by name...", "بحث بالاسم...", "חפש לפי שם...", language), title: localized("Add Brand", "إضافة علامة تجارية", "הוסף מותג", language) },
      vlogs: { rows: vlogs, add: "admin-vlogs-new", search: localized("Search by title...", "بحث بالعنوان...", "חפש לפי כותרת...", language), title: localized("Add Vlog", "إضافة مدونة", "הוסף בלוג", language) },
      stores: { rows: stores, add: "admin-store-locator-new", search: localized("Search by name, city...", "بحث بالاسم، المدينة...", "חפש לפי שם, עיר...", language), title: localized("Add Store", "إضافة متجر", "הוסף חנות", language) },
    }[kind];
    return (
      <section className="admin-panel-card">
        {kind === "vlogs" && (
          <div className="admin-vlog-hero">
            <MediaField label={localized("Hero Image", "صورة البطل", "תמונת גיבור", language)} language={language} name="image" value={vlogHero.image} onChange={(event) => setVlogHero((current) => ({ ...current, image: event.target.value }))} />
            <label>{localized("Hero Title", "عنوان البطل", "כותרת גיבור", language)}<input value={vlogHero.title} onChange={(event) => setVlogHero((current) => ({ ...current, title: event.target.value }))} /></label>
            <button className="admin-primary-button" onClick={() => writeStorage(storageKeys.vlogHero, vlogHero)} type="button">{localized("Save Hero", "حفظ البطل", "שמור גיבור", language)}</button>
          </div>
        )}
        {kind === "categories" && categoryMessage && (
          <div className={`message-panel ${categoryMessage.type === "error" ? "error" : "success"}`}>
            {categoryMessage.text}
            <button className="message-dismiss" type="button" onClick={() => setCategoryMessage(null)}>&times;</button>
          </div>
        )}
        {kind === "categories" && editingCategoryId && (
          <GenericEntityForm
            key={editingCategoryId}
            fields={categoryFormFields(editingCategoryId)}
            initial={categoryToForm(adminCategories.find((category) => category.id === editingCategoryId))}
            language={language}
            onCancel={() => setEditingCategoryId("")}
            onSave={saveEditedCategory}
            submitLabel={localized("Save Category", "حفظ التصنيف", "שמור קטגוריה", language)}
            title={localized("Edit Category", "تعديل التصنيف", "ערוך קטגוריה", language)}
          />
        )}
        <Toolbar addLabel={config.title} onAdd={readOnly ? null : () => onNavigate(config.add)}>
          <SearchField placeholder={config.search} value="" onChange={() => {}} />
          <div className="admin-segmented"><button className="active" type="button">{localized("All", "الكل", "הכל", language)}</button><button type="button">{localized("Active", "نشط", "פעיל", language)}</button><button type="button">{localized("Inactive", "غير نشط", "לא פעיל", language)}</button></div>
          {kind === "vlogs" && <div className="admin-segmented"><button className="active" type="button">{localized("All", "الكل", "הכל", language)}</button><button type="button">{localized("Featured", "مميز", "מומלץ", language)}</button><button type="button">{localized("Standard", "عادي", "רגיל", language)}</button></div>}
        </Toolbar>
        <AdminTable>
          <thead>
            {kind === "stores" ? <tr><th>{localized("Name", "الاسم", "שם", language)}</th><th>{localized("City", "المدينة", "עיר", language)}</th><th>{localized("Country", "البلد", "מדינה", language)}</th><th>{localized("Phone", "الهاتف", "טלפון", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Sort", "الترتيب", "מיון", language)}</th><th>{localized("Actions", "الإجراءات", "פעולות", language)}</th></tr> :
              kind === "brands" ? <tr><th>{localized("Icon / Logo", "أيقونة / شعار", "אייקון / לוגו", language)}</th><th>{localized("Name", "الاسم", "שם", language)}</th><th>{localized("Country", "البلد", "מדינה", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Created", "تاريخ الإنشاء", "נוצר", language)}</th><th>{localized("Updated", "آخر تحديث", "עודכן", language)}</th><th>{localized("Actions", "الإجراءات", "פעולות", language)}</th></tr> :
                kind === "vlogs" ? <tr><th>{localized("Thumbnail", "الصورة المصغرة", "תמונה ממוזערת", language)}</th><th>{localized("Title", "العنوان", "כותרת", language)}</th><th>{localized("Type", "النوع", "סוג", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Created", "تاريخ الإنشاء", "נוצר", language)}</th><th>{localized("Actions", "الإجراءات", "פעולות", language)}</th></tr> :
                  <tr><th>{localized("Icon", "أيقونة", "אייקון", language)}</th><th>{localized("Name", "الاسم", "שם", language)}</th><th>{localized("Parent", "الأصل", "הורה", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Created", "تاريخ الإنشاء", "נוצר", language)}</th><th>{localized("Updated", "آخر تحديث", "עודכן", language)}</th><th>{localized("Actions", "الإجراءات", "פעולות", language)}</th></tr>}
          </thead>
          <tbody>
            {config.rows.length ? config.rows.map((row, index) => (
              <tr key={row.id || index}>
                {kind === "stores" ? (
                  <><td>{row.name}</td><td>{row.city}</td><td>{row.country}</td><td>{row.phone || "-"}</td><td><Badge>{row.active === false ? localized("Inactive", "غير نشط", "לא פעיל", language) : localized("Active", "نشط", "פעיל", language)}</Badge></td><td>{row.sort || index + 1}</td><td>-</td></>
                ) : kind === "brands" ? (
                  <><td>{row.logo ? <img className="admin-thumb" src={row.logo} alt="" /> : <span className="admin-logo-mini">{row.name?.charAt(0)}</span>}</td><td>{row.name}</td><td>{row.country}</td><td><Badge>{row.active === false ? localized("Inactive", "غير نشط", "לא פעיל", language) : localized("Active", "نشط", "פעיל", language)}</Badge></td><td>{formatDate(row.createdAt, language)}</td><td>{formatDate(row.updatedAt, language)}</td><td>-</td></>
                ) : kind === "vlogs" ? (
                  <><td>{row.thumbnail ? <img className="admin-thumb" src={row.thumbnail} alt="" /> : "-"}</td><td>{row.title}</td><td>{row.featured ? localized("Featured", "مميز", "מומלץ", language) : localized("Standard", "عادي", "רגיל", language)}</td><td><Badge>{row.active === false ? localized("Inactive", "غير نشط", "לא פעיל", language) : localized("Active", "نشط", "פעיל", language)}</Badge></td><td>{formatDate(row.createdAt, language)}</td><td>-</td></>
                ) : (
                  <><td>{row.image ? <img className="admin-thumb" src={row.image} alt="" /> : <span className="admin-logo-mini">C</span>}</td><td>{getText(row.name)}</td><td>{row.parentId || localized("None", "لا شيء", "ללא", language)}</td><td><Badge>{row.active === false ? localized("Inactive", "غير نشط", "לא פעיל", language) : localized("Active", "نشط", "פעיל", language)}</Badge></td><td>{formatDate(row.createdAt, language)}</td><td>{formatDate(row.updatedAt, language)}</td><td><div className="row-actions"><button className="text-action" disabled={readOnly} onClick={() => { setCategoryMessage(null); setEditingCategoryId(row.id); }} type="button">{localized("Edit", "تعديل", "ערוך", language)}</button><button className="text-action danger" disabled={readOnly} onClick={() => deleteCategory(row.id)} type="button">{localized("Delete", "حذف", "מחק", language)}</button></div></td></>
                )}
              </tr>
            )) : <tr><td colSpan="7"><EmptyState title={kind === "vlogs" ? localized("No vlogs yet", "لا توجد مدونات بعد", "אין בלוגים עדיין", language) : localized("No records yet", "لا توجد سجلات بعد", "אין רשומות עדיין", language)} description={kind === "vlogs" ? localized("Create your first vlog entry for the storefront.", "أنشئ أول مدونة للمتجر.", "צור רשומת בלוג ראשונה לחנות.", language) : ""} /></td></tr>}
          </tbody>
        </AdminTable>
      </section>
    );
  }

  function renderEntityForm(kind) {
    if (!canEdit) return <EmptyState title={localized("View-only access", "وصول للعرض فقط", "גישת צפייה בלבד", language)} description={localized("You do not have permission to create records.", "ليس لديك صلاحية لإنشاء سجلات.", "אין לך הרשאה ליצור רשומות.", language)} />;
    if (kind === "category") {
      return <GenericEntityForm title={localized("New Category", "تصنيف جديد", "קטגוריה חדשה", language)} language={language} initial={{ active: true, parentId: "" }} fields={[
        { name: "name", label: localized("Category Name *", "اسم التصنيف *", "שם קטגוריה *", language), required: true }, { name: "slug", label: localized("Slug", "الرابط", "קישור", language) }, { name: "description", label: localized("Description", "الوصف", "תיאור", language), type: "textarea" }, { name: "image", label: localized("Category Image", "صورة التصنيف", "תמונת קטגוריה", language), type: "media" }, { name: "parentId", label: localized("Parent Category", "التصنيف الأب", "קטגוריית אב", language), type: "select", options: [{ value: "", label: localized("None (top-level)", "لا شيء (المستوى الأعلى)", "ללא (רמה עליונה)", language) }, ...adminCategories.map((category) => ({ value: category.id, label: getText(category.name) }))] }, { name: "active", label: localized("Active", "نشط", "פעיל", language), type: "checkbox" }, { name: "metaTitle", label: localized("Meta Title", "عنوان SEO", "כותרת SEO", language) }, { name: "metaDescription", label: localized("Meta Description", "وصف SEO", "תיאור SEO", language), type: "textarea" },
      ]} onCancel={() => onNavigate("admin-categories")} onSave={(form) => { saveCategories([{ id: form.slug || makeSlug(form.name), name: createLocalizedCopy(form.name, form.name), description: createLocalizedCopy(form.description, form.description), image: form.image, parentId: form.parentId, active: form.active, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...adminCategories]); onNavigate("admin-categories"); }} />;
    }
    if (kind === "brand") {
      return <GenericEntityForm title={localized("New Brand", "علامة تجارية جديدة", "מותג חדש", language)} language={language} initial={{ active: true, country: "Palestine" }} fields={[
        { name: "name", label: localized("Brand Name *", "اسم العلامة التجارية *", "שם מותג *", language), required: true }, { name: "slug", label: localized("Slug", "الرابط", "קישור", language) }, { name: "description", label: localized("Description", "الوصف", "תיאור", language), type: "textarea" }, { name: "country", label: localized("Country", "البلد", "מדינה", language) }, { name: "website", label: localized("Website", "الموقع الإلكتروني", "אתר אינטרנט", language) }, { name: "logo", label: localized("Brand Logo", "شعار العلامة التجارية", "לוגו מותג", language), type: "media" }, { name: "active", label: localized("Active", "نشط", "פעיל", language), type: "checkbox" }, { name: "metaTitle", label: localized("Meta Title", "عنوان SEO", "כותרת SEO", language) }, { name: "metaDescription", label: localized("Meta Description", "وصف SEO", "תיאור SEO", language), type: "textarea" },
      ]} onCancel={() => onNavigate("admin-brands")} onSave={(form) => { saveBrands([{ id: form.slug || makeSlug(form.name), ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...brands]); onNavigate("admin-brands"); }} />;
    }
    if (kind === "vlog") {
      return <GenericEntityForm title={localized("New Vlog", "مدونة جديدة", "בלוג חדש", language)} language={language} initial={{ active: true, featured: false }} fields={[
        { name: "title", label: localized("Title *", "العنوان *", "כותרת *", language), required: true }, { name: "slug", label: localized("Slug", "الرابط", "קישור", language) }, { name: "description", label: localized("Description", "الوصف", "תיאור", language), type: "textarea" }, { name: "videoUrl", label: localized("Video URL *", "رابط الفيديو *", "כתובת וידאו *", language), required: true }, { name: "thumbnail", label: localized("Thumbnail", "الصورة المصغرة", "תמונה ממוזערת", language), type: "media" }, { name: "active", label: localized("Active", "نشط", "פעיל", language), type: "checkbox" }, { name: "featured", label: localized("Featured", "مميز", "מומלץ", language), type: "checkbox" },
      ]} onCancel={() => onNavigate("admin-vlogs")} onSave={(form) => { saveVlogs([{ id: form.slug || makeSlug(form.title), ...form, createdAt: new Date().toISOString() }, ...vlogs]); onNavigate("admin-vlogs"); }} />;
    }
    return <GenericEntityForm title={localized("New Store", "متجر جديد", "חנות חדשה", language)} language={language} initial={{ active: true, country: "Palestine" }} fields={[
      { name: "name", label: localized("Name *", "الاسم *", "שם *", language), required: true }, { name: "address", label: localized("Address *", "العنوان *", "כתובת *", language), required: true }, { name: "city", label: localized("City *", "المدينة *", "עיר *", language), required: true }, { name: "country", label: localized("Country *", "البلد *", "מדינה *", language), required: true }, { name: "phone", label: localized("Phone", "الهاتف", "טלפון", language) }, { name: "hours", label: localized("Hours", "ساعات العمل", "שעות פעילות", language) }, { name: "latitude", label: localized("Latitude", "خط العرض", "קו רוחב", language) }, { name: "longitude", label: localized("Longitude", "خط الطول", "קו אורך", language) }, { name: "active", label: localized("Active", "نشط", "פעיל", language), type: "checkbox" },
    ]} onCancel={() => onNavigate("admin-store-locator")} onSave={(form) => { saveStores([{ id: makeSlug(form.name) || `store-${Date.now()}`, ...form, sort: stores.length + 1 }, ...stores]); onNavigate("admin-store-locator"); }} />;
  }

  function renderReviews() {
    return (
      <section className="admin-panel-card">
        <Toolbar><select><option>{localized("Status", "الحالة", "סטטוס", language)}</option><option>{localized("Pending", "معلق", "ממתין", language)}</option><option>{localized("Approved", "مقبول", "מאושר", language)}</option><option>{localized("Rejected", "مرفوض", "נדחה", language)}</option></select><select><option>{localized("Rating", "التقييم", "דירוג", language)}</option><option>5 {localized("Stars", "نجوم", "כוכבים", language)}</option><option>4 {localized("Stars", "نجوم", "כוכבים", language)}</option></select></Toolbar>
        <AdminTable>
          <thead><tr><th><input type="checkbox" /></th><th>{localized("Rating", "التقييم", "דירוג", language)}</th><th>{localized("Review", "المراجعة", "ביקורת", language)}</th><th>{localized("Product", "المنتج", "מוצר", language)}</th><th>{localized("Reviewer", "المراجع", "מבקר", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Created", "تاريخ الإنشاء", "נוצר", language)}</th><th>{localized("Updated", "آخر تحديث", "עודכן", language)}</th><th>{localized("Actions", "الإجراءات", "פעולות", language)}</th></tr></thead>
          <tbody>
            {reviews.length ? reviews.map((review) => <tr key={review.id}><td><input type="checkbox" /></td><td>{"★".repeat(Number(review.rating || 0))}</td><td>{getText(review.comment, language)}</td><td>{review.productName || "-"}</td><td>{review.customerName || "-"}</td><td><Badge tone={review.status === "rejected" ? "danger" : review.status === "approved" ? "active" : "warning"}>{review.status ? localized(review.status.charAt(0).toUpperCase() + review.status.slice(1), review.status === "pending" ? "معلق" : review.status === "approved" ? "مقبول" : review.status === "rejected" ? "مرفوض" : "مخفي", review.status === "pending" ? "ממתין" : review.status === "approved" ? "מאושר" : review.status === "rejected" ? "נדחה" : "מוסתר", language) : localized("Pending", "معلق", "ממתין", language)}</Badge></td><td>{formatDate(review.createdAt, language)}</td><td>{formatDate(review.updatedAt, language)}</td><td><div className="row-actions">{review.status !== "approved" && <button className="text-action" onClick={() => onModerateReview(review.id, "approved", true)} type="button">{localized("Approve", "قبول", "אשר", language)}</button>}{review.status !== "rejected" && <button className="text-action danger" onClick={() => onModerateReview(review.id, "rejected", false)} type="button">{localized("Reject", "رفض", "דחה", language)}</button>}<button className="text-action" onClick={() => onModerateReview(review.id, "hidden", false)} type="button">{localized("Hide", "إخفاء", "הסתר", language)}</button><button className="text-action danger" onClick={() => onDeleteReview?.(review.id)} type="button">{localized("Delete", "حذف", "מחק", language)}</button></div></td></tr>) : <tr><td colSpan="9">{localized("No reviews yet.", "لا توجد تقييمات بعد.", "אין ביקורות עדיין.", language)}</td></tr>}
          </tbody>
        </AdminTable>
      </section>
    );
  }

  function adjustStock(productId, delta, reason = "Adjustment", note = "") {
    const product = products.find((item) => item.id === productId);
    const next = { ...inventoryRows, [productId]: Math.max(0, (inventoryRows[productId] ?? getStockQty(product)) + Number(delta || 0)) };
    const move = { id: `move-${Date.now()}-${productId}`, date: new Date().toISOString(), product: getText(product?.name), variant: product?.sizes?.[0]?.size || "Default", delta: Number(delta || 0), reason, operator: currentUser?.name || currentUser?.role || "Admin", note };
    saveInventory(next);
    saveMovements([move, ...movements]);
  }

  function applyStockUpdates(deltas, reason, note) {
    Object.entries(deltas).forEach(([productId, delta]) => {
      if (Number(delta) !== 0) adjustStock(productId, Number(delta), reason, note);
    });
    setStockModalOpen(false);
  }

  function renderCustomers() {
    const displayCustomers = apiCustomers.length > 0 ? apiCustomers : customers;
    const customerStatusMessage = customerMessage
      ? <div className={`message-panel ${customerMessage.type === "error" ? "error" : "success"}`}>{customerMessage.text}</div>
      : null;
    return (
      <section className="admin-panel-card">
        <Toolbar><SearchField placeholder={localized("Search name, email, or phone...", "بحث بالاسم أو البريد الإلكتروني أو الهاتف...", "חפש שם, אימייל או טלפון...", language)} value="" onChange={() => {}} /><select><option>{localized("Status", "الحالة", "סטטוס", language)}</option></select><select><option>{localized("10 / page", "10 / صفحة", "10 / עמוד", language)}</option><option>{localized("25 / page", "25 / صفحة", "25 / עמוד", language)}</option><option>{localized("50 / page", "50 / صفحة", "50 / עמוד", language)}</option><option>{localized("100 / page", "100 / صفحة", "100 / עמוד", language)}</option></select></Toolbar>
        <AdminTable>
          <thead><tr><th>{localized("Name", "الاسم", "שם", language)}</th><th>{localized("Email", "البريد الإلكتروني", "אימייל", language)}</th><th>{localized("Phone", "الهاتف", "טלפון", language)}</th><th>{localized("Account Type", "نوع الحساب", "סוג חשבון", language)}</th><th>{localized("Status", "الحالة", "סטטוס", language)}</th><th>{localized("Orders", "الطلبات", "הזמנות", language)}</th><th>{localized("Created", "تاريخ الإنشاء", "נוצר", language)}</th><th>{localized("Updated", "آخر تحديث", "עודכן", language)}</th></tr></thead>
          <tbody>{customerStatusMessage && <tr><td colSpan="8">{customerStatusMessage}</td></tr>}{displayCustomers.length ? displayCustomers.map((customer) => {
            const isApi = !!customer.id;
            return <tr key={`${customer.email}-${customer.phone}`}><td>{customer.name}</td><td>{customer.email}</td><td>{customer.phone}</td><td>{isApi ? <select className="admin-select" value={customer.accountType === "trader" || customer.accountType === "wholesale" ? "trader" : "retail"} onChange={(e) => handleAccountTypeChange(customer.id, e.target.value)}><option value="retail">{localized("Retail customer", "عميل عادي", "לקוח רגיל", language)}</option><option value="trader">{localized("Trader", "تاجر", "סוחר", language)}</option></select> : <Badge>{localized("Retail customer", "عميل عادي", "לקוח רגיל", language)}</Badge>}</td><td><Badge>{customer.status || (customer.isActive !== false ? "Active" : "Inactive")}</Badge></td><td>{customer.orders || customer.orderCount || 0}</td><td>{formatDate(customer.createdAt, language)}</td><td>{formatDate(customer.updatedAt, language)}</td></tr>;
          }) : <tr><td colSpan="8">{customersLoading ? localized("Loading...", "جار التحميل...", "טוען...", language) : localized("No customers yet.", "لا يوجد عملاء بعد.", "אין לקוחות עדיין.", language)}</td></tr>}</tbody>
        </AdminTable>
      </section>
    );
  }

  function renderActivePage() {
    switch (activePage) {
      case "admin-products":
        return <ProductsListPage categories={adminCategories} filters={filters} language={language} onAdd={() => { setEditingProduct(null); onNavigate("admin-products-new"); }} onDeleteProduct={onDeleteProduct} onEdit={(product) => { setEditingProduct(product); onNavigate("admin-products-new"); }} products={products} readOnly={readOnly} setFilters={setFilters} />;
      case "admin-products-new":
        return <ProductWizard categories={adminCategories} editingProduct={editingProduct} language={language} onCancel={() => onNavigate("admin-products")} onSave={onSaveProduct} productSchema={productSchema} />;
      case "admin-categories":
        return renderSimpleTable("categories");
      case "admin-categories-new":
        return renderEntityForm("category");
      case "admin-brands":
        return renderSimpleTable("brands");
      case "admin-brands-new":
        return renderEntityForm("brand");
      case "admin-vlogs":
        return renderSimpleTable("vlogs");
      case "admin-vlogs-new":
        return renderEntityForm("vlog");
      case "admin-store-locator":
        return renderSimpleTable("stores");
      case "admin-store-locator-new":
        return renderEntityForm("store");
      case "admin-website-media":
        return <WebsiteMediaManager hiddenSectionKeys={websiteMediaHiddenKeys} items={websiteMedia} language={language} onDelete={onDeleteWebsiteMedia} onSave={onSaveWebsiteMedia} />;
      case "admin-orders":
        return <section className="admin-panel-card"><Toolbar><SearchField placeholder={localized("Search order #, customer...", "بحث برقم الطلب، العميل...", "חפש לפי מספר הזמנה, לקוח...", language)} value="" onChange={() => {}} /><select><option>{localized("Status", "الحالة", "סטטוס", language)}</option></select><select><option>{localized("Payment", "الدفع", "תשלום", language)}</option></select></Toolbar>{orders.length ? <AdminOrdersTable employees={employees} canDelete={canManageSensitive} language={language} onAssignEmployee={onAssignEmployee} onDeleteOrder={onDeleteOrder} onStatusChange={onStatusChange} orders={orders} products={products} t={t} /> : <EmptyState title={localized("No orders found", "لا توجد طلبات", "לא נמצאו הזמנות", language)} description={localized("No orders have been placed yet. Orders will appear here once customers complete their purchases.", "لم يتم تقديم أي طلبات بعد. ستظهر الطلبات هنا بمجرد أن يكمل العملاء مشترياتهم.", "לא בוצעו הזמנות עדיין. הזמנות יופיעו כאן ברגע שהלקוחות ישלימו את רכישותיהם.", language)} />}</section>;
      case "admin-reviews":
        return renderReviews();
      case "admin-inventory":
        return <><InventoryPage inventoryRows={inventoryRows} language={language} movements={movements} onAdjust={adjustStock} onOpenModal={() => setStockModalOpen(true)} products={products} />{stockModalOpen && <StockUpdateModal inventoryRows={inventoryRows} language={language} onApply={applyStockUpdates} onClose={() => setStockModalOpen(false)} products={products} />}</>;
      case "admin-customers":
        return renderCustomers();
      case "admin-settings":
        return canManageSensitive ? <SettingsPage language={language} /> : <EmptyState title={localized("Settings are restricted", "الإعدادات مقيدة", "ההגדרות מוגבלות", language)} description={localized("Only admins can manage configuration.", "يمكن للمسؤولين فقط إدارة التكوين.", "רק מנהלים יכולים לנהל תצורה.", language)} />;
      case "admin":
      default:
        return <DashboardHome customers={customers} language={language} orders={orders} products={products} t={t} />;
    }
  }

  return (
    <AdminLayout
      activePage={activePage}
      currentUser={currentUser}
      isDarkMode={isDarkMode}
      language={language}
      onLanguageChange={onLanguageChange}
      onLogout={onLogout}
      onNavigate={onNavigate}
      onToggleDarkMode={onToggleDarkMode}
      subtitle={subtitle}
      title={title}
    >
      <PermissionNotice language={language} role={role} />
      {statusMessage && <div className="message-panel success">{statusMessage}</div>}
      {renderActivePage()}
    </AdminLayout>
  );
}

export default AdminDashboardPage;
