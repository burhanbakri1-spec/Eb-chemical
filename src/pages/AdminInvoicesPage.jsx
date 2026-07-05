import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { fetchInvoices, voidInvoice } from "../utils/invoicesApi.js";

const statusLabels = {
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  cancelled: "Cancelled",
  void: "Void",
};

const statusColors = {
  draft: "#6b7280",
  issued: "#2563eb",
  paid: "#16a34a",
  cancelled: "#dc2626",
  void: "#6b7280",
};

const currencySymbols = {
  ILS: "\u20AA",
  USD: "$",
  EUR: "\u20AC",
};

function currencySymbol(code) {
  return currencySymbols[code] || code;
}

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-CA");
}

function localize(value, language) {
  return value?.[language] || value?.en || "";
}

function AdminInvoicesPage({
  activePage,
  currentUser,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  onToggleDarkMode,
}) {
  const [invoices, setInvoices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const result = await fetchInvoices();
      setInvoices(result);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function handleVoid(invoiceId) {
    if (!window.confirm("Void this invoice?")) return;
    try {
      await voidInvoice(invoiceId);
      setMessage({ type: "success", text: "Invoice voided." });
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };

  return (
    <AdminLayout {...layoutProps} title="Invoices" subtitle="Manage company invoices">
      <div className="admin-invoices-page">
        {message && (
          <div className={`admin-message admin-message-${message.type}`}>
            {message.text}
            <button type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-header">
          <button
            className="admin-button admin-button-primary"
            onClick={() => onNavigate("admin-invoices-new")}
            type="button"
          >
            + New Invoice
          </button>
        </div>

        {loading ? (
          <div className="admin-empty-state">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="admin-empty-state">
            <p>No invoices yet.</p>
            <button className="admin-button admin-button-primary" onClick={() => onNavigate("admin-invoices-new")} type="button">
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Issue Date</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong>{inv.invoice_number}</strong></td>
                    <td>{inv.customer_name}</td>
                    <td>
                      <span
                        className="admin-status-badge"
                        style={{
                          backgroundColor: (statusColors[inv.status] || "#6b7280") + "20",
                          color: statusColors[inv.status] || "#6b7280",
                          border: `1px solid ${(statusColors[inv.status] || "#6b7280") + "40"}`,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {statusLabels[inv.status] || inv.status}
                      </span>
                    </td>
                    <td>{formatDate(inv.issue_date)}</td>
                    <td>{currencySymbol(inv.currency)}{Number(inv.total).toFixed(2)}</td>
                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-button admin-button-small"
                          onClick={() => onNavigate("admin-invoices-view", { invoiceId: inv.id })}
                          type="button"
                        >
                          View
                        </button>
                        <button
                          className="admin-button admin-button-small"
                          onClick={() => onNavigate("admin-invoices-edit", { invoiceId: inv.id })}
                          type="button"
                          disabled={inv.status === "void" || inv.status === "cancelled"}
                        >
                          Edit
                        </button>
                        {inv.status !== "void" && inv.status !== "cancelled" && (
                          <button
                            className="admin-button admin-button-small admin-button-danger"
                            onClick={() => handleVoid(inv.id)}
                            type="button"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminInvoicesPage;
