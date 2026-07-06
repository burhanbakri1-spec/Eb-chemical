import React from "react";
import {
  Archive,
  Building2,
  Boxes,
  ChevronDown,
  ClipboardList,
  Cuboid,
  FileText,
  Film,
  FolderTree,
  Grid3X3,
  Images,
  Languages,
  MapPin,
  Moon,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Sun,
  Tag,
  UserCircle,
  Users,
} from "lucide-react";
import { canAccessAdminPage, useAdminModules } from "../data/adminModules.js";

const navSections = [
  {
    id: "platform",
    icon: Building2,
    label: { en: "Platform", ar: "المنصة", he: "פלטפורמה" },
    roles: ["super_admin"],
    items: [
      { key: "admin-platform-companies", icon: Building2, label: { en: "Companies", ar: "الشركات", he: "חברות" } },
      { key: "admin-platform-users", icon: Users, label: { en: "Users", ar: "المستخدمون", he: "משתמשים" } },
      { key: "admin-platform-memberships", icon: ShieldCheck, label: { en: "Memberships", ar: "العضويات", he: "חברויות" } },
    ],
  },
  {
    id: "dashboard",
    icon: Grid3X3,
    label: { en: "Dashboard", ar: "لوحة التحكم", he: "לוח בקרה" },
    items: [{ key: "admin", icon: Grid3X3, label: { en: "Dashboard", ar: "لوحة التحكم", he: "לוח בקרה" } }],
  },
  {
    id: "catalog",
    icon: Cuboid,
    label: { en: "Catalog", ar: "الكتالوج", he: "קטלוג" },
    items: [
      { key: "admin-products", icon: Package, label: { en: "Products", ar: "المنتجات", he: "מוצרים" } },
      { key: "admin-categories", icon: FolderTree, label: { en: "Categories", ar: "الأقسام", he: "קטגוריות" } },
      { key: "admin-brands", icon: Tag, label: { en: "Brands", ar: "العلامات التجارية", he: "מותגים" } },
    ],
  },
  {
    id: "storefront",
    icon: Store,
    label: { en: "Storefront", ar: "واجهة المتجر", he: "חנות" },
    items: [
      { key: "admin-vlogs", icon: Film, label: { en: "Vlogs", ar: "الفيديوهات", he: "בלוגים" } },
      { key: "admin-store-locator", icon: MapPin, label: { en: "Store Locator", ar: "مواقع المتاجر", he: "מיקומי חנויות" } },
      { key: "admin-website-media", icon: Images, label: { en: "Website Media", ar: "صور الموقع", he: "מדיה אתר" } },
      { key: "admin-website-texts", icon: FileText, label: { en: "Website Texts", ar: "نصوص الموقع", he: "טקסטים באתר" } },
    ],
  },
  {
    id: "operations",
    icon: ClipboardList,
    label: { en: "Operations", ar: "العمليات", he: "פעולות" },
    items: [
      { key: "admin-orders", icon: ShoppingCart, label: { en: "Orders", ar: "الطلبات", he: "הזמנות" } },
      { key: "admin-invoices", icon: FileText, label: { en: "Invoices", ar: "الفواتير", he: "חשבוניות" } },
      { key: "admin-delivery", icon: MapPin, label: { en: "Delivery", ar: "التوصيل", he: "משלוחים" } },
      { key: "admin-reviews", icon: Star, label: { en: "Reviews", ar: "التقييمات", he: "ביקורות" } },
      { key: "admin-inventory", icon: Boxes, label: { en: "Inventory", ar: "المخزون", he: "מלאי" } },
    ],
  },
  {
    id: "people",
    icon: Users,
    label: { en: "People", ar: "الأشخاص", he: "אנשים" },
    items: [
      { key: "admin-customers", icon: UserCircle, label: { en: "Customers", ar: "العملاء", he: "לקוחות" } },
      { key: "admin-staff", icon: ShieldCheck, label: { en: "Staff", ar: "الموظفون", he: "צוות" } },
    ],
  },
  {
    id: "configuration",
    icon: Settings,
    label: { en: "Configuration", ar: "الإعدادات", he: "תצורה" },
    items: [
      { key: "admin-settings", icon: Settings, label: { en: "Settings", ar: "الإعدادات", he: "הגדרות" } },
      { key: "admin-product-settings", icon: Package, label: { en: "Product Settings", ar: "إعدادات المنتجات", he: "הגדרות מוצר" } },
      { key: "admin-reports", icon: ClipboardList, label: { en: "Reports", ar: "التقارير", he: "דוחות" } },
      { key: "admin-activity-log", icon: ClipboardList, label: { en: "Activity Log", ar: "سجل النشاط", he: "יומן פעילות" } },
      { key: "admin-custom-modules", icon: Cuboid, label: { en: "Module Builder", ar: "منشئ الوحدات", he: "בונה מודולים" } },
    ],
  },
];

