import React from "react";

export const adminModuleRegistry = Object.freeze([
  {
    key: "dashboard",
    label: { en: "Dashboard", ar: "لوحة التحكم", he: "לוח בקרה" },
    description: { en: "Company overview and operational summary.", he: "סקירת חברה ותפעול." },
    pageKeys: ["admin"],
    requiredPermission: "dashboard.view",
    defaultEnabled: true,
  },
  {
    key: "products",
    label: { en: "Products", ar: "المنتجات", he: "מוצרים" },
    description: { en: "Products, brands, and inventory management.", he: "ניהול מוצרים, מותגים ומלאי." },
    pageKeys: ["admin-products", "admin-products-new", "admin-brands", "admin-brands-new", "admin-inventory"],
    requiredPermission: "products.view",
    defaultEnabled: true,
  },
  {
    key: "product_settings",
    label: { en: "Product Settings", ar: "إعدادات المنتجات", he: "הגדרות מוצר" },
    description: { en: "Configure company-specific product form, fields, variants, media, and storefront product details.", he: "הגדרת טופס מוצר, שדות, וריאציות, מדיה ופרטי מוצר לחנות." },
    pageKeys: ["admin-product-settings"],
    requiredPermission: "product_settings.manage",
    requiredRoles: ["admin", "company_admin"],
    defaultEnabled: false,
  },
  {
    key: "categories",
    label: { en: "Categories", ar: "الأقسام", he: "קטגוריות" },
    description: { en: "Product category management.", he: "ניהול קטגוריות מוצרים." },
    pageKeys: ["admin-categories", "admin-categories-new"],
    requiredPermission: "products.view",
    defaultEnabled: true,
  },
  {
    key: "orders",
    label: { en: "Orders", ar: "الطلبات", he: "הזמנות" },
    description: { en: "Order management and fulfillment.", he: "ניהול הזמנות ומילוי." },
    pageKeys: ["admin-orders"],
    requiredPermission: "orders.view",
    defaultEnabled: true,
  },
  {
    key: "customers",
    label: { en: "Customers", ar: "العملاء", he: "לקוחות" },
    description: { en: "Customer records and service history.", he: "רשומות לקוחות והיסטוריית שירות." },
    pageKeys: ["admin-customers"],
    requiredPermission: "customers.view",
    defaultEnabled: true,
  },
  {
    key: "employees",
    label: { en: "Employees", ar: "الموظفون", he: "עובדים" },
    description: { en: "Staff accounts, permissions, and work access.", he: "חשבונות עובדים, הרשאות וגישת עבודה." },
    pageKeys: ["admin-staff", "admin-staff-new", "admin-employees"],
    requiredPermission: "employees.view",
    defaultEnabled: true,
  },
  {
    key: "website_media",
    label: { en: "Website Media", ar: "وسائط الموقع", he: "מדיה אתר" },
    description: { en: "Storefront images and managed media.", he: "תמונות חנות ומדיה מנוהלת." },
    pageKeys: ["admin-website-media"],
    requiredPermission: "website_media.manage",
    defaultEnabled: true,
  },
  {
    key: "homepage_content",
    label: { en: "Homepage Content", ar: "محتوى الصفحة الرئيسية", he: "תוכן דף הבית" },
    description: { en: "Vlogs, locations, reviews, and storefront content.", he: "בלוגים, מיקומים, ביקורות ותוכן חנות." },
    pageKeys: ["admin-vlogs", "admin-vlogs-new", "admin-store-locator", "admin-store-locator-new", "admin-reviews"],
    requiredPermission: "website_media.manage",
    defaultEnabled: true,
  },
  {
    key: "settings",
    label: { en: "Settings", ar: "الإعدادات", he: "הגדרות" },
    description: { en: "Company and storefront configuration.", he: "תצורת חברה וחנות." },
    pageKeys: ["admin-settings"],
    requiredRoles: ["admin", "company_admin"],
    defaultEnabled: true,
  },
  {
    key: "custom_modules",
    label: { en: "Custom Modules", ar: "الوحدات المخصصة", he: "מודולים מותאמים אישית" },
    description: { en: "Build safe company-specific admin sections and records.", he: "בניית קטעי ניהול ורשומות בטוחים לחברה." },
    pageKeys: [
      "admin-custom-modules",
      "admin-custom-modules-new",
      "admin-custom-modules-edit",
      "admin-custom-entry-list",
      "admin-custom-entry-new",
      "admin-custom-entry-edit",
    ],
    requiredPermission: "custom_modules.manage",
    defaultEnabled: true,
  },
  {
    key: "reports",
    label: { en: "Reports", ar: "التقارير", he: "דוחות" },
    description: { en: "Company performance and activity summary.", he: "ביצועי חברה וסיכום פעילות." },
    pageKeys: ["admin-reports"],
    requiredPermission: "reports.view",
    defaultEnabled: false,
  },
  {
    key: "activity_log",
    label: { en: "Activity Log", ar: "سجل النشاط", he: "יומן פעילות" },
    description: { en: "Administrative activity history.", he: "היסטוריית פעילות ניהולית." },
    pageKeys: ["admin-activity-log"],
    requiredPermission: "activity_log.view",
    defaultEnabled: false,
  },
  {
    key: "invoices",
    label: { en: "Invoices", ar: "الفواتير", he: "חשבוניות" },
    description: { en: "Company invoice management with number generation, line items, and print view.", he: "ניהול חשבוניות חברה עם הפקת מספרים, שורות ותצוגת הדפסה." },
    pageKeys: ["admin-invoices", "admin-invoices-new", "admin-invoices-view", "admin-invoices-edit"],
    requiredPermission: "invoices.view",
    defaultEnabled: false,
  },
  {
    key: "delivery",
    label: { en: "Delivery", ar: "التوصيل", he: "משלוחים" },
    description: { en: "City-based delivery zone pricing for checkout.", he: "תמחור אזורי משלוח לפי עיר להזמנה." },
    pageKeys: ["admin-delivery"],
    requiredPermission: "delivery.view",
    defaultEnabled: false,
  },
]);

