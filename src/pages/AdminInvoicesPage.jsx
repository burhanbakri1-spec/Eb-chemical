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
  draft: { bg: "#eef1f4", text: "#5f6b77" },
  issued: { bg: "#e8f7fb", text: "#0b2e4e" },
  paid: { bg: "#effaf2", text: "#21633b" },
  cancelled: { bg: "#ffe8e8", text: "#a52222" },
  void: { bg: "#eef1f4", text: "#5f6b77" },
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

  function statusStyle(status) {
    const c = statusColors[status] || statusColors.draft;
    return { backgroundColor: c.bg, color: c.text };
  }

  return (
    <AdminLayout {...layoutProps} title="Invoices" subtitle="Manage company invoices">
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head">
          <div>
            <h2>All Invoices</h2>
          </div>
          <button
            className="admin-primary-button"
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
            <strong>No invoices yet</strong>
            <p>Create your first invoice to get started.</p>
            <button className="admin-primary-button" onClick={() => onNavigate("admin-invoices-new")} type="button">
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
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
                      <span className="admin-tag" style={statusStyle(inv.status)}>
                        {statusLabels[inv.status] || inv.status}
                      </span>
                    </td>
                    <td>{formatDate(inv.issue_date)}</td>
                    <td>{currencySymbol(inv.currency)}{Number(inv.total).toFixed(2)}</td>
                    <td>
                      <div className="action-group">
                        <button
                          className="secondary-action"
                          onClick={() => onNavigate("admin-invoices-view", { invoiceId: inv.id })}
                          type="button"
                        >
                          View
                        </button>
                        <button
                          className="secondary-action"
                          onClick={() => onNavigate("admin-invoices-edit", { invoiceId: inv.id })}
                          type="button"
                          disabled={inv.status === "void" || inv.status === "cancelled"}
                        >
                          Edit
                        </button>
                        {inv.status !== "void" && inv.status !== "cancelled" && (
                          <button
                            className="secondary-action"
                            onClick={() => handleVoid(inv.id)}
                            type="button"
                            style={{ color: "#a52222" }}
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
