import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  createInvoice,
  fetchInvoice,
  updateInvoice,
} from "../utils/invoicesApi.js";

function emptyLineItem() {
  return { description: "", quantity: 1, unit_price: 0, total: 0 };
}

function calculateLineTotal(item) {
  return Math.round(Number(item.quantity || 0) * Number(item.unit_price || 0) * 100) / 100;
}

function calculateSubtotal(items) {
  return (Array.isArray(items) ? items : []).reduce((sum, item) => sum + Number(item?.total || 0), 0);
}

function dateInputValue(value) {
  if (typeof value !== "string") return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : value.slice(0, 10);
}

function normalizeLineItems(value) {
  const rows = Array.isArray(value) ? value : [];
  return rows.length
    ? rows.map((item) => ({
        description: item?.description || "",
        quantity: Number(item?.quantity || 1),
        unit_price: Number(item?.unit_price || 0),
        total: Number(item?.total || 0),
      }))
    : [emptyLineItem()];
}

function AdminInvoiceFormPage({
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

  const editingInvoiceId = routeParams?.invoiceId;
  const isEditing = Boolean(editingInvoiceId);

  const [form, setForm] = React.useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    status: "draft",
    currency: "ILS",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    notes: "",
    line_items: [emptyLineItem()],
  });
  const [loading, setLoading] = React.useState(isEditing);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const inv = await fetchInvoice(editingInvoiceId);
        if (!cancelled) {
          setForm({
            customer_name: inv?.customer_name || "",
            customer_email: inv?.customer_email || "",
            customer_phone: inv?.customer_phone || "",
            status: inv?.status || "draft",
            currency: inv?.currency || "ILS",
            issue_date: dateInputValue(inv?.issue_date),
            due_date: dateInputValue(inv?.due_date),
            notes: inv?.notes || "",
            line_items: normalizeLineItems(inv?.line_items),
          });
        }
      } catch (error) {
        if (!cancelled) setMessage({ type: "error", text: error.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [editingInvoiceId, isEditing]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateLineItem(index, field, value) {
    setForm((prev) => {
      const items = (Array.isArray(prev.line_items) ? prev.line_items : [emptyLineItem()]).map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: field === "description" ? value : Number(value || 0) };
        updated.total = calculateLineTotal(updated);
        return updated;
      });
      return { ...prev, line_items: items };
    });
  }

  function addLineItem() {
    setForm((prev) => ({
      ...prev,
      line_items: [...(Array.isArray(prev.line_items) ? prev.line_items : []), emptyLineItem()],
    }));
  }

  function removeLineItem(index) {
    setForm((prev) => {
      const items = (Array.isArray(prev.line_items) ? prev.line_items : []).filter((_, i) => i !== index);
      return items.length === 0
        ? { ...prev, line_items: [emptyLineItem()] }
        : { ...prev, line_items: items };
    });
  }

  const lineItems = Array.isArray(form.line_items) ? form.line_items : [emptyLineItem()];
  const subtotal = calculateSubtotal(lineItems);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.customer_name.trim()) {
      setMessage({ type: "error", text: localized("Customer name is required.", "اسم العميل مطلوب.", "שם הלקוח נדרש.") });
      return;
    }
    if (lineItems.length === 0 || !lineItems[0].description.trim()) {
      setMessage({ type: "error", text: localized("At least one line item with a description is required.", "مطلوب بند واحد على الأقل مع وصف.", "נדרש לפחות פריט שורה אחד עם תיאור.") });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim() || null,
        customer_phone: form.customer_phone.trim() || null,
        status: form.status,
        currency: form.currency,
        issue_date: form.issue_date,
        due_date: form.due_date || null,
        notes: form.notes.trim() || null,
        line_items: lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      if (isEditing) {
        await updateInvoice(editingInvoiceId, payload);
        setMessage({ type: "success", text: localized("Invoice updated.", "تم تحديث الفاتورة.", "החשבונית עודכנה.") });
      } else {
        await createInvoice(payload);
        setMessage({ type: "success", text: localized("Invoice created.", "تم إنشاء الفاتورة.", "החשבונית נוצרה.") });
      }

      setTimeout(() => onNavigate("admin-invoices"), 1500);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };
  const title = isEditing ? loc({ en: "Edit Invoice", ar: "تعديل الفاتورة", he: "ערוך חשבונית" }) : loc({ en: "New Invoice", ar: "فاتورة جديدة", he: "חשבונית חדשה" });
  const subtitle = isEditing ? loc({ en: "Update invoice details", ar: "تحديث تفاصيل الفاتورة", he: "עדכן פרטי חשבונית" }) : loc({ en: "Create a new invoice", ar: "إنشاء فاتورة جديدة", he: "צור חשבונית חדשה" });

  if (loading) {
    return (
      <AdminLayout {...layoutProps} title={title} subtitle={localized("Loading invoice...", "جار تحميل الفاتورة...", "טוען חשבונית...")}>
        <div className="admin-empty-state">{localized("Loading...", "جار التحميل...", "טוען...")}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout {...layoutProps} title={title} subtitle={subtitle}>
      <div className="admin-invoice-form-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <form className="admin-panel-card" onSubmit={handleSubmit}>
          <div className="invoice-form-grid">
            <label className="full-field">
              <span>{localized("Customer Name *", "اسم العميل *", "שם הלקוח *")}</span>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setField("customer_name", e.target.value)}
                required
              />
            </label>

            <label>
              <span>{localized("Customer Email", "البريد الإلكتروني للعميل", "אימייל הלקוח")}</span>
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => setField("customer_email", e.target.value)}
              />
            </label>

            <label>
              <span>{localized("Customer Phone", "هاتف العميل", "טלפון הלקוח")}</span>
              <input
                type="text"
                value={form.customer_phone}
                onChange={(e) => setField("customer_phone", e.target.value)}
              />
            </label>

            <label>
              <span>{localized("Status", "الحالة", "סטטוס")}</span>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="draft">{localized("Draft", "مسودة", "טיוטה")}</option>
                <option value="issued">{localized("Issued", "صادر", "הונפק")}</option>
                <option value="paid">{localized("Paid", "مدفوع", "שולם")}</option>
                <option value="cancelled">{localized("Cancelled", "ملغي", "בוטל")}</option>
              </select>
            </label>

            <label>
              <span>{localized("Currency", "العملة", "מטבע")}</span>
              <select
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
              >
                <option value="ILS">ILS &#x20AA;</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR &#x20AC;</option>
              </select>
            </label>

            <label>
              <span>{localized("Issue Date", "تاريخ الإصدار", "תאריך הנפקה")}</span>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setField("issue_date", e.target.value)}
              />
            </label>

            <label>
              <span>{localized("Due Date", "تاريخ الاستحقاق", "תאריך יעד")}</span>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setField("due_date", e.target.value)}
              />
            </label>

            <label className="full-field">
              <span>{localized("Notes", "ملاحظات", "הערות")}</span>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </label>
          </div>

          <div className="admin-section-head" style={{ marginTop: "24px" }}>
            <h2>{localized("Line Items", "بنود الفاتورة", "פריטי שורה")}</h2>
            <button
              type="button"
              className="secondary-action"
              onClick={addLineItem}
            >
              + {localized("Add Line Item", "إضافة بند", "הוסף פריט שורה")}
            </button>
          </div>

          <div className="admin-table-wrap" style={{ marginTop: "12px" }}>
            <table className="admin-table admin-invoice-line-items-table">
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>{localized("Description *", "الوصف *", "תיאור *")}</th>
                  <th style={{ width: "14%" }}>{localized("Qty", "الكمية", "כמות")}</th>
                  <th style={{ width: "18%" }}>{localized("Unit Price", "سعر الوحدة", "מחיר יחידה")}</th>
                  <th style={{ width: "15%" }}>{localized("Total", "الإجمالي", "סה\"כ")}</th>
                  <th style={{ width: "15%" }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder={localized("Item description", "وصف البند", "תיאור פריט")}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, "unit_price", e.target.value)}
                      />
                    </td>
                    <td className="line-total-cell">
                      {form.currency === "ILS" ? "\u20AA" : "$"}{item.total.toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() => removeLineItem(index)}
                        style={{ color: "#a52222" }}
                      >
                        {localized("Remove", "إزالة", "הסר")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-invoice-totals-preview">
            <div className="total-row">
              <span className="total-label">{localized("Total", "الإجمالي", "סה\"כ")}</span>
              <span className="total-amount">{form.currency === "ILS" ? "\u20AA" : "$"}{subtotal.toFixed(2)}</span>
            </div>
            <p className="total-note">{localized("Frontend preview only. Final totals calculated on backend.", "معاينة فقط. الإجمالي النهائي يحسب في الخادم.", "תצוגה מקדימה בלבד. הסכומים הסופיים מחושבים בשרת.")}</p>
          </div>

          <div className="invoice-form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => onNavigate("admin-invoices")}
            >
              {localized("Cancel", "إلغاء", "ביטול")}
            </button>
            <button
              type="submit"
              className="primary-action"
              disabled={saving}
            >
              {saving ? localized("Saving...", "جار الحفظ...", "שומר...") : isEditing ? localized("Update Invoice", "تحديث الفاتورة", "עדכן חשבונית") : localized("Create Invoice", "إنشاء فاتورة", "צור חשבונית")}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminInvoiceFormPage;