const childAliases = {
  "admin-products-new": "admin-products",
  "admin-categories-new": "admin-categories",
  "admin-brands-new": "admin-brands",
  "admin-vlogs-new": "admin-vlogs",
  "admin-store-locator-new": "admin-store-locator",
  "admin-staff-new": "admin-staff",
  "admin-custom-modules-new": "admin-custom-modules",
  "admin-custom-modules-edit": "admin-custom-modules",
  "admin-invoices-new": "admin-invoices",
  "admin-invoices-view": "admin-invoices",
  "admin-invoices-edit": "admin-invoices",
};

function localize(value, language) {
  if (!value) return "";
  return value[language] || value.ar || value.en || "";
}

function normalizedActive(activePage) {
  return childAliases[activePage] || activePage;
}

function AdminLayout({
  activePage,
  children,
  currentUser,
  language = "en",
  onLogout,
  onNavigate,
  onLanguageChange,
  subtitle,
  title,
  isDarkMode = false,
  onToggleDarkMode,
}) {
  const isPlatformAdmin = currentUser?.role === "super_admin";
  const { activeCustomModuleKey, company, customModules, enabledModules } = useAdminModules();
  const activeKey = activePage.startsWith("admin-custom-entry-")
    ? `admin-custom:${activeCustomModuleKey}`
    : normalizedActive(activePage);
  const visibleNavSections = React.useMemo(
    () => {
      const customSection = customModules?.some((module) => module.enabled !== false)
        ? [{
            id: "custom-modules",
            icon: Cuboid,
            label: { en: "Custom Modules", ar: "الوحدات المخصصة", he: "מודולים מותאמים אישית" },
            items: customModules
              .filter((module) => module.enabled !== false)
              .map((module) => ({
                key: `admin-custom:${module.key}`,
                page: "admin-custom-entry-list",
                options: { customModuleKey: module.key },
                icon: FolderTree,
                label: { en: module.label, ar: module.label, he: module.label },
              })),
          }]
        : [];
      return [...navSections, ...customSection].flatMap((section) => {
        if (isPlatformAdmin) {
          return section.roles?.includes("super_admin") === true ? [section] : [];
        }
        if (section.roles && !section.roles.includes(currentUser?.role)) return [];
        const items = section.items.filter((item) => canAccessAdminPage(item.key, currentUser, enabledModules));
        return items.length ? [{ ...section, items }] : [];
      });
    },
    [currentUser, customModules, enabledModules, isPlatformAdmin]
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState(() => {
    const defaults = {};
    visibleNavSections.forEach((section) => {
      defaults[section.id] = section.items.some((item) => item.key === activeKey) || section.id === "dashboard";
    });
    return defaults;
  });

  React.useEffect(() => {
    function closeLang(event) {
      if (adminLangRef.current && !adminLangRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeLang);
    return () => document.removeEventListener("pointerdown", closeLang);
  }, []);

  React.useEffect(() => {
    setOpenSections((current) => {
      const next = { ...current };
      visibleNavSections.forEach((section) => {
        if (section.items.some((item) => item.key === activeKey)) {
          next[section.id] = true;
        }
      });
      return next;
    });
  }, [activeKey, visibleNavSections]);

  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const adminLangRef = React.useRef(null);
  const labels = {
    admin: language === "ar" ? "الإدارة" : language === "he" ? "ניהול" : "Admin",
    menu: language === "ar" ? "القائمة" : language === "he" ? "תפריט" : "Menu",
    signOut: language === "ar" ? "تسجيل الخروج" : language === "he" ? "התנתק" : "Sign Out",
    darkMode: language === "ar" ? "الوضع الليلي" : language === "he" ? "מצב כהה" : "Dark mode",
    lightMode: language === "ar" ? "الوضع الفاتح" : language === "he" ? "מצב בהיר" : "Light mode",
  };
  const langOptions = [
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
    { code: "he", label: "עברית" },
  ];
  const currentLangLabel = langOptions.find((o) => o.code === language)?.label || "EN";

  return (
    <section className={`admin-layout ${isDarkMode ? "admin-dark" : ""}`} dir={language === "ar" || language === "he" ? "rtl" : "ltr"}>
      <button className="admin-mobile-menu" onClick={() => setMobileOpen(true)} type="button">
        <Archive size={16} />
        {labels.menu}
      </button>

      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-logo-mark">EB</span>
          <div>
            <strong>{isPlatformAdmin ? "iGroup" : company?.name || "EB Chemical"}</strong>
            <small>{isPlatformAdmin ? "Platform Administration" : labels.admin}</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {visibleNavSections.map((section) => {
            const SectionIcon = section.icon;
            const isSingle = section.items.length === 1 && section.id === "dashboard";
            const isOpen = openSections[section.id];
            const sectionActive = section.items.some((item) => item.key === activeKey);

            return (
              <div className="admin-nav-group" key={section.id}>
                {isSingle ? (
                  <button
                    className={`admin-nav-button ${sectionActive ? "active" : ""}`}
                    onClick={() => {
                      onNavigate(section.items[0].page || section.items[0].key, section.items[0].options);
                      setMobileOpen(false);
                    }}
                    type="button"
                  >
                    <SectionIcon size={16} />
                    {localize(section.label, language)}
                  </button>
                ) : (
                  <>
                    <button
                      className={`admin-nav-section ${sectionActive ? "active" : ""}`}
                      onClick={() =>
                        setOpenSections((current) => ({
                          ...current,
                          [section.id]: !current[section.id],
                        }))
                      }
                      type="button"
                    >
                      <span>
                        <SectionIcon size={16} />
                        {localize(section.label, language)}
                      </span>
                      <ChevronDown className={isOpen ? "open" : ""} size={15} />
                    </button>
                    {isOpen && (
                      <div className="admin-nav-items">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              className={`admin-nav-button ${activeKey === item.key ? "active" : ""}`}
                              key={item.key}
                              onClick={() => {
                                onNavigate(item.page || item.key, item.options);
                                setMobileOpen(false);
                              }}
                              type="button"
                            >
                              <ItemIcon size={15} />
                              {localize(item.label, language)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {mobileOpen && <button aria-label="Close menu" className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} type="button" />}

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="admin-userbar">
            <div className="admin-lang-selector" ref={adminLangRef}>
              <button className="admin-icon-button admin-language-button" onClick={() => setIsLangOpen((open) => !open)} type="button">
                <Languages size={15} />
                <span>{currentLangLabel}</span>
              </button>
              {isLangOpen && (
                <div className="admin-lang-dropdown">
                  {langOptions.map((opt) => (
                    <button
                      className={language === opt.code ? "active" : ""}
                      key={opt.code}
                      onClick={() => { onLanguageChange(opt.code); setIsLangOpen(false); }}
                      type="button"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="admin-icon-button" aria-label={isDarkMode ? labels.lightMode : labels.darkMode} onClick={onToggleDarkMode} type="button">
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <span className="admin-user-avatar">{currentUser?.name?.charAt(0) || "A"}</span>
            <div>
              <strong>{currentUser?.name || "admin"}</strong>
              <small>{currentUser?.role || "admin"}</small>
            </div>
            <button className="admin-signout-button" onClick={onLogout} type="button">
              {labels.signOut}
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </section>
  );
}

export default AdminLayout;
