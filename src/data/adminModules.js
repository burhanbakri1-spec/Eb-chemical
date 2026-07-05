import React from "react";

export const adminModuleRegistry = Object.freeze([
  {
    key: "dashboard",
    label: { en: "Dashboard", ar: "لوحة التحكم" },
    description: "Company overview and operational summary.",
    pageKeys: ["admin"],
    requiredPermission: "dashboard.view",
    defaultEnabled: true,
  },
  {
    key: "products",
    label: { en: "Products", ar: "المنتجات" },
    description: "Products, brands, and inventory management.",
    pageKeys: ["admin-products", "admin-products-new", "admin-brands", "admin-brands-new", "admin-inventory"],
    requiredPermission: "products.view",
    defaultEnabled: true,
  },
  {
    key: "categories",
    label: { en: "Categories", ar: "الأقسام" },
    description: "Product category management.",
    pageKeys: ["admin-categories", "admin-categories-new"],
    requiredPermission: "products.view",
    defaultEnabled: true,
  },
  {
    key: "orders",
    label: { en: "Orders", ar: "الطلبات" },
    description: "Order management and fulfillment.",
    pageKeys: ["admin-orders"],
    requiredPermission: "orders.view",
    defaultEnabled: true,
  },
  {
    key: "customers",
    label: { en: "Customers", ar: "العملاء" },
    description: "Customer records and service history.",
    pageKeys: ["admin-customers"],
    requiredPermission: "customers.view",
    defaultEnabled: true,
  },
  {
    key: "employees",
    label: { en: "Employees", ar: "الموظفون" },
    description: "Staff accounts, permissions, and work access.",
    pageKeys: ["admin-staff", "admin-staff-new", "admin-employees"],
    requiredPermission: "employees.view",
    defaultEnabled: true,
  },
  {
    key: "website_media",
    label: { en: "Website Media", ar: "وسائط الموقع" },
    description: "Storefront images and managed media.",
    pageKeys: ["admin-website-media"],
    requiredPermission: "website_media.manage",
    defaultEnabled: true,
  },
  {
    key: "homepage_content",
    label: { en: "Homepage Content", ar: "محتوى الصفحة الرئيسية" },
    description: "Vlogs, locations, reviews, and storefront content.",
    pageKeys: ["admin-vlogs", "admin-vlogs-new", "admin-store-locator", "admin-store-locator-new", "admin-reviews"],
    requiredPermission: "website_media.manage",
    defaultEnabled: true,
  },
  {
    key: "settings",
    label: { en: "Settings", ar: "الإعدادات" },
    description: "Company and storefront configuration.",
    pageKeys: ["admin-settings"],
    requiredRoles: ["admin", "company_admin"],
    defaultEnabled: true,
  },
  {
    key: "custom_modules",
    label: { en: "Custom Modules", ar: "الوحدات المخصصة" },
    description: "Build safe company-specific admin sections and records.",
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
    label: { en: "Reports", ar: "التقارير" },
    description: "Reserved foundation for company reporting.",
    pageKeys: [],
    requiredPermission: "reports.view",
    defaultEnabled: false,
  },
  {
    key: "activity_log",
    label: { en: "Activity Log", ar: "سجل النشاط" },
    description: "Reserved foundation for administrative activity history.",
    pageKeys: [],
    requiredPermission: "activity_log.view",
    defaultEnabled: false,
  },
]);

const moduleByPageKey = new Map(
  adminModuleRegistry.flatMap((module) => module.pageKeys.map((pageKey) => [pageKey, module])),
);

export function defaultAdminModules() {
  return Object.fromEntries(adminModuleRegistry.map((module) => [module.key, module.defaultEnabled]));
}

export function resolveAdminModules(settings = {}) {
  const configured = settings?.adminModules;
  const defaults = defaultAdminModules();
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
