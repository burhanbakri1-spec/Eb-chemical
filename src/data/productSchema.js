export const productFieldTypes = [
  "text", "textarea", "number", "date", "boolean", "select", "multi_select",
  "url", "image_url", "file_url",
];

export const productTabKeys = ["basic", "variants", "media", "seo", "showcase", "custom_sections"];
export const protectedProductFields = ["nameEn", "slug", "categoryId", "brand", "active", "featured", "newArrival", "bestseller"];

function field(key, tab, en, ar, he, type = "text", settings = {}) {
  return {
    key, tab, label: { en, ar, he }, type,
    required: settings.required === true,
    enabled: settings.enabled !== false,
    storefrontVisible: settings.storefrontVisible === true,
    protected: settings.protected === true,
    sortOrder: settings.sortOrder || 0,
    defaultValue: settings.defaultValue ?? (type === "boolean" ? false : ""),
    options: settings.options || [],
  };
}

export function createDefaultProductSchema() {
  const tabLabels = {
    basic: { en: "Basic", ar: "الأساسي", he: "בסיסי" }, variants: { en: "Variants", ar: "المتغيرات", he: "וריאציות" },
    media: { en: "Media", ar: "الوسائط", he: "מדיה" }, seo: { en: "SEO", ar: "تحسين البحث", he: "קידום" },
    showcase: { en: "Showcase", ar: "العرض", he: "תצוגה" }, custom_sections: { en: "Custom Sections", ar: "أقسام مخصصة", he: "סקציות מותאמות אישית" },
  };
  const fields = [
    ["nameEn", "Product Name", "اسم المنتج", "שם מוצר", "text", { required: true, protected: true, storefrontVisible: true }],
    ["nameAr", "Arabic Product Name", "اسم المنتج بالعربية", "שם מוצר בערבית", "text", { storefrontVisible: true }],
    ["slug", "Slug", "الرابط المختصر", "מזהה", "text", { protected: true }],
    ["sku", "SKU", "رمز المنتج", "מק\"ט"],
    ["categoryId", "Category", "الفئة", "קטגוריה", "select", { required: true, protected: true }],
    ["brand", "Brand", "العلامة التجارية", "מותג", "text", { protected: true, storefrontVisible: true }],
    ["shortDescription", "Short Description", "الوصف المختصر", "תיאור קצר", "textarea", { storefrontVisible: true }],
    ["shortDescriptionAr", "Short Description Arabic", "الوصف المختصر بالعربية", "Short Description Arabic", "textarea", { enabled: false, storefrontVisible: true }],
    ["fullDescription", "Full Description", "الوصف الكامل", "תיאור מלא", "textarea", { storefrontVisible: true }],
    ["fullDescriptionAr", "Full Description Arabic", "الوصف الكامل بالعربية", "Full Description Arabic", "textarea", { enabled: false, storefrontVisible: true }],
    ["howToUse", "How to Use", "طريقة الاستخدام", "הוראות שימוש", "textarea", { storefrontVisible: true }],
    ["ingredients", "Ingredients", "المكونات", "רכיבים", "textarea", { storefrontVisible: true }],
    ["benefits", "Benefits", "الفوائد", "יתרונות", "textarea", { storefrontVisible: true }],
    ["skinTypes", "Skin Types", "أنواع البشرة", "סוגי עור", "text", { storefrontVisible: true }],
    ["concerns", "Concerns", "المشكلات", "בעיות", "text", { storefrontVisible: true }],
    ["active", "Active", "نشط", "פעיל", "boolean", { protected: true, defaultValue: true }],
    ["featured", "Featured", "مميز", "מומלץ", "boolean", { protected: true }],
    ["newArrival", "New Arrival", "وصل حديثاً", "חדש", "boolean", { protected: true }],
    ["bestseller", "Bestseller", "الأكثر مبيعاً", "רב מכר", "boolean", { protected: true }],
    ["label", "Label", "الشارة", "תגית"],
    ["labelAr", "Label Arabic", "الشارة بالعربية", "תגית בערבית"],
  ].map((item, index) => field(item[0], "basic", item[1], item[2], item[3], item[4], { ...item[5], sortOrder: (index + 1) * 10 }));
  fields.push(
    field("metaTitle", "seo", "Meta Title", "عنوان محركات البحث", "כותרת SEO", "text", { sortOrder: 10 }),
    field("metaDescription", "seo", "Meta Description", "وصف محركات البحث", "תיאור SEO", "textarea", { sortOrder: 20 }),
  );
  const media = [
    ["image", "Featured Image", "الصورة الرئيسية", "תמונה ראשית", "image_url"],
    ["hoverImage", "Second / Hover Image", "الصورة الثانية", "תמונת ריחוף", "image_url"],
    ["videoUrl", "Video URL", "رابط الفيديو", "כתובת סרטון", "url"],
    ["galleryImages", "Vertical Gallery Images", "صور المعرض", "תמונות גלריה", "image_url"],
    ["dsiHowItWorks1", "How it Works image 1", "صورة طريقة الاستخدام 1", "תמונת איך זה עובד 1", "image_url"],
    ["dsiHowItWorks2", "How it Works image 2", "صورة طريقة الاستخدام 2", "תמונת איך זה עובד 2", "image_url"],
    ["dsiHowItWorks3", "How it Works image 3", "صورة طريقة الاستخدام 3", "תמונת איך זה עובד 3", "image_url"],
    ["dsiImpact1", "Impact section image 1", "صورة الأثر 1", "תמונת השפעה 1", "image_url"],
    ["dsiImpact2", "Impact section image 2", "صورة الأثر 2", "תמונת השפעה 2", "image_url"],
    ["dsiSafeToUse", "Safe to use image", "صورة الاستخدام الآمن", "תמונת בטיחות", "image_url"],
    ["dsiPracticalBanner", "Practical banner image", "صورة البانر", "תמונת באנר", "image_url"],
    ["dsiIngredients", "Ingredients section image", "صورة المكونات", "תמונת רכיבים", "image_url"],
    ["dsiFaq", "FAQ side image", "صورة الأسئلة الشائعة", "תמונת שאלות נפוצות", "image_url"],
    ["detailStatements", "Product Details Banner Statements", "عبارات بانر تفاصيل المنتج", "הצהרות באנר פרטי מוצר", "textarea"],
  ].map((item, index) => field(item[0], "media", item[1], item[2], item[3], item[4], { storefrontVisible: true, sortOrder: (index + 1) * 10 }));
  const variants = [
    field("color_name", "variants", "Color", "اللون", "צבע", "text", { required: true, storefrontVisible: true, sortOrder: 10 }),
    field("color_value", "variants", "Color value", "قيمة اللون", "ערך צבע", "text", { storefrontVisible: true, sortOrder: 20 }),
    field("size", "variants", "Size", "الحجم", "גודל", "text", { required: true, storefrontVisible: true, sortOrder: 30 }),
  ];
  return {
    version: 1,
    tabs: productTabKeys.map((key, index) => ({ key, label: tabLabels[key], enabled: key !== "custom_sections", protected: key === "basic", sortOrder: (index + 1) * 10 })),
    fields,
    variantAttributes: variants,
    mediaFields: media,
    showcaseSections: [
      ["how_it_works", "How it Works", "طريقة الاستخدام", "איך זה עובד"], ["impact", "Impact", "الأثر", "השפעה"],
      ["safe_to_use", "Safe to Use", "آمن للاستخدام", "בטוח לשימוש"], ["ingredients", "Ingredients", "المكونات", "רכיבים"],
      ["faq", "Frequently Asked Questions", "الأسئلة الشائعة", "שאלות נפוצות"],
    ].map((item, index) => ({ key: item[0], title: { en: item[1], ar: item[2], he: item[3] }, enabled: true, storefrontVisible: true, sortOrder: (index + 1) * 10, fields: [] })),
    storefrontVisibility: { customFields: true, customSections: true },
  };
}

export function normalizeProductSchema(schema) {
  const fallback = createDefaultProductSchema();
  if (!schema || typeof schema !== "object") return fallback;
  return {
    ...fallback,
    ...schema,
    tabs: Array.isArray(schema.tabs) ? schema.tabs : fallback.tabs,
    fields: Array.isArray(schema.fields) ? schema.fields : fallback.fields,
    variantAttributes: Array.isArray(schema.variantAttributes) ? schema.variantAttributes : fallback.variantAttributes,
    mediaFields: Array.isArray(schema.mediaFields) ? schema.mediaFields : fallback.mediaFields,
    showcaseSections: Array.isArray(schema.showcaseSections) ? schema.showcaseSections : fallback.showcaseSections,
  };
}

export function enabledProductField(schema, key) {
  return [...schema.fields, ...schema.mediaFields].find((item) => item.key === key && item.enabled !== false) || null;
}

export function productFieldLabel(field, language = "en") {
  if (language === "he") {
    return field?.label?.he || field?.label?.ar || field?.label?.en || field?.key || "";
  }
  return field?.label?.[language] || field?.label?.en || field?.key || "";
}
