import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { fetchInvoice } from "../utils/invoicesApi.js";

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
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-CA");
}

function formatMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
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
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  function loc(value) {
    if (!value || typeof value === "string") return value || "";
    return value[language] || value.ar || value.en || "";
  }

  const statusLabels = {
    draft: loc({ en: "Draft", ar: "مسودة", he: "טיוטה" }),
    issued: loc({ en: "Issued", ar: "صادر", he: "הונפק" }),
    paid: loc({ en: "Paid", ar: "مدفوع", he: "שולם" }),
    cancelled: loc({ en: "Cancelled", ar: "ملغي", he: "בוטל" }),
    void: loc({ en: "Void", ar: "ملغى", he: "מבוטל" }),
  };

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
      <AdminLayout {...layoutProps} title={loc({ en: "Invoice", ar: "فاتورة", he: "חשבונית" })} subtitle={localized("Loading invoice details...", "جار تحميل تفاصيل الفاتورة...", "טוען פרטי חשבונית...")}>
        <div className="admin-empty-state">{localized("Loading...", "جار التحميل...", "טוען...")}</div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout {...layoutProps} title={loc({ en: "Invoice", ar: "فاتورة", he: "חשבונית" })} subtitle={localized("Invoice not found", "الفاتورة غير موجودة", "החשבונית לא נמצאה")}>
        <div className="admin-empty-state">{message?.text || localized("Invoice not found.", "الفاتورة غير موجودة.", "החשבונית לא נמצאה.")}</div>
      </AdminLayout>
    );
  }

  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item?.total || 0), 0);
  const sc = statusColors[invoice.status] || statusColors.draft;

  return (
    <AdminLayout {...layoutProps} title={`${loc({ en: "Invoice", ar: "فاتورة", he: "חשבונית" })} ${invoice.invoice_number}`} subtitle={localized("Invoice details and print view", "تفاصيل الفاتورة وعرض الطباعة", "פרטי חשבונית ותצוגת הדפסה")}>
      <PrintStyles />

      <div className="invoice-no-print invoice-view-toolbar">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}
        <div className="toolbar-actions">
          <button className="primary-action" onClick={handlePrint} type="button">{localized("Print", "طباعة", "הדפס")}</button>
          {invoice.status !== "void" && invoice.status !== "cancelled" && (
            <button className="secondary-action" onClick={() => onNavigate("admin-invoices-edit", { invoiceId: invoice.id })} type="button">{localized("Edit", "تعديل", "ערוך")}</button>
          )}
          <button className="secondary-action" onClick={() => onNavigate("admin-invoices")} type="button">{localized("Back to Invoices", "العودة إلى الفواتير", "חזור לחשבוניות")}</button>
        </div>
      </div>

      <div className="invoice-print-area admin-panel-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="invoice-header">
          <div>
            <h2 className="invoice-company-name">{currentUser?.name || "Company"}</h2>
            <p className="invoice-doc-label">{localized("Invoice", "فاتورة", "חשבונית")}</p>
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
            <strong>{localized("Bill To", "الفاتورة إلى", "חייב ל")}</strong>
            <p className="invoice-customer-name">{invoice.customer_name}</p>
            {invoice.customer_email && <p className="invoice-muted">{invoice.customer_email}</p>}
            {invoice.customer_phone && <p className="invoice-muted">{invoice.customer_phone}</p>}
          </div>
          <div className="invoice-dates">
            <p><strong>{localized("Issue Date:", "تاريخ الإصدار:", "תאריך הנפקה:")}</strong> {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && <p><strong>{localized("Due Date:", "تاريخ الاستحقاق:", "תאריך יעד:")}</strong> {formatDate(invoice.due_date)}</p>}
          </div>
        </div>

        <table className="invoice-line-table">
          <thead>
            <tr>
              <th className="text-left">{localized("Description", "الوصف", "תיאור")}</th>
              <th className="text-center">{localized("Qty", "الكمية", "כמות")}</th>
              <th className="text-right">{localized("Unit Price", "سعر الوحدة", "מחיר יחידה")}</th>
              <th className="text-right">{localized("Total", "الإجمالي", "סה\"כ")}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td>{item?.description || "\u2014"}</td>
                <td className="text-center">{Number(item?.quantity || 0)}</td>
                <td className="text-right">{currencySymbols[invoice.currency] || invoice.currency}{formatMoney(item?.unit_price)}</td>
                <td className="text-right">{currencySymbols[invoice.currency] || invoice.currency}{formatMoney(item?.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="summary-row"><span>{localized("Subtotal", "المجموع الفرعي", "סכום ביניים")}</span><span>{currencySymbols[invoice.currency] || invoice.currency}{formatMoney(invoice.subtotal || subtotal)}</span></div>
          {Number(invoice.discount_total) > 0 && <div className="summary-row"><span>{localized("Discount", "الخصم", "הנחה")}</span><span>-{currencySymbols[invoice.currency] || invoice.currency}{formatMoney(invoice.discount_total)}</span></div>}
          {Number(invoice.tax_total) > 0 && <div className="summary-row"><span>{localized("Tax", "الضريبة", "מס")}</span><span>{currencySymbols[invoice.currency] || invoice.currency}{formatMoney(invoice.tax_total)}</span></div>}
          <div className="summary-row summary-total"><span>{localized("Total", "الإجمالي", "סה\"כ")}</span><span>{currencySymbols[invoice.currency] || invoice.currency}{formatMoney(invoice.total)}</span></div>
        </div>

        {invoice.notes && (
          <div className="invoice-notes">
            <strong>{localized("Notes:", "ملاحظات:", "הערות:")}</strong>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="invoice-footer">
          {localized("Thank you for your business", "شكرًا لتعاملكم معنا", "תודה על העסק")}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminInvoiceViewPage;
