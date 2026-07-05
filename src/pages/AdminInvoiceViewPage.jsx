import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { fetchInvoice } from "../utils/invoicesApi.js";

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

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-CA");
}

function localize(value, language) {
  return value?.[language] || value?.en || "";
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        .admin-layout, .admin-layout * { visibility: hidden; }
        .invoice-print-area, .invoice-print-area * { visibility: visible; }
        .invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        .invoice-no-print { display: none !important; }
        @page { margin: 20mm; }
      }
    `}</style>
  );
}

function AdminInvoiceViewPage({
  activePage,
  currentUser,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  onToggleDarkMode,
  routeParams,
}) {
  const invoiceId = routeParams?.invoiceId;
  const [invoice, setInvoice] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    if (!invoiceId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const inv = await fetchInvoice(invoiceId);
        if (!cancelled) setInvoice(inv);
      } catch (error) {
        if (!cancelled) setMessage({ type: "error", text: error.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [invoiceId]);

  function handlePrint() {
    window.print();
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };

  if (loading) {
    return (
      <AdminLayout {...layoutProps} title="Invoice" subtitle="Loading invoice details...">
        <div className="admin-empty-state">Loading...</div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout {...layoutProps} title="Invoice" subtitle="Invoice not found">
        <div className="admin-empty-state">{message?.text || "Invoice not found."}</div>
      </AdminLayout>
    );
  }

  const lineItems = invoice.line_items || [];
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <AdminLayout {...layoutProps} title={`Invoice ${invoice.invoice_number}`} subtitle="Invoice details and print view">
      <PrintStyles />

      <div className="invoice-no-print" style={{ marginBottom: "16px" }}>
        {message && (
          <div className={`admin-message admin-message-${message.type}`}>
            {message.text}
            <button type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="admin-button admin-button-primary"
            onClick={handlePrint}
            type="button"
          >
            Print
          </button>
          {invoice.status !== "void" && invoice.status !== "cancelled" && (
            <button
              className="admin-button"
              onClick={() => onNavigate("admin-invoices-edit", { invoiceId: invoice.id })}
              type="button"
            >
              Edit
            </button>
          )}
          <button
            className="admin-button"
            onClick={() => onNavigate("admin-invoices")}
            type="button"
          >
            Back to Invoices
          </button>
        </div>
      </div>

      <div className="invoice-print-area" style={{
        background: "#fff",
        color: "#111",
        padding: "32px",
        borderRadius: "8px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{currentUser?.name || "Company"}</h2>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Invoice</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>{invoice.invoice_number}</h1>
            <span
              className="admin-status-badge"
              style={{
                display: "inline-block",
                marginTop: "4px",
                backgroundColor: (statusColors[invoice.status] || "#6b7280") + "20",
                color: statusColors[invoice.status] || "#6b7280",
                border: `1px solid ${(statusColors[invoice.status] || "#6b7280") + "40"}`,
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {statusLabels[invoice.status] || invoice.status}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "14px" }}>
          <div>
            <strong>Bill To</strong>
            <p style={{ margin: "4px 0" }}>{invoice.customer_name}</p>
            {invoice.customer_email && <p style={{ margin: "2px 0", color: "#6b7280" }}>{invoice.customer_email}</p>}
            {invoice.customer_phone && <p style={{ margin: "2px 0", color: "#6b7280" }}>{invoice.customer_phone}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px" }}><strong>Issue Date:</strong> {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && <p style={{ margin: "0" }}><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "8px 4px" }}>Description</th>
              <th style={{ textAlign: "center", padding: "8px 4px" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "8px 4px" }}>Unit Price</th>
              <th style={{ textAlign: "right", padding: "8px 4px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "8px 4px" }}>{item.description}</td>
                <td style={{ textAlign: "center", padding: "8px 4px" }}>{item.quantity}</td>
                <td style={{ textAlign: "right", padding: "8px 4px" }}>
                  {currencySymbols[invoice.currency] || invoice.currency}{Number(item.unit_price || 0).toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "8px 4px" }}>
                  {currencySymbols[invoice.currency] || invoice.currency}{Number(item.total || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{
          marginLeft: "auto",
          width: "300px",
          fontSize: "14px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span>Subtotal</span>
            <span>{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.subtotal || subtotal).toFixed(2)}</span>
          </div>
          {Number(invoice.discount_total) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Discount</span>
              <span>-{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.discount_total).toFixed(2)}</span>
            </div>
          )}
          {Number(invoice.tax_total) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Tax</span>
              <span>{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.tax_total).toFixed(2)}</span>
            </div>
          )}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderTop: "2px solid #111",
            fontWeight: 700,
            fontSize: "16px",
          }}>
            <span>Total</span>
            <span>{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.total).toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: "24px", padding: "12px", background: "#f9fafb", borderRadius: "4px", fontSize: "13px" }}>
            <strong>Notes:</strong>
            <p style={{ margin: "4px 0 0", color: "#4b5563" }}>{invoice.notes}</p>
          </div>
        )}

        <div style={{
          marginTop: "32px",
          textAlign: "center",
          fontSize: "11px",
          color: "#9ca3af",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
        }}>
          Thank you for your business
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminInvoiceViewPage;
