import React from "react";
import StatusBadge from "./StatusBadge.jsx";

const statuses = ["Pending", "Processing", "Completed", "Cancelled"];

function AdminOrdersTable({
  canAssign = true,
  canDelete = false,
  canUpdateStatus = true,
  employees = [],
  language,
  onAssignEmployee,
  onDeleteOrder,
  onStatusChange,
  orders,
  products,
  t,
}) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  if (safeOrders.length === 0) {
    return <div className="empty-panel compact-empty">{t("admin.noOrders")}</div>;
  }

  function getItemSummary(order) {
    return (Array.isArray(order.items) ? order.items : [])
      .map((item) => {
        const product = safeProducts.find((entry) => entry.id === item.productId);
        const productName = product?.name?.[language] || product?.name?.en || item.productName || item.slug || item.productId || "-";
        return `${productName} ${item.size || item.selectedSize || ""} x${item.quantity || 1}`.trim();
      })
      .join(", ");
  }

  return (
    <div className="admin-table-wrap admin-orders-table-wrap">
      <table className="admin-table admin-orders-table">
        <thead>
          <tr>
            <th>{t("admin.orderId")}</th>
            <th>{t("checkout.name")}</th>
            <th>{t("checkout.phone")}</th>
            <th>{t("checkout.city")}</th>
            <th>{t("common.total")}</th>
            <th>{localized("EB Points", "نقاط EB", "נקודות EB")}</th>
            <th>{t("admin.orderStatus")}</th>
            <th>{t("admin.createdBy")}</th>
            {canAssign && <th>{t("admin.assignedEmployee")}</th>}
            <th>{t("admin.lastUpdatedBy")}</th>
            <th>{t("admin.date")}</th>
            <th>{t("admin.items")}</th>
            {canDelete && <th>{t("admin.actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {safeOrders.map((order) => (
            <tr key={order.id}>
              <td className="order-id-cell">{order.id}</td>
              <td className="order-customer-cell">{order.customer?.name || "-"}</td>
              <td>{order.customer?.phone || "-"}</td>
              <td>{order.customer?.city || "-"}</td>
              <td className="order-total-cell">{Number(order.total || 0).toFixed(2)} {t("common.ils")}</td>
              <td>
                +{Math.max(0, Number(order.pointsEarned || 0))}
                {Number(order.pointsRedeemed || 0) > 0 && (
                  <span className="table-muted">-{Number(order.pointsRedeemed)} / {Number(order.discountFromPoints || 0).toFixed(2)} {t("common.ils")}</span>
                )}
              </td>
              <td>
                <StatusBadge status={order.status} t={t} />
                {canUpdateStatus && (
                  <select
                    className="status-inline-select"
                    onChange={(event) => onStatusChange(order.id, event.target.value)}
                    value={order.status}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`status.${status}`)}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className="order-user-cell">
                {order.createdByEmployeeName || order.createdBy?.name || order.createdBy?.role || "-"}
                {order.createdBy?.role && (
                  <span className="table-muted">{order.createdBy.role}</span>
                )}
              </td>
              {canAssign && (
                <td>
                  <select
                    className="status-inline-select"
                    onChange={(event) => onAssignEmployee(order.id, event.target.value)}
                    value={order.handledByEmployeeId || ""}
                  >
                    <option value="">{t("admin.unassigned")}</option>
                    {employees
                      .filter((employee) => employee.isActive)
                      .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                  </select>
                </td>
              )}
              <td className="order-user-cell">{order.lastUpdatedBy?.name || "-"}</td>
              <td className="order-date-cell">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
              <td className="order-items-cell">{getItemSummary(order) || "-"}</td>
              {canDelete && (
                <td>
                  <button
                    className="text-action danger"
                    onClick={() => onDeleteOrder(order.id)}
                  >
                    {t("admin.delete")}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrdersTable;
