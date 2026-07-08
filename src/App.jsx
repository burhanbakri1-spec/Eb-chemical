import React from "react";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import SustainabilityPage from "./pages/SustainabilityPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AdminCompaniesPage from "./pages/AdminCompaniesPage.jsx";
import AdminPlatformMembershipsPage from "./pages/AdminPlatformMembershipsPage.jsx";
import AdminPlatformUsersPage from "./pages/AdminPlatformUsersPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminEmployeesPage from "./pages/AdminEmployeesPage.jsx";
import AdminCustomModulesPage from "./pages/AdminCustomModulesPage.jsx";
import AdminCustomModuleEntriesPage from "./pages/AdminCustomModuleEntriesPage.jsx";
import AdminInvoicesPage from "./pages/AdminInvoicesPage.jsx";
import AdminInvoiceFormPage from "./pages/AdminInvoiceFormPage.jsx";
import AdminInvoiceViewPage from "./pages/AdminInvoiceViewPage.jsx";
import AdminDeliveryZonesPage from "./pages/AdminDeliveryZonesPage.jsx";
import AdminActivityLogPage from "./pages/AdminActivityLogPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import AdminProductSettingsPage from "./pages/AdminProductSettingsPage.jsx";
import AdminWebsiteTextsPage from "./pages/AdminWebsiteTextsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import CleanupsPage from "./pages/CleanupsPage.jsx";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage.jsx";
import EBPointsPage from "./pages/EBPointsPage.jsx";
import FollowUsPage from "./pages/FollowUsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import { hasPermission } from "./data/permissions.js";
import {
  AdminModulesContext,
  canAccessAdminPage,
  firstAccessibleAdminPage,
  getAdminModuleForPage,
  resolveAdminModules,
} from "./data/adminModules.js";
import { createTranslator } from "./data/translations.js";
import {
  fetchCurrentUser,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerCustomer,
  setCurrentUser,
} from "./utils/auth.js";
import {
  assignOrderEmployee,
  createOrder,
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from "./utils/orders.js";
import {
  createEmployee as createEmployeeApi,
  deleteEmployee as deleteEmployeeApi,
  fetchEmployees,
  updateEmployee as updateEmployeeApi,
  updateEmployeeStatus,
} from "./utils/employeesApi.js";
import {
  fetchEmployeeWorkSessions,
  fetchMyTodayWorkSession,
} from "./utils/workSessionsApi.js";
import {
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  fetchProducts,
  updateProduct as updateProductApi,
} from "./utils/productsApi.js";
import {
  deleteHomepageOffer,
  deleteReview as deleteReviewApi,
  fetchAllHomepageCategoryCards,
  fetchAllHomepageOffers,
  fetchAllReviews,
  fetchHomepageCategoryCards,
  fetchHomepageOffers,
  fetchReviews,
  saveHomepageCategoryCard,
  saveHomepageOffer,
  submitCustomerReview,
  updateReviewStatus,
} from "./utils/homeContentApi.js";
import {
  clearWebsiteMediaCache,
  deleteWebsiteMedia as deleteWebsiteMediaApi,
  fetchAllWebsiteMedia,
  fetchWebsiteMedia,
  saveWebsiteMedia as saveWebsiteMediaApi,
} from "./utils/websiteMediaApi.js";
import { isVariantVisible } from "./utils/productVariants.js";
import { fetchCompanyContext } from "./utils/companyContextApi.js";
import { fetchCustomModules } from "./utils/customModulesApi.js";
import { createDefaultProductSchema } from "./data/productSchema.js";
import { fetchProductSchema } from "./utils/productSchemaApi.js";
import { fetchWebsiteTexts } from "./utils/websiteTextsApi.js";
import {
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackRemoveFromCart,
  trackViewCategory,
  trackViewContent,
} from "./utils/metaPixel.js";
import "./styles/global.css";

const cartStorageKey = "epChemicalCart";
const languageStorageKey = "epChemicalLanguage";
const pagePaths = {
  home: "/",
  products: "/products",
  about: "/about",
  sustainability: "/sustainability",
  how: "/how-it-works",
  cleanups: "/cleanups",
  "eb-points": "/eb-points",
  social: "/follow-us",
  "follow-us": "/follow-us",
  login: "/login",
  "admin-login": "/admin/login",
  register: "/register",
  account: "/account",
  cart: "/cart",
  checkout: "/checkout",
  admin: "/admin/dashboard",
  "admin-platform-companies": "/admin/platform/companies",
  "admin-platform-users": "/admin/platform/users",
  "admin-platform-memberships": "/admin/platform/memberships",
  "admin-products": "/admin/products",
  "admin-products-new": "/admin/products/new",
  "admin-categories": "/admin/categories",
  "admin-categories-new": "/admin/categories/new",
  "admin-brands": "/admin/brands",
  "admin-brands-new": "/admin/brands/new",
  "admin-vlogs": "/admin/vlogs",
  "admin-vlogs-new": "/admin/vlogs/new",
  "admin-store-locator": "/admin/store-locator",
  "admin-store-locator-new": "/admin/store-locator/new",
  "admin-website-media": "/admin/website-media",
  "admin-website-texts": "/admin/website-texts",
  "admin-orders": "/admin/orders",
  "admin-reviews": "/admin/reviews",
  "admin-inventory": "/admin/inventory",
  "admin-customers": "/admin/customers",
  "admin-staff": "/admin/staff",
  "admin-staff-new": "/admin/staff/new",
  "admin-employees": "/admin/staff",
  "admin-settings": "/admin/settings",
  "admin-product-settings": "/admin/product-settings",
  "admin-custom-modules": "/admin/custom-modules",
  "admin-custom-modules-new": "/admin/custom-modules/new",
  "admin-invoices": "/admin/invoices",
  "admin-invoices-new": "/admin/invoices/new",
  "admin-delivery": "/admin/delivery",
  "admin-activity-log": "/admin/activity-log",
  "admin-reports": "/admin/reports",
  employee: "/employee",
};

const adminPageKeys = [
  "admin",
  "admin-platform-companies",
  "admin-platform-users",
  "admin-platform-memberships",
  "admin-products",
  "admin-products-new",
  "admin-categories",
  "admin-categories-new",
  "admin-brands",
  "admin-brands-new",
  "admin-vlogs",
  "admin-vlogs-new",
  "admin-store-locator",
  "admin-store-locator-new",
  "admin-website-media",
  "admin-website-texts",
  "admin-orders",
  "admin-reviews",
  "admin-inventory",
  "admin-customers",
  "admin-staff",
  "admin-staff-new",
  "admin-employees",
  "admin-settings",
  "admin-product-settings",
  "admin-custom-modules",
  "admin-custom-modules-new",
  "admin-custom-modules-edit",
  "admin-invoices",
  "admin-invoices-new",
  "admin-invoices-view",
  "admin-invoices-edit",
  "admin-delivery",
  "admin-activity-log",
  "admin-reports",
  "admin-custom-entry-list",
  "admin-custom-entry-new",
  "admin-custom-entry-edit",
];

const platformAdminPageKeys = [
  "admin-platform-companies",
  "admin-platform-users",
  "admin-platform-memberships",
];

const customAdminPageKeys = [
  "admin-product-settings",
  "admin-website-texts",
  "admin-custom-modules",
  "admin-custom-modules-new",
  "admin-custom-modules-edit",
  "admin-custom-entry-list",
  "admin-custom-entry-new",
  "admin-custom-entry-edit",
];

function decodePathPart(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function getRouteFromPath() {
  const pathname = window.location.pathname;
  if (pathname === "/admin") return { page: "admin", params: {} };
  if (pathname === "/admin/dashboard") return { page: "admin", params: {} };
  if (pathname === "/staff") return { page: "employee", params: {} };
  let match = pathname.match(/^\/admin\/custom-modules\/([^/]+)\/edit\/?$/);
  if (match) return { page: "admin-custom-modules-edit", params: { moduleId: decodePathPart(match[1]) } };
  match = pathname.match(/^\/admin\/custom\/([^/]+)\/new\/?$/);
  if (match) return { page: "admin-custom-entry-new", params: { customModuleKey: decodePathPart(match[1]) } };
  match = pathname.match(/^\/admin\/custom\/([^/]+)\/([^/]+)\/?$/);
  if (match) return { page: "admin-custom-entry-edit", params: { customModuleKey: decodePathPart(match[1]), entryId: decodePathPart(match[2]) } };
  match = pathname.match(/^\/admin\/custom\/([^/]+)\/?$/);
  if (match) return { page: "admin-custom-entry-list", params: { customModuleKey: decodePathPart(match[1]) } };
  match = pathname.match(/^\/admin\/invoices\/([^/]+)\/edit\/?$/);
  if (match) return { page: "admin-invoices-edit", params: { invoiceId: decodePathPart(match[1]) } };
  match = pathname.match(/^\/admin\/invoices\/([^/]+)\/?$/);
  if (match) return { page: "admin-invoices-view", params: { invoiceId: decodePathPart(match[1]) } };
  const entry = Object.entries(pagePaths).find(([, path]) => path === pathname);
  return { page: entry?.[0] || "home", params: {} };
}

function getInitialPageFromPath() {
  return getRouteFromPath().page;
}

function isStaffRole(role) {
  return role === "employee" || role === "staff" || role === "manager";
}

function isCompanyAdminRole(role) {
  return role === "admin" || role === "company_admin";
}

function getStoredCart() {
  try {
    const storedCart = localStorage.getItem(cartStorageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    return [];
  }
}

function getTrackingName(value, language, fallback = "") {
  if (typeof value === "string") return value;
  return value?.[language] || value?.en || value?.ar || fallback;
}

function getProductTrackingValue(product) {
  const visibleVariant = (product?.variants || []).find(isVariantVisible);
  const value = visibleVariant?.price ?? product?.sizes?.[0]?.price ?? product?.price ?? 0;
  return Number(value) || 0;
}

function getCartTrackingId(item) {
  return item?.productId || item?.slug || item?.cartId;
}



function App() {
  const [activePage, setActivePage] = React.useState(getInitialPageFromPath);
  const [routeParams, setRouteParams] = React.useState(() => getRouteFromPath().params);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [activeProductSlug, setActiveProductSlug] = React.useState("");
  const [cartItems, setCartItems] = React.useState(getStoredCart);
  const [demoProducts, setDemoProducts] = React.useState([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [productsError, setProductsError] = React.useState("");
  const [employees, setEmployees] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [workSession, setWorkSession] = React.useState(null);
  const [employeeSessions, setEmployeeSessions] = React.useState([]);
  const [homepageOffers, setHomepageOffers] = React.useState([]);
  const [homepageCategoryCards, setHomepageCategoryCards] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [websiteMedia, setWebsiteMedia] = React.useState([]);
  const [websiteMediaHiddenKeys, setWebsiteMediaHiddenKeys] = React.useState([]);
  const [websiteTexts, setWebsiteTexts] = React.useState([]);
  const [homeContentLoading, setHomeContentLoading] = React.useState(true);
  const [homeContentError, setHomeContentError] = React.useState("");
  const [websiteMediaLoading, setWebsiteMediaLoading] = React.useState(true);
  const [websiteMediaError, setWebsiteMediaError] = React.useState("");
  const [companyContext, setCompanyContext] = React.useState(null);
  const [companyContextLoaded, setCompanyContextLoaded] = React.useState(false);
  const [productSchema, setProductSchema] = React.useState(createDefaultProductSchema);
  const [customModules, setCustomModules] = React.useState([]);
  const [customModulesLoaded, setCustomModulesLoaded] = React.useState(false);
  const [currentUser, setUser] = React.useState(getCurrentUser);
  const [loginMessage, setLoginMessage] = React.useState("");
  const [adminLoginMessage, setAdminLoginMessage] = React.useState("");
  const [registerMessage, setRegisterMessage] = React.useState("");
  const [adminMessage, setAdminMessage] = React.useState("");
  const [checkoutMessage, setCheckoutMessage] = React.useState("");
  const [lastOrder, setLastOrder] = React.useState(null);
  const [language, setLanguage] = React.useState(
    () => localStorage.getItem(languageStorageKey) || "ar"
  );
  function handleLanguageChange(lang) {
    setLanguage(lang);
  }
  const [isAdminDarkMode, setIsAdminDarkMode] = React.useState(
    () => localStorage.getItem("epChemicalAdminDarkMode") === "true"
  );
  const lastViewedProductRef = React.useRef("");
  const checkoutTrackedRef = React.useRef(false);
  const t = React.useMemo(() => createTranslator(language), [language]);
  const enabledAdminModules = React.useMemo(
    () => resolveAdminModules(companyContext?.settings, companyContext?.id),
    [companyContext?.id, companyContext?.settings],
  );
  const adminModulesContextValue = React.useMemo(
    () => ({
      company: companyContext,
      enabledModules: enabledAdminModules,
      customModules,
      activeCustomModuleKey: routeParams.customModuleKey || "",
    }),
    [companyContext, enabledAdminModules, customModules, routeParams.customModuleKey],
  );

  React.useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  React.useEffect(() => {
    const pageKey = activePage === "product" ? `${activePage}:${activeProductSlug}` : activePage;

    if (!window.__ebMetaPixelSpaReady) {
      window.__ebMetaPixelSpaReady = true;
      window.__ebMetaPixelLastPageKey = pageKey;
      return;
    }

    if (window.__ebMetaPixelLastPageKey === pageKey) return;

    window.__ebMetaPixelLastPageKey = pageKey;
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [activePage, activeProductSlug]);

  React.useEffect(() => {
    if (activePage !== "product") {
      lastViewedProductRef.current = "";
      return;
    }

    const viewedProduct = demoProducts.find((product) => product.slug === activeProductSlug);
    if (!viewedProduct || lastViewedProductRef.current === viewedProduct.slug) return;

    lastViewedProductRef.current = viewedProduct.slug;
    trackViewContent({
      contentName: getTrackingName(viewedProduct.name, language, viewedProduct.slug),
      contentIds: [viewedProduct.id || viewedProduct.slug],
      value: getProductTrackingValue(viewedProduct),
      category: viewedProduct.categoryId || viewedProduct.categoryKey || "",
    });
  }, [activePage, activeProductSlug, demoProducts, language]);

  React.useEffect(() => {
    if (activePage !== "checkout") {
      checkoutTrackedRef.current = false;
      return;
    }

    if (checkoutTrackedRef.current || cartItems.length === 0) return;

    checkoutTrackedRef.current = true;
    trackInitiateCheckout({
      contentIds: cartItems.map(getCartTrackingId),
      value: cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
      numItems: cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    });
  }, [activePage, cartItems]);

  React.useEffect(() => {
    loadProducts();
    loadHomeContent();
    loadWebsiteMedia();
    loadWebsiteTexts();
    hydrateUser();
    loadCompanyContext();
    loadProductSchema();
  }, []);

  React.useEffect(() => {
    function handlePopState() {
      const route = getRouteFromPath();
      setActivePage(route.page);
      setRouteParams(route.params);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  React.useEffect(() => {
    loadOrders(currentUser);
    loadEmployees(currentUser);
    if (isCompanyAdminRole(currentUser?.role)) {
      loadReviews(currentUser);
    }
    loadWorkSession(currentUser);
    loadWebsiteMedia(currentUser);
  }, [currentUser]);

  React.useEffect(() => {
    void loadCustomModules(currentUser);
  }, [currentUser, enabledAdminModules.custom_modules]);

  React.useEffect(() => {
    const portalPages = [...adminPageKeys, "employee"];

    if (activePage === "admin-login" && currentUser) {
      if (currentUser.role === "super_admin") {
        navigate("admin-platform-companies");
      } else if (["admin", "company_admin", "manager"].includes(currentUser.role)) {
        navigate("admin");
      } else if (isStaffRole(currentUser.role)) {
        navigate("employee");
      } else {
        setAdminLoginMessage(t("adminLogin.staffOnly"));
      }
      return;
    }

    if (portalPages.includes(activePage) && !currentUser) {
      setAdminLoginMessage(t("adminLogin.loginRequired"));
      navigate("admin-login", { preserveAdminLoginMessage: true });
      return;
    }

    if (
      portalPages.includes(activePage) &&
      currentUser?.role === "super_admin" &&
      !platformAdminPageKeys.includes(activePage)
    ) {
      navigate("admin-platform-companies");
      return;
    }

    if (portalPages.includes(activePage) && currentUser?.role === "customer") {
      setAdminLoginMessage(t("adminLogin.staffOnly"));
      navigate("admin-login", { preserveAdminLoginMessage: true });
    }
  }, [activePage, currentUser, t]);

  React.useEffect(() => {
    if (!companyContextLoaded || !currentUser || currentUser.role === "super_admin") return;
    if (!getAdminModuleForPage(activePage)) return;
    if (canAccessAdminPage(activePage, currentUser, enabledAdminModules)) return;

    const fallbackPage = firstAccessibleAdminPage(currentUser, enabledAdminModules);
    if (fallbackPage !== activePage) navigate(fallbackPage);
  }, [activePage, companyContextLoaded, currentUser, enabledAdminModules]);

  React.useEffect(() => {
    if (!customModulesLoaded || !currentUser || currentUser.role === "super_admin") return;
    if (!["admin-custom-entry-list", "admin-custom-entry-new", "admin-custom-entry-edit"].includes(activePage)) return;
    const module = customModules.find((item) => item.key === routeParams.customModuleKey && item.enabled !== false);
    if (!module) {
      const fallbackModule = customModules.find((item) => item.enabled !== false);
      if (fallbackModule) navigate("admin-custom-entry-list", { customModuleKey: fallbackModule.key });
      else navigate(firstAccessibleAdminPage(currentUser, enabledAdminModules));
    }
  }, [activePage, currentUser, customModules, customModulesLoaded, enabledAdminModules, routeParams.customModuleKey]);

  React.useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" || language === "he" ? "rtl" : "ltr";
  }, [language]);

  React.useEffect(() => {
    localStorage.setItem("epChemicalAdminDarkMode", String(isAdminDarkMode));
  }, [isAdminDarkMode]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function effectiveItemPrice(item) {
    const isTrader = currentUser?.accountType === "trader" || currentUser?.accountType === "wholesale";
    if (!isTrader) return Number(item.price || 0);
    const product = demoProducts.find((p) => p.id === item.productId || p.slug === item.slug);
    if (!product) return Number(item.price || 0);
    if (Array.isArray(product.variants)) {
      const variant = product.variants.find((v) =>
        v.id === item.variantId || v.size === (item.selectedSize || item.size),
      );
      if (variant?.wholesalePrice != null && Number(variant.wholesalePrice) > 0) return Number(variant.wholesalePrice);
    }
    if (product.wholesalePrice != null && Number(product.wholesalePrice) > 0) return Number(product.wholesalePrice);
    return Number(item.price || 0);
  }

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + effectiveItemPrice(item) * item.quantity,
    0,
  );

  async function loadCompanyContext() {
    try {
      setCompanyContext(await fetchCompanyContext());
    } catch {
      setCompanyContext(null);
    } finally {
      setCompanyContextLoaded(true);
    }
  }

  async function loadProductSchema() {
    setProductSchema(await fetchProductSchema());
  }

  async function loadCustomModules(user = currentUser) {
    if (!user) {
      setCustomModules([]);
      setCustomModulesLoaded(false);
      return [];
    }
    if (user.role === "customer" || user.role === "super_admin" || enabledAdminModules.custom_modules !== true) {
      setCustomModules([]);
      setCustomModulesLoaded(true);
      return [];
    }
    setCustomModulesLoaded(false);
    try {
      const modules = await fetchCustomModules();
      setCustomModules(modules);
      return modules;
    } catch {
      setCustomModules([]);
      return [];
    } finally {
      setCustomModulesLoaded(true);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");
    try {
      setDemoProducts(await fetchProducts());
    } catch (error) {
      setDemoProducts([]);
      setProductsError(error.message || "Products could not be loaded.");
      setAdminMessage(error.message);
    } finally {
      setProductsLoading(false);
    }
  }

  async function refreshProducts() {
    try {
      const products = await fetchProducts();
      setDemoProducts(products);
      return products;
    } catch (error) {
      setAdminMessage(error.message);
      return demoProducts;
    }
  }

  async function hydrateUser() {
    try {
      setUser(await fetchCurrentUser());
    } catch (error) {
      setCurrentUser(null);
      setUser(null);
    }
  }

  async function loadOrders(user) {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      setOrders(await getOrders(user));
    } catch (error) {
      setOrders([]);
    }
  }

  async function refreshOrders(user = currentUser) {
    if (!user) {
      setOrders([]);
      return [];
    }

    try {
      const nextOrders = await getOrders(user);
      setOrders(nextOrders);
      return nextOrders;
    } catch (error) {
      setOrders([]);
      return [];
    }
  }

  async function loadEmployees(user) {
    if (!isCompanyAdminRole(user?.role)) {
      setEmployees([]);
      return;
    }

    try {
      setEmployees(await fetchEmployees());
    } catch (error) {
      setEmployees([]);
    }
  }

  async function refreshEmployees() {
    try {
      const nextEmployees = await fetchEmployees();
      setEmployees(nextEmployees);
      return nextEmployees;
    } catch (error) {
      setAdminMessage(error.message);
      return employees;
    }
  }

  async function loadWorkSession(user) {
    if (!user) {
      setWorkSession(null);
      setEmployeeSessions([]);
      return;
    }

    try {
      if (isStaffRole(user.role)) {
        setWorkSession(await fetchMyTodayWorkSession());
      }

      if (isCompanyAdminRole(user.role)) {
        setEmployeeSessions(await fetchEmployeeWorkSessions());
      }
    } catch (error) {
      if (isStaffRole(user.role)) {
        setWorkSession(null);
      }
      if (isCompanyAdminRole(user.role)) {
        setEmployeeSessions([]);
      }
    }
  }

  async function loadHomeContent() {
    setHomeContentLoading(true);
    setHomeContentError("");
    const results = await Promise.allSettled([
      fetchHomepageOffers(),
      fetchHomepageCategoryCards(),
      fetchReviews(),
    ]);
    const [offersResult, cardsResult, reviewsResult] = results;
    setHomepageOffers(offersResult.status === "fulfilled" ? offersResult.value : []);
    setHomepageCategoryCards(cardsResult.status === "fulfilled" ? cardsResult.value : []);
    setReviews(reviewsResult.status === "fulfilled" ? reviewsResult.value : []);
    if (results.some((result) => result.status === "rejected")) {
      setHomeContentError("Some homepage content could not be loaded.");
    }
    setHomeContentLoading(false);
  }

  async function loadWebsiteMedia(user = null) {
    setWebsiteMediaLoading(true);
    setWebsiteMediaError("");
    try {
      clearWebsiteMediaCache();
      const canManage = user && hasPermission(user, "website_media.manage");
      if (canManage) {
        const response = await fetchAllWebsiteMedia();
        setWebsiteMedia([
          ...response.items,
          ...response.hiddenSectionKeys.map((sectionKey) => ({ sectionKey, isHidden: true })),
        ]);
        setWebsiteMediaHiddenKeys(response.hiddenSectionKeys);
      } else {
        setWebsiteMedia(await fetchWebsiteMedia());
        setWebsiteMediaHiddenKeys([]);
      }
    } catch (error) {
      setWebsiteMedia([]);
      setWebsiteMediaError(error.message || "Website media could not be loaded.");
    } finally {
      setWebsiteMediaLoading(false);
    }
  }

  async function loadReviews(user) {
    if (!user) return;
    setReviews(await fetchAllReviews());
    if (isCompanyAdminRole(user.role) || isStaffRole(user.role)) {
      setHomepageOffers(await fetchAllHomepageOffers());
      setHomepageCategoryCards(await fetchAllHomepageCategoryCards());
    }
  }

  function navigate(page, options = {}) {
    setLoginMessage("");
    if (!options.preserveAdminLoginMessage) {
      setAdminLoginMessage("");
    }
    setRegisterMessage("");
    setAdminMessage("");
    setCheckoutMessage("");
    if (options.slug) {
      setActiveProductSlug(options.slug);
    }
    const nextParams = {
      customModuleKey: options.customModuleKey || "",
      moduleId: options.moduleId || "",
      entryId: options.entryId || "",
      invoiceId: options.invoiceId || "",
    };
    setRouteParams(nextParams);
    setActivePage(page);
    const nextPath = page === "admin-custom-modules-edit"
      ? `/admin/custom-modules/${encodeURIComponent(nextParams.moduleId)}/edit`
      : page === "admin-custom-entry-list"
        ? `/admin/custom/${encodeURIComponent(nextParams.customModuleKey)}`
        : page === "admin-custom-entry-new"
          ? `/admin/custom/${encodeURIComponent(nextParams.customModuleKey)}/new`
          : page === "admin-custom-entry-edit"
            ? `/admin/custom/${encodeURIComponent(nextParams.customModuleKey)}/${encodeURIComponent(nextParams.entryId)}`
            : page === "admin-invoices-view"
              ? `/admin/invoices/${encodeURIComponent(nextParams.invoiceId)}`
              : page === "admin-invoices-edit"
                ? `/admin/invoices/${encodeURIComponent(nextParams.invoiceId)}/edit`
                : pagePaths[page];
    if (nextPath && window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCategorySelect(categoryName) {
    trackViewCategory(categoryName);
    setActiveCategory(categoryName);
    navigate("products");
  }

  async function loadWebsiteTexts() {
    try {
      setWebsiteTexts(await fetchWebsiteTexts());
    } catch {
      setWebsiteTexts([]);
    }
  }

  function handleProductCategoryChange(categoryName) {
    trackViewCategory(categoryName);
    setActiveCategory(categoryName);
  }

  function handleViewProduct(slug) {
    setActiveProductSlug(slug);
    navigate("product");
  }

  function handleAddToCart(product, size, variant = null) {
    const visibleVariants = (product.variants || []).filter(isVariantVisible);
    const selectedVariant =
      (variant && isVariantVisible(variant) ? variant : null) ||
      visibleVariants.find((option) => option.size === size) ||
      null;
    const selectedSize =
      selectedVariant ||
      (!product.variants?.length ? product.sizes?.find((option) => option.size === size) : null);

    if (!selectedSize || (product.variants?.length && !visibleVariants.length)) {
      return;
    }

    const isTrader = currentUser?.accountType === "trader" || currentUser?.accountType === "wholesale";
    const effectivePrice = isTrader
      ? (selectedVariant?.wholesalePrice != null && Number(selectedVariant.wholesalePrice) > 0
          ? Number(selectedVariant.wholesalePrice)
          : (product.wholesalePrice != null && Number(product.wholesalePrice) > 0
              ? Number(product.wholesalePrice)
              : Number(selectedSize.price) || 0))
      : Number(selectedSize.price) || 0;

    const selectedVariantId = selectedVariant?.id || selectedSize.id || "";
    const cartId = `${product.id}-${selectedVariantId || selectedSize.size}`;

    trackAddToCart({
      contentName: getTrackingName(product.name, language, product.slug),
      contentIds: [product.id || product.slug],
      value: effectivePrice,
      quantity: 1,
      category: product.categoryId || product.categoryKey || "",
    });

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartId === cartId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          cartId,
          productId: product.id,
          slug: product.slug,
          categoryId: product.categoryId,
          productName: product.name?.en || product.slug,
          image: selectedVariant?.image || selectedVariant?.image_url || product.image,
          fallbackImage: product.fallbackImage,
          size: selectedSize.size,
          selectedSize: selectedSize.size,
          variantId: selectedVariantId,
          colorName: selectedVariant?.colorName || selectedVariant?.color_name || selectedSize.colorName || selectedSize.color_name || "",
          colorValue: selectedVariant?.colorValue || selectedVariant?.color_value || selectedSize.colorValue || selectedSize.color_value || "",
          price: effectivePrice,
          quantity: 1,
        },
      ];
    });
  }

  function handleUpdateQuantity(cartId, quantity) {
    if (quantity <= 0) {
      handleRemoveItem(cartId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function handleRemoveItem(cartId) {
    const removedItem = cartItems.find((item) => item.cartId === cartId);
    if (removedItem) {
      trackRemoveFromCart({
        contentName: removedItem.productName || removedItem.slug,
        contentIds: [getCartTrackingId(removedItem)],
        value: Number(removedItem.price || 0) * Number(removedItem.quantity || 0),
        quantity: removedItem.quantity,
        category: removedItem.categoryId || "",
      });
    }

    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartId !== cartId)
    );
  }

  const activeDemoProduct = demoProducts.find(
    (product) => product.slug === activeProductSlug
  );

  async function handleLogin(credentials) {
    try {
      const session = await loginUser(credentials.email, credentials.password);
      setUser(session.user);
      setWorkSession(session.workSession || null);
      navigate(
        session.user.role === "super_admin"
          ? "admin-platform-companies"
          : isCompanyAdminRole(session.user.role)
          ? "admin"
          : isStaffRole(session.user.role)
            ? "employee"
            : "account"
      );
    } catch (error) {
      setLoginMessage(error.message || t("auth.loginFailed"));
    }
  }

  async function handleAdminLogin(credentials) {
    try {
      const session = await loginUser(credentials.email, credentials.password);
      const role = session.user?.role;

      if (role === "super_admin") {
        setUser(session.user);
        setWorkSession(session.workSession || null);
        navigate("admin-platform-companies");
        return;
      }

      if (isCompanyAdminRole(role)) {
        setUser(session.user);
        setWorkSession(session.workSession || null);
        navigate("admin");
        return;
      }

      if (role === "manager") {
        setUser(session.user);
        setWorkSession(session.workSession || null);
        navigate("admin");
        return;
      }

      if (isStaffRole(role)) {
        setUser(session.user);
        setWorkSession(session.workSession || null);
        navigate("employee");
        return;
      }

      await logoutUser().catch(() => null);
      setUser(null);
      setWorkSession(null);
      setAdminLoginMessage(t("adminLogin.staffOnly"));
    } catch (error) {
      setAdminLoginMessage(error.message || t("auth.loginFailed"));
    }
  }

  async function handleRegister(profile) {
    try {
      const result = await registerCustomer(profile);
      setUser(result.user);
      setRegisterMessage(t("auth.registrationSuccessful"));
      navigate("account");
    } catch (error) {
      setRegisterMessage(error.message || t("auth.emailExists"));
    }
  }

  async function handleLogout() {
    try {
      const result = await logoutUser();
      setWorkSession(result?.workSession || null);
    } catch (error) {
      setCurrentUser(null);
    }
    setUser(null);
    setEmployeeSessions([]);
    navigate("home");
  }

  async function handleAdminLogout() {
    try {
      await logoutUser();
    } catch (error) {
      setCurrentUser(null);
    }
    setUser(null);
    setWorkSession(null);
    setEmployeeSessions([]);
    navigate("admin-login");
  }

  async function handleSaveProduct(product) {
    try {
      const exists = demoProducts.some((item) => item.id === product.id);
      const savedProduct = exists
        ? await updateProductApi(product)
        : await createProductApi(product);

      setDemoProducts((currentProducts) => {
        const stillExists = currentProducts.some(
          (item) => item.id === savedProduct.id
        );

        return stillExists
          ? currentProducts.map((item) =>
              item.id === savedProduct.id ? savedProduct : item
            )
          : [savedProduct, ...currentProducts];
      });
      setAdminMessage(t("admin.productSaved"));
      try {
        await refreshProducts();
      } catch (refreshError) {
        console.warn("Products refresh failed after successful save", refreshError);
      }
      return { ok: true, message: t("admin.productSaved"), product: savedProduct };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm(t("admin.deleteConfirm"))) {
      return;
    }

    try {
      await deleteProductApi(productId);
      setDemoProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );
      setAdminMessage(t("admin.productDeleted"));
      try {
        await refreshProducts();
      } catch (refreshError) {
        console.warn("Products refresh failed after successful delete", refreshError);
      }
      return { ok: true, message: t("admin.productDeleted") };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleSaveEmployee(employee) {
    try {
      const exists = employees.some((item) => item.id === employee.id);
      const savedEmployee = exists
        ? await updateEmployeeApi(employee)
        : await createEmployeeApi(employee);

      setEmployees((currentEmployees) => {
        const stillExists = currentEmployees.some(
          (item) => item.id === savedEmployee.id
        );

        return stillExists
          ? currentEmployees.map((item) =>
              item.id === savedEmployee.id ? savedEmployee : item
            )
          : [savedEmployee, ...currentEmployees];
      });
      try {
        await refreshEmployees();
      } catch (refreshError) {
        console.warn("Employees refresh failed after successful save", refreshError);
      }
      const message = exists
        ? t("admin.employeeSaved")
        : t("employee.employeeCreatedSuccessfully");
      setAdminMessage(message);
      return { ok: true, message, employee: savedEmployee };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleDeleteEmployee(employeeId) {
    if (!window.confirm(t("admin.deleteEmployeeConfirm"))) {
      return;
    }

    try {
      await deleteEmployeeApi(employeeId);
      setEmployees((currentEmployees) =>
        currentEmployees.filter((employee) => employee.id !== employeeId)
      );
      setAdminMessage(t("admin.employeeDeleted"));
      try {
        await refreshEmployees();
      } catch (refreshError) {
        console.warn("Employees refresh failed after successful delete", refreshError);
      }
      return { ok: true, message: t("admin.employeeDeleted") };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleToggleEmployeeStatus(employee) {
    try {
      const updatedEmployee = await updateEmployeeStatus(
        employee.id,
        !employee.isActive
      );
      setEmployees((currentEmployees) =>
        currentEmployees.map((item) =>
          item.id === updatedEmployee.id ? updatedEmployee : item
        )
      );
      setAdminMessage(t("admin.employeeUpdated"));
      try {
        await refreshEmployees();
      } catch (refreshError) {
        console.warn("Employees refresh failed after successful status change", refreshError);
      }
      return { ok: true, message: t("admin.employeeUpdated") };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleOrderStatusChange(orderId, status) {
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );
      setAdminMessage(t("admin.orderUpdated"));
      try {
        await refreshOrders();
      } catch (refreshError) {
        console.warn("Orders refresh failed after successful status change", refreshError);
      }
      return { ok: true, message: t("employee.statusUpdatedSuccessfully"), order: updatedOrder };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleAssignEmployee(orderId, employeeId) {
    if (!employeeId) {
      return { ok: false, message: t("admin.unassigned") };
    }

    try {
      const updatedOrder = await assignOrderEmployee(orderId, employeeId);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );
      setAdminMessage(t("admin.orderUpdated"));
      try {
        await refreshOrders();
      } catch (refreshError) {
        console.warn("Orders refresh failed after successful assign", refreshError);
      }
      return { ok: true, message: t("admin.orderUpdated"), order: updatedOrder };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm(t("admin.deleteConfirm"))) {
      return { ok: false, message: "" };
    }

    try {
      await deleteOrder(orderId);
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== orderId)
      );
      const message = t("employee.orderDeletedSuccessfully");
      setAdminMessage(message);
      try {
        await refreshOrders();
      } catch (refreshError) {
        console.warn("Orders refresh failed after successful delete", refreshError);
      }
      return { ok: true, message };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleSaveOffer(offer) {
    const savedOffer = await saveHomepageOffer(offer);
    const nextOffers = await fetchAllHomepageOffers();
    setHomepageOffers(nextOffers);
    return savedOffer;
  }

  async function handleSaveCategoryCard(card) {
    const savedCard = await saveHomepageCategoryCard(card);
    const nextCards = await fetchAllHomepageCategoryCards();
    setHomepageCategoryCards(nextCards);
    return savedCard;
  }

  async function handleDeleteOffer(offerId) {
    await deleteHomepageOffer(offerId);
    setHomepageOffers(await fetchAllHomepageOffers());
  }

  async function handleSubmitReview(review) {
    const savedReview = await submitCustomerReview(review);
    setReviews(await fetchReviews());
    return savedReview;
  }

  async function handleModerateReview(reviewId, status, isActive = true) {
    const updatedReview = await updateReviewStatus(reviewId, status, isActive);
    setReviews(await fetchAllReviews());
    return updatedReview;
  }

  async function handleDeleteReview(reviewId) {
    await deleteReviewApi(reviewId);
    setReviews(await fetchAllReviews());
  }

  async function handleSaveWebsiteMedia(item) {
    const saved = await saveWebsiteMediaApi(item);
    setWebsiteMediaHiddenKeys((current) => current.filter((key) => key !== saved.sectionKey));
    setWebsiteMedia((currentItems) => {
      const index = currentItems.findIndex(
        (entry) => entry.id === saved.id || entry.sectionKey === saved.sectionKey,
      );
      if (index === -1) {
        return [saved, ...currentItems];
      }
      return currentItems.map((entry, entryIndex) => (entryIndex === index ? saved : entry));
    });
    return saved;
  }

  async function handleDeleteWebsiteMedia(item) {
    const result = await deleteWebsiteMediaApi(item);
    const sectionKey = result?.sectionKey || item.sectionKey;
    setWebsiteMedia((currentItems) => {
      const remaining = currentItems.filter(
        (entry) => entry.id !== item.id && entry.sectionKey !== sectionKey,
      );
      return sectionKey ? [...remaining, { sectionKey, isHidden: true }] : remaining;
    });
    if (sectionKey) {
      setWebsiteMediaHiddenKeys((current) => current.includes(sectionKey) ? current : [...current, sectionKey]);
    }
  }

  async function handleCreateOrder(customerInfo) {
    let order;
    try {
      order = await createOrder({
        cartItems,
        customer: customerInfo,
        total: cartTotal,
        delivery_zone_id: customerInfo.delivery_zone_id || "",
        pointsRedeemed: customerInfo.pointsRedeemed || 0,
      });
    } catch (error) {
      setCheckoutMessage("");
      throw error;
    }

    try {
      const purchasedItems = order?.items?.length ? order.items : cartItems;
      trackPurchase({
        contentIds: purchasedItems.map(getCartTrackingId),
        value: order?.total ?? cartTotal,
        numItems: purchasedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        orderId: order?.id || order?.orderId || order?.order_id,
      });
    } catch (trackingError) {
      console.warn("Purchase tracking skipped after order creation:", trackingError);
    }

    try {
      setOrders((currentOrders) => [order, ...currentOrders]);
      setLastOrder(order);
      setCheckoutMessage(t("checkout.orderPlacedSuccessfully"));
      setCartItems([]);
      if (currentUser) {
        fetchCurrentUser()
          .then(setUser)
          .catch((refreshError) => {
            console.warn("User refresh skipped after order creation:", refreshError);
          });
      }
    } catch (postSaveError) {
      console.warn("Post-order state update error (non-fatal):", postSaveError);
    }
    return order;
  }

  async function handleCreateEmployeeOrder(orderPayload) {
    const isPortalOperator = isCompanyAdminRole(currentUser?.role) || isStaffRole(currentUser?.role);
    try {
      const order = await createOrder({
        ...orderPayload,
        createdByEmployeeId: isPortalOperator ? currentUser.id : "",
        createdByEmployeeName: isPortalOperator ? currentUser.name : "",
      });
      setOrders((currentOrders) => [order, ...currentOrders]);
      try {
        await refreshOrders();
      } catch (refreshError) {
        console.warn("Orders refresh failed after successful employee order creation", refreshError);
      }
      return { ok: true, message: t("employee.orderCreatedSuccessfully"), order };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  const isPortalLoginPage = activePage === "admin-login";
  const isAdminPanelPage = adminPageKeys.includes(activePage);
  const isAdminShellPage = isPortalLoginPage || isAdminPanelPage;

  return (
    <AdminModulesContext.Provider value={adminModulesContextValue}>
      <div className={isPortalLoginPage ? "app-shell admin-login-shell" : "app-shell"}>
      {!isAdminShellPage && (
        <Header
        activePage={activePage}
        cartCount={cartCount}
        language={language}
        products={demoProducts}
        websiteMedia={websiteMedia}
        onLanguageChange={handleLanguageChange}
        onCategorySelect={handleCategorySelect}
        onNavigate={navigate}
        currentUser={currentUser}
        workSession={workSession}
        onLogout={handleLogout}
        t={t}
        />
      )}

      <main className={isPortalLoginPage ? "admin-login-main" : isAdminPanelPage ? "admin-panel-main" : undefined}>
        {activePage === "home" && (
          <HomePage
            homeContentError={homeContentError}
            homepageCategoryCards={homepageCategoryCards}
            homepageOffers={homepageOffers}
            isLoading={productsLoading || homeContentLoading || websiteMediaLoading}
            language={language}
            onAddToCart={handleAddToCart}
            onCategorySelect={handleCategorySelect}
            onNavigate={navigate}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            productsError={productsError}
            reviews={reviews}
            t={t}
            websiteMedia={websiteMedia}
            websiteMediaError={websiteMediaError}
            websiteTexts={websiteTexts}
          />
        )}

        {activePage === "products" && (
          <ProductsPage
            activeCategory={activeCategory}
            currentUser={currentUser}
            isLoading={productsLoading || websiteMediaLoading}
            language={language}
            loadError={productsError}
            onAddToCart={handleAddToCart}
            onCategoryChange={handleProductCategoryChange}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            t={t}
            websiteMedia={websiteMedia}
            websiteMediaError={websiteMediaError}
            websiteTexts={websiteTexts}
          />
        )}

        {activePage === "product" && (
          <ProductDetailsPage
            currentUser={currentUser}
            isLoading={productsLoading}
            language={language}
            loadError={productsError}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onViewProduct={handleViewProduct}
            product={activeDemoProduct}
            products={demoProducts}
            productSchema={productSchema}
            t={t}
          />
        )}

        {activePage === "cart" && (
          <CartPage
            cartItems={cartItems}
            currentUser={currentUser}
            language={language}
            isLoading={productsLoading || websiteMediaLoading}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            t={t}
            total={cartTotal}
            websiteMedia={websiteMedia}
          />
        )}

        {activePage === "checkout" && (
          <CheckoutPage
            cartItems={cartItems}
            checkoutMessage={checkoutMessage}
            currentUser={currentUser}
            lastOrder={lastOrder}
            language={language}
            onCreateOrder={handleCreateOrder}
            onNavigate={navigate}
            products={demoProducts}
            t={t}
            total={cartTotal}
          />
        )}

        {activePage === "about" && (
          <AboutPage language={language} onNavigate={navigate} t={t} websiteMedia={websiteMedia} websiteTexts={websiteTexts} />
        )}

        {activePage === "sustainability" && (
          <SustainabilityPage language={language} onNavigate={navigate} t={t} websiteMedia={websiteMedia} websiteTexts={websiteTexts} products={demoProducts} onViewProduct={handleViewProduct} />
        )}

        {activePage === "how" && (
          <HowItWorksPage
            language={language}
            onNavigate={navigate}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            websiteMedia={websiteMedia}
            websiteTexts={websiteTexts}
          />
        )}

        {activePage === "cleanups" && (
          <CleanupsPage language={language} onNavigate={navigate} websiteMedia={websiteMedia} websiteTexts={websiteTexts} />
        )}

        {activePage === "eb-points" && (
          <EBPointsPage
            currentUser={currentUser}
            language={language}
            onNavigate={navigate}
            websiteMedia={websiteMedia}
          />
        )}

        {(activePage === "social" || activePage === "follow-us") && <FollowUsPage />}

        {activePage === "login" && (
          <LoginPage
            loginMessage={loginMessage}
            onLogin={handleLogin}
            onNavigate={navigate}
            t={t}
          />
        )}

        {activePage === "admin-login" && (
          <AdminLoginPage
            message={adminLoginMessage}
            onLogin={handleAdminLogin}
            onNavigate={navigate}
            t={t}
          />
        )}

        {activePage === "register" && (
          <RegisterPage
            message={registerMessage}
            onNavigate={navigate}
            onRegister={handleRegister}
            t={t}
          />
        )}

        {activePage === "account" && (
          <AccountPage
            currentUser={currentUser}
            language={language}
            onLogout={handleLogout}
            onNavigate={navigate}
            onSubmitReview={handleSubmitReview}
            orders={orders}
            products={demoProducts}
            t={t}
          />
        )}

        {activePage === "employee" && (
          <EmployeeDashboardPage
            currentUser={currentUser}
            language={language}
            onCreateOrder={handleCreateEmployeeOrder}
            onDeleteOrder={handleDeleteOrder}
            onDeleteProduct={handleDeleteProduct}
            onSaveCategoryCard={handleSaveCategoryCard}
            onNavigate={navigate}
            onSaveProduct={handleSaveProduct}
            onSaveOffer={handleSaveOffer}
            onDeleteOffer={handleDeleteOffer}
            onModerateReview={handleModerateReview}
            onDeleteReview={handleDeleteReview}
            onStatusChange={handleOrderStatusChange}
            orders={orders}
            products={demoProducts}
            t={t}
            workSession={workSession}
            websiteMedia={websiteMedia}
            websiteMediaHiddenKeys={websiteMediaHiddenKeys}
            onSaveWebsiteMedia={handleSaveWebsiteMedia}
            onDeleteWebsiteMedia={handleDeleteWebsiteMedia}
            websiteTexts={websiteTexts}
            onTextsChanged={setWebsiteTexts}
          />
        )}

        {adminPageKeys.includes(activePage) && ![...platformAdminPageKeys, ...customAdminPageKeys, "admin-staff", "admin-staff-new", "admin-employees", "admin-invoices", "admin-invoices-new", "admin-invoices-view", "admin-invoices-edit", "admin-delivery", "admin-activity-log", "admin-reports"].includes(activePage) && (
          <AdminDashboardPage
            activePage={activePage}
            currentUser={currentUser}
            employees={employees}
            language={language}
            onDeleteEmployee={handleDeleteEmployee}
            onDeleteProduct={handleDeleteProduct}
            onAssignEmployee={handleAssignEmployee}
            onDeleteOrder={handleDeleteOrder}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onSaveOffer={handleSaveOffer}
            onDeleteOffer={handleDeleteOffer}
            onModerateReview={handleModerateReview}
            onDeleteReview={handleDeleteReview}
            onSaveEmployee={handleSaveEmployee}
            onSaveProduct={handleSaveProduct}
            onStatusChange={handleOrderStatusChange}
            orders={orders}
            products={demoProducts}
            productSchema={productSchema}
            homepageOffers={homepageOffers}
            homepageCategoryCards={homepageCategoryCards}
            isDarkMode={isAdminDarkMode}
            reviews={reviews}
            onLanguageChange={handleLanguageChange}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
            onSaveCategoryCard={handleSaveCategoryCard}
            statusMessage={adminMessage}
            t={t}
            websiteMedia={websiteMedia}
            websiteMediaHiddenKeys={websiteMediaHiddenKeys}
            onSaveWebsiteMedia={handleSaveWebsiteMedia}
            onDeleteWebsiteMedia={handleDeleteWebsiteMedia}
          />
        )}

        {activePage === "admin-product-settings" && (
          <AdminProductSettingsPage
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onSchemaChanged={setProductSchema}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
            productSchema={productSchema}
          />
        )}

        {activePage === "admin-website-texts" && (
          <AdminWebsiteTextsPage
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onTextsChanged={setWebsiteTexts}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {["admin-custom-modules", "admin-custom-modules-new", "admin-custom-modules-edit"].includes(activePage) && (
          <AdminCustomModulesPage
            activePage={activePage}
            currentUser={currentUser}
            customModules={customModules}
            customModulesLoaded={customModulesLoaded}
            editingModuleId={routeParams.moduleId}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onModulesChanged={() => loadCustomModules(currentUser)}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {["admin-custom-entry-list", "admin-custom-entry-new", "admin-custom-entry-edit"].includes(activePage) && (
          <AdminCustomModuleEntriesPage
            activePage={activePage}
            currentUser={currentUser}
            customModuleKey={routeParams.customModuleKey}
            customModules={customModules}
            customModulesLoaded={customModulesLoaded}
            editingEntryId={routeParams.entryId}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {activePage === "admin-platform-companies" && (
          <AdminCompaniesPage
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {activePage === "admin-platform-users" && (
          <AdminPlatformUsersPage
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {activePage === "admin-platform-memberships" && (
          <AdminPlatformMembershipsPage
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {activePage === "admin-invoices" && (
          <AdminInvoicesPage
            activePage={activePage}
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {["admin-invoices-new", "admin-invoices-edit"].includes(activePage) && (
          <AdminInvoiceFormPage
            activePage={activePage}
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
            routeParams={routeParams}
          />
        )}

        {activePage === "admin-invoices-view" && (
          <AdminInvoiceViewPage
            activePage={activePage}
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
            routeParams={routeParams}
          />
        )}

        {activePage === "admin-delivery" && (
          <AdminDeliveryZonesPage
            activePage={activePage}
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {activePage === "admin-activity-log" && (
          <AdminActivityLogPage
            activePage={activePage}
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {activePage === "admin-reports" && (
          <AdminReportsPage
            activePage={activePage}
            currentUser={currentUser}
            isDarkMode={isAdminDarkMode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
          />
        )}

        {["admin-staff", "admin-staff-new", "admin-employees"].includes(activePage) && (
          <AdminEmployeesPage
            activePage={activePage}
            currentUser={currentUser}
            employees={employees}
            language={language}
            isDarkMode={isAdminDarkMode}
            onLanguageChange={handleLanguageChange}
            onDeleteEmployee={handleDeleteEmployee}
            onLogout={handleAdminLogout}
            onNavigate={navigate}
            onSaveEmployee={handleSaveEmployee}
            onToggleDarkMode={() => setIsAdminDarkMode((current) => !current)}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
            sessions={employeeSessions}
            statusMessage={adminMessage}
            t={t}
          />
        )}
      </main>

        {!isAdminShellPage && <Footer language={language} onNavigate={navigate} t={t} />}
      </div>
    </AdminModulesContext.Provider>
  );
}

export default App;
