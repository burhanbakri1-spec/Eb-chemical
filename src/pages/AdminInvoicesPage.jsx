import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { fetchInvoices, voidInvoice } from "../utils/invoicesApi.js";

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

  const [invoices, setInvoices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const result = await fetchInvoices();
      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
          ? result.items
          : Array.isArray(result?.invoices)
            ? result.invoices
            : null;

      if (!rows) {
        throw new Error(localized(
          "Invoices could not be loaded because the server returned an unexpected response.",
          "تعذر تحميل الفواتير لأن الخادم أعاد استجابة غير متوقعة.",
          "לא ניתן לטעון חשבוניות מכיוון שהשרת החזיר תגובה לא צפויה.",
        ));
      }

      setInvoices(rows);
    } catch (error) {
      setInvoices([]);
      setMessage({
        type: "error",
        text: error?.message || localized(
          "Failed to load invoices. Please try again.",
          "فشل تحميل الفواتير. يرجى المحاولة مرة أخرى.",
          "טעינת החשבוניות נכשלה. נסה שוב.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function handleVoid(invoiceId) {
    if (!window.confirm(localized("Void this invoice?", "إلغاء هذه الفاتورة؟", "לבטל חשבונית זו?"))) return;
    try {
      await voidInvoice(invoiceId);
      setMessage({ type: "success", text: localized("Invoice voided.", "تم إلغاء الفاتورة.", "החשבונית בוטלה.") });
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
    <AdminLayout {...layoutProps} title={loc({ en: "Invoices", ar: "الفواتير", he: "חשבוניות" })} subtitle={loc({ en: "Manage company invoices", ar: "إدارة فواتير الشركة", he: "ניהול חשבוניות חברה" })}>
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head">
          <div>
            <h2>{localized("All Invoices", "جميع الفواتير", "כל החשבוניות")}</h2>
          </div>
          <button
            className="admin-primary-button"
            onClick={() => onNavigate("admin-invoices-new")}
            type="button"
          >
            + {localized("New Invoice", "فاتورة جديدة", "חשבונית חדשה")}
          </button>
        </div>

        {loading ? (
          <div className="admin-empty-state">{localized("Loading invoices...", "جار تحميل الفواتير...", "טוען חשבוניות...")}</div>
        ) : invoices.length === 0 ? (
          <div className="admin-empty-state">
            <strong>{localized("No invoices yet", "لا توجد فواتير بعد", "אין חשבוניות עדיין")}</strong>
            <p>{localized("Create your first invoice to get started.", "أنشئ فاتورتك الأولى للبدء.", "צור את החשבונית הראשונה שלך כדי להתחיל.")}</p>
            <button className="admin-primary-button" onClick={() => onNavigate("admin-invoices-new")} type="button">
              {localized("Create your first invoice", "إنشاء أول فاتورة", "צור חשבונית ראשונה")}
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{localized("Invoice #", "رقم الفاتورة", "מספר חשבונית")}</th>
                  <th>{localized("Customer", "العميل", "לקוח")}</th>
                  <th>{localized("Status", "الحالة", "סטטוס")}</th>
                  <th>{localized("Issue Date", "تاريخ الإصدار", "תאריך הנפקה")}</th>
                  <th>{localized("Total", "الإجمالي", "סה\"כ")}</th>
                  <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
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
                          {localized("View", "عرض", "צפה")}
                        </button>
                        <button
                          className="secondary-action"
                          onClick={() => onNavigate("admin-invoices-edit", { invoiceId: inv.id })}
                          type="button"
                          disabled={inv.status === "void" || inv.status === "cancelled"}
                        >
                          {localized("Edit", "تعديل", "ערוך")}
                        </button>
                        {inv.status !== "void" && inv.status !== "cancelled" && (
                          <button
                            className="secondary-action"
                            onClick={() => handleVoid(inv.id)}
                            type="button"
                            style={{ color: "#a52222" }}
                          >
                            {localized("Void", "إلغاء", "בטל")}
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
