import React from "react";
import AdminOrdersTable from "../components/AdminOrdersTable.jsx";
import AdminProductForm from "../components/AdminProductForm.jsx";
import AdminProductTable from "../components/AdminProductTable.jsx";

function AdminDashboardPage({
  currentUser,
  employees,
  language,
  onDeleteProduct,
  onAssignEmployee,
  onDeleteOrder,
  onNavigate,
  onSaveProduct,
  onStatusChange,
  orders,
  products,
  statusMessage,
  t,
}) {
  const [editingProduct, setEditingProduct] = React.useState(null);

  if (currentUser?.role !== "admin") {
    return (
      <section className="page-shell">
        <div className="empty-panel">
          <h1>{t("admin.accessDenied")}</h1>
          <p>{t("admin.adminOnly")}</p>
          <button className="primary-action" onClick={() => onNavigate("login")}>
            {t("auth.login")}
          </button>
        </div>
      </section>
    );
  }

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  );

  async function handleSave(product) {
    const result = await onSaveProduct(product);

    if (result?.ok) {
      setEditingProduct(null);
    }

    return result;
  }

  return (
    <section className="page-shell admin-page">
      <div className="page-heading">
        <p className="eyebrow">{t("admin.dashboard")}</p>
        <h1>{t("admin.dashboard")}</h1>
        <p>{t("auth.demoAuthNote")}</p>
      </div>

      {statusMessage && <div className="message-panel success">{statusMessage}</div>}

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <span>{t("admin.totalProducts")}</span>
          <strong>{products.length}</strong>
        </article>
        <article className="dashboard-card">
          <span>{t("admin.totalOrders")}</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="dashboard-card">
          <span>{t("admin.pendingOrders")}</span>
          <strong>{pendingOrders.length}</strong>
        </article>
        <article className="dashboard-card">
          <span>{t("admin.demoRevenue")}</span>
          <strong>{revenue} {t("common.ils")}</strong>
        </article>
        <article className="dashboard-card">
          <span>{t("admin.totalEmployees")}</span>
          <strong>{employees.length}</strong>
        </article>
        <article className="dashboard-card">
          <span>{t("admin.activeEmployees")}</span>
          <strong>{activeEmployees.length}</strong>
        </article>
      </div>

      <section className="admin-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">{t("admin.productsManagement")}</p>
            <h2>{t("admin.productsManagement")}</h2>
          </div>
        </div>
        <AdminProductForm
          editingProduct={editingProduct}
          language={language}
          onCancel={() => setEditingProduct(null)}
          onSave={handleSave}
          t={t}
        />
        <AdminProductTable
          language={language}
          onDelete={onDeleteProduct}
          onEdit={setEditingProduct}
          products={products}
          t={t}
        />
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <p className="eyebrow">{t("admin.ordersManagement")}</p>
          <h2>{t("admin.ordersManagement")}</h2>
        </div>
        <AdminOrdersTable
          employees={employees}
          canDelete
          language={language}
          onAssignEmployee={onAssignEmployee}
          onDeleteOrder={onDeleteOrder}
          onStatusChange={onStatusChange}
          orders={orders}
          products={products}
          t={t}
        />
      </section>
    </section>
  );
}

export default AdminDashboardPage;