const moduleByPageKey = new Map(
  adminModuleRegistry.flatMap((module) => module.pageKeys.map((pageKey) => [pageKey, module])),
);

export function defaultAdminModules(companyId = "") {
  return Object.fromEntries(
    adminModuleRegistry.map((module) => [
      module.key,
      module.key === "product_settings" && companyId === "eb-chemical"
        ? true
        : module.defaultEnabled,
    ]),
  );
}

export function resolveAdminModules(settings = {}, companyId = "") {
  const configured = settings?.adminModules;
  const defaults = defaultAdminModules(companyId);
  if (!configured || typeof configured !== "object" || Array.isArray(configured)) return defaults;

  return Object.fromEntries(
    adminModuleRegistry.map((module) => [
      module.key,
      typeof configured[module.key] === "boolean" ? configured[module.key] : defaults[module.key],
    ]),
  );
}

export function getAdminModuleForPage(pageKey) {
  return moduleByPageKey.get(pageKey) || null;
}

export function canAccessAdminPage(pageKey, user, enabledModules) {
  const module = getAdminModuleForPage(pageKey);
  if (!module) return true;
  if (enabledModules?.[module.key] !== true) return false;
  if (["admin", "company_admin"].includes(user?.role)) return true;
  if (module.key === "custom_modules") {
    return pageKey.startsWith("admin-custom-entry-");
  }
  if (module.requiredRoles && !module.requiredRoles.includes(user?.role)) return false;
  return !module.requiredPermission || user?.permissions?.includes(module.requiredPermission);
}

export function firstAccessibleAdminPage(user, enabledModules) {
  for (const module of adminModuleRegistry) {
    const pageKey = module.pageKeys[0];
    if (pageKey && canAccessAdminPage(pageKey, user, enabledModules)) return pageKey;
  }
  return "admin-login";
}

export const AdminModulesContext = React.createContext({
  activeCustomModuleKey: "",
  company: null,
  customModules: [],
  enabledModules: defaultAdminModules(),
});

export function useAdminModules() {
  return React.useContext(AdminModulesContext);
}
