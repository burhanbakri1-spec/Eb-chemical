import React from "react";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminEmployeesPage from "./pages/AdminEmployeesPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SocialPage from "./pages/SocialPage.jsx";
import { products as initialProducts } from "./data/products.js";
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
import "./styles/global.css";

const cartStorageKey = "epChemicalCart";
const languageStorageKey = "epChemicalLanguage";

function getStoredCart() {
  try {
    const storedCart = localStorage.getItem(cartStorageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    return [];
  }
}

function App() {
  const [activePage, setActivePage] = React.useState("home");
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [activeProductSlug, setActiveProductSlug] = React.useState("");
  const [cartItems, setCartItems] = React.useState(getStoredCart);
  const [demoProducts, setDemoProducts] = React.useState(initialProducts);
  const [employees, setEmployees] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [workSession, setWorkSession] = React.useState(null);
  const [employeeSessions, setEmployeeSessions] = React.useState([]);
  const [currentUser, setUser] = React.useState(getCurrentUser);
  const [loginMessage, setLoginMessage] = React.useState("");
  const [registerMessage, setRegisterMessage] = React.useState("");
  const [adminMessage, setAdminMessage] = React.useState("");
  const [checkoutMessage, setCheckoutMessage] = React.useState("");
  const [lastOrder, setLastOrder] = React.useState(null);
  const [language, setLanguage] = React.useState(
    () => localStorage.getItem(languageStorageKey) || "en"
  );
  const t = React.useMemo(() => createTranslator(language), [language]);

  React.useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  React.useEffect(() => {
    loadProducts();
    hydrateUser();
  }, []);

  React.useEffect(() => {
    loadOrders(currentUser);
    loadEmployees(currentUser);
    loadWorkSession(currentUser);
  }, [currentUser]);

  React.useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function loadProducts() {
    try {
      setDemoProducts(await fetchProducts());
    } catch (error) {
      setAdminMessage(error.message);
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
    if (user?.role !== "admin") {
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
      if (user.role === "employee") {
        setWorkSession(await fetchMyTodayWorkSession());
      }

      if (user.role === "admin") {
        setEmployeeSessions(await fetchEmployeeWorkSessions());
      }
    } catch (error) {
      if (user.role === "employee") {
        setWorkSession(null);
      }
      if (user.role === "admin") {
        setEmployeeSessions([]);
      }
    }
  }

  function navigate(page, options = {}) {
    setLoginMessage("");
    setRegisterMessage("");
    setAdminMessage("");
    setCheckoutMessage("");
    if (options.slug) {
      setActiveProductSlug(options.slug);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCategorySelect(categoryName) {
    setActiveCategory(categoryName);
    navigate("products");
  }

  function handleViewProduct(slug) {
    setActiveProductSlug(slug);
    navigate("product");
  }

  function handleAddToCart(product, size) {
    if (!currentUser) {
      setLoginMessage(t("auth.loginRequiredToBuy"));
      navigate("login");
      return;
    }

    const selectedSize = product.sizes.find((option) => option.size === size);

    if (!selectedSize) {
      return;
    }

    const cartId = `${product.id}-${selectedSize.size}`;

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
          image: product.image,
          fallbackImage: product.fallbackImage,
          size: selectedSize.size,
          price: selectedSize.price,
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
        session.user.role === "admin"
          ? "admin"
          : session.user.role === "employee"
            ? "employee"
            : "account"
      );
    } catch (error) {
      setLoginMessage(error.message || t("auth.loginFailed"));
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
      await refreshProducts();
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
      await refreshProducts();
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
      await refreshEmployees();
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
      await refreshEmployees();
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
      await refreshEmployees();
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
      await refreshOrders();
      return { ok: true, message: t("employee.statusUpdatedSuccessfully"), order: updatedOrder };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleAssignEmployee(orderId, employeeId) {
    if (!employeeId) {
      return;
    }

    try {
      const updatedOrder = await assignOrderEmployee(orderId, employeeId);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );
      setAdminMessage(t("admin.orderUpdated"));
      await refreshOrders();
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
      await refreshOrders();
      const message = t("employee.orderDeletedSuccessfully");
      setAdminMessage(message);
      return { ok: true, message };
    } catch (error) {
      setAdminMessage(error.message);
      return { ok: false, message: error.message };
    }
  }

  async function handleCreateOrder(customerInfo) {
    try {
      const order = await createOrder({
        cartItems,
        customer: customerInfo,
        total: cartTotal,
      });

      setOrders((currentOrders) => [order, ...currentOrders]);
      setLastOrder(order);
      setCheckoutMessage(t("checkout.orderPlacedSuccessfully"));
      setCartItems([]);
      return order;
    } catch (error) {
      setCheckoutMessage("");
      throw error;
    }
  }

  async function handleCreateEmployeeOrder(orderPayload) {
    try {
      const order = await createOrder(orderPayload);
      setOrders((currentOrders) => [order, ...currentOrders]);
      await refreshOrders();
      return { ok: true, message: t("employee.orderCreatedSuccessfully"), order };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  return (
    <div className="app-shell">
      <Header
        activePage={activePage}
        cartCount={cartCount}
        language={language}
        products={demoProducts}
        onLanguageChange={() =>
          setLanguage((currentLanguage) =>
            currentLanguage === "en" ? "ar" : "en"
          )
        }
        onCategorySelect={handleCategorySelect}
        onNavigate={navigate}
        currentUser={currentUser}
        workSession={workSession}
        onLogout={handleLogout}
        t={t}
      />

      <main>
        {activePage === "home" && (
          <HomePage
            language={language}
            onAddToCart={handleAddToCart}
            onCategorySelect={handleCategorySelect}
            onNavigate={navigate}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            t={t}
          />
        )}

        {activePage === "products" && (
          <ProductsPage
            activeCategory={activeCategory}
            language={language}
            onAddToCart={handleAddToCart}
            onCategoryChange={setActiveCategory}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            t={t}
          />
        )}

        {activePage === "product" && (
          <ProductDetailsPage
            language={language}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onViewProduct={handleViewProduct}
            product={activeDemoProduct}
            products={demoProducts}
            t={t}
          />
        )}

        {activePage === "cart" && (
          <CartPage
            cartItems={cartItems}
            currentUser={currentUser}
            language={language}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onViewProduct={handleViewProduct}
            products={demoProducts}
            t={t}
            total={cartTotal}
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

        {activePage === "about" && <AboutPage t={t} />}

        {activePage === "social" && <SocialPage t={t} />}

        {activePage === "login" && (
          <LoginPage
            loginMessage={loginMessage}
            onLogin={handleLogin}
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
            onNavigate={navigate}
            onSaveProduct={handleSaveProduct}
            onStatusChange={handleOrderStatusChange}
            orders={orders}
            products={demoProducts}
            t={t}
            workSession={workSession}
          />
        )}

        {activePage === "admin" && (
          <AdminDashboardPage
            currentUser={currentUser}
            employees={employees}
            language={language}
            onDeleteEmployee={handleDeleteEmployee}
            onDeleteProduct={handleDeleteProduct}
            onAssignEmployee={handleAssignEmployee}
            onDeleteOrder={handleDeleteOrder}
            onNavigate={navigate}
            onSaveEmployee={handleSaveEmployee}
            onSaveProduct={handleSaveProduct}
            onStatusChange={handleOrderStatusChange}
            orders={orders}
            products={demoProducts}
            statusMessage={adminMessage}
            t={t}
          />
        )}

        {activePage === "admin-employees" && (
          <AdminEmployeesPage
            currentUser={currentUser}
            employees={employees}
            onDeleteEmployee={handleDeleteEmployee}
            onNavigate={navigate}
            onSaveEmployee={handleSaveEmployee}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
            sessions={employeeSessions}
            statusMessage={adminMessage}
            t={t}
          />
        )}
      </main>

      <Footer onNavigate={navigate} t={t} />
    </div>
  );
}

export default App;
