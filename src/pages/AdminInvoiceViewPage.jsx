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

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-CA");
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
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
  const sc = statusColors[invoice.status] || statusColors.draft;

  return (
    <AdminLayout {...layoutProps} title={`Invoice ${invoice.invoice_number}`} subtitle="Invoice details and print view">
      <PrintStyles />

      <div className="invoice-no-print invoice-view-toolbar">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}
        <div className="toolbar-actions">
          <button className="primary-action" onClick={handlePrint} type="button">Print</button>
          {invoice.status !== "void" && invoice.status !== "cancelled" && (
            <button className="secondary-action" onClick={() => onNavigate("admin-invoices-edit", { invoiceId: invoice.id })} type="button">Edit</button>
          )}
          <button className="secondary-action" onClick={() => onNavigate("admin-invoices")} type="button">Back to Invoices</button>
        </div>
      </div>

      <div className="invoice-print-area admin-panel-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="invoice-header">
          <div>
            <h2 className="invoice-company-name">{currentUser?.name || "Company"}</h2>
            <p className="invoice-doc-label">Invoice</p>
          </div>
          <div className="invoice-header-right">
            <h1 className="invoice-number">{invoice.invoice_number}</h1>
            <span className="admin-tag" style={{ backgroundColor: sc.bg, color: sc.text }}>
              {statusLabels[invoice.status] || invoice.status}
            </span>
          </div>
        </div>

        <div className="invoice-bill-area">
          <div>
            <strong>Bill To</strong>
            <p className="invoice-customer-name">{invoice.customer_name}</p>
            {invoice.customer_email && <p className="invoice-muted">{invoice.customer_email}</p>}
            {invoice.customer_phone && <p className="invoice-muted">{invoice.customer_phone}</p>}
          </div>
          <div className="invoice-dates">
            <p><strong>Issue Date:</strong> {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>}
          </div>
        </div>

        <table className="invoice-line-table">
          <thead>
            <tr>
              <th className="text-left">Description</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{currencySymbols[invoice.currency] || invoice.currency}{Number(item.unit_price || 0).toFixed(2)}</td>
                <td className="text-right">{currencySymbols[invoice.currency] || invoice.currency}{Number(item.total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="summary-row"><span>Subtotal</span><span>{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.subtotal || subtotal).toFixed(2)}</span></div>
          {Number(invoice.discount_total) > 0 && <div className="summary-row"><span>Discount</span><span>-{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.discount_total).toFixed(2)}</span></div>}
          {Number(invoice.tax_total) > 0 && <div className="summary-row"><span>Tax</span><span>{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.tax_total).toFixed(2)}</span></div>}
          <div className="summary-row summary-total"><span>Total</span><span>{currencySymbols[invoice.currency] || invoice.currency}{Number(invoice.total).toFixed(2)}</span></div>
        </div>

        {invoice.notes && (
          <div className="invoice-notes">
            <strong>Notes:</strong>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="invoice-footer">
          Thank you for your business
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminInvoiceViewPage;
