export const productFieldTypes = [
  "text", "textarea", "number", "date", "boolean", "select", "multi_select",
  "url", "image_url", "file_url",
];

export const productTabKeys = ["basic", "variants", "media", "seo", "showcase", "custom_sections"];
export const protectedProductFields = ["nameEn", "slug", "categoryId", "brand", "active", "featured", "newArrival", "bestseller"];

function field(key, tab, en, ar, type = "text", settings = {}) {
  return {
    key, tab, label: { en, ar }, type,
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
    basic: { en: "Basic", ar: "الأساسي" }, variants: { en: "Variants", ar: "المتغيرات" },
    media: { en: "Media", ar: "الوسائط" }, seo: { en: "SEO", ar: "تحسين البحث" },
    showcase: { en: "Showcase", ar: "العرض" }, custom_sections: { en: "Custom Sections", ar: "أقسام مخصصة" },
  };
  const fields = [
    ["nameEn", "Product Name", "اسم المنتج", "text", { required: true, protected: true, storefrontVisible: true }],
    ["nameAr", "Arabic Product Name", "اسم المنتج بالعربية", "text", { storefrontVisible: true }],
    ["slug", "Slug", "الرابط المختصر", "text", { protected: true }],
    ["sku", "SKU", "رمز المنتج"],
    ["categoryId", "Category", "الفئة", "select", { required: true, protected: true }],
    ["brand", "Brand", "العلامة التجارية", "text", { protected: true, storefrontVisible: true }],
    ["shortDescription", "Short Description", "الوصف المختصر", "textarea", { storefrontVisible: true }],
    ["shortDescriptionAr", "Short Description Arabic", "الوصف المختصر بالعربية", "textarea", { enabled: false, storefrontVisible: true }],
    ["fullDescription", "Full Description", "الوصف الكامل", "textarea", { storefrontVisible: true }],
    ["fullDescriptionAr", "Full Description Arabic", "الوصف الكامل بالعربية", "textarea", { enabled: false, storefrontVisible: true }],
    ["howToUse", "How to Use", "طريقة الاستخدام", "textarea", { storefrontVisible: true }],
    ["ingredients", "Ingredients", "المكونات", "textarea", { storefrontVisible: true }],
    ["benefits", "Benefits", "الفوائد", "textarea", { storefrontVisible: true }],
    ["skinTypes", "Skin Types", "أنواع البشرة", "text", { storefrontVisible: true }],
    ["concerns", "Concerns", "المشكلات", "text", { storefrontVisible: true }],
    ["active", "Active", "نشط", "boolean", { protected: true, defaultValue: true }],
    ["featured", "Featured", "مميز", "boolean", { protected: true }],
    ["newArrival", "New Arrival", "وصل حديثاً", "boolean", { protected: true }],
    ["bestseller", "Bestseller", "الأكثر مبيعاً", "boolean", { protected: true }],
    ["label", "Label", "الشارة"],
    ["labelAr", "Label Arabic", "الشارة بالعربية"],
  ].map((item, index) => field(item[0], "basic", item[1], item[2], item[3], { ...item[4], sortOrder: (index + 1) * 10 }));
  fields.push(
    field("metaTitle", "seo", "Meta Title", "عنوان محركات البحث", "text", { sortOrder: 10 }),
    field("metaDescription", "seo", "Meta Description", "وصف محركات البحث", "textarea", { sortOrder: 20 }),
  );
  const media = [
    ["image", "Featured Image", "الصورة الرئيسية", "image_url"],
    ["hoverImage", "Second / Hover Image", "الصورة الثانية", "image_url"],
    ["videoUrl", "Video URL", "رابط الفيديو", "url"],
    ["galleryImages", "Vertical Gallery Images", "صور المعرض", "image_url"],
    ["dsiHowItWorks1", "How it Works image 1", "صورة طريقة الاستخدام 1", "image_url"],
    ["dsiHowItWorks2", "How it Works image 2", "صورة طريقة الاستخدام 2", "image_url"],
    ["dsiHowItWorks3", "How it Works image 3", "صورة طريقة الاستخدام 3", "image_url"],
    ["dsiImpact1", "Impact section image 1", "صورة الأثر 1", "image_url"],
    ["dsiImpact2", "Impact section image 2", "صورة الأثر 2", "image_url"],
    ["dsiSafeToUse", "Safe to use image", "صورة الاستخدام الآمن", "image_url"],
    ["dsiPracticalBanner", "Practical banner image", "صورة البانر", "image_url"],
    ["dsiIngredients", "Ingredients section image", "صورة المكونات", "image_url"],
    ["dsiFaq", "FAQ side image", "صورة الأسئلة الشائعة", "image_url"],
    ["detailStatements", "Product Details Banner Statements", "عبارات بانر تفاصيل المنتج", "textarea"],
  ].map((item, index) => field(item[0], "media", item[1], item[2], item[3], { storefrontVisible: true, sortOrder: (index + 1) * 10 }));
  const variants = [
    field("color_name", "variants", "Color", "اللون", "text", { required: true, storefrontVisible: true, sortOrder: 10 }),
    field("color_value", "variants", "Color value", "قيمة اللون", "text", { storefrontVisible: true, sortOrder: 20 }),
    field("size", "variants", "Size", "الحجم", "text", { required: true, storefrontVisible: true, sortOrder: 30 }),
  ];
  return {
    version: 1,
    tabs: productTabKeys.map((key, index) => ({ key, label: tabLabels[key], enabled: key !== "custom_sections", protected: key === "basic", sortOrder: (index + 1) * 10 })),
    fields,
    variantAttributes: variants,
    mediaFields: media,
    showcaseSections: [
      ["how_it_works", "How it Works", "طريقة الاستخدام"], ["impact", "Impact", "الأثر"],
      ["safe_to_use", "Safe to Use", "آمن للاستخدام"], ["ingredients", "Ingredients", "المكونات"],
      ["faq", "Frequently Asked Questions", "الأسئلة الشائعة"],
    ].map((item, index) => ({ key: item[0], title: { en: item[1], ar: item[2] }, enabled: true, storefrontVisible: true, sortOrder: (index + 1) * 10, fields: [] })),
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
  return field?.label?.[language] || field?.label?.en || field?.key || "";
}
