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
  return items.reduce((sum, item) => sum + item.total, 0);
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
            customer_name: inv.customer_name || "",
            customer_email: inv.customer_email || "",
            customer_phone: inv.customer_phone || "",
            status: inv.status || "draft",
            currency: inv.currency || "ILS",
            issue_date: inv.issue_date ? inv.issue_date.slice(0, 10) : "",
            due_date: inv.due_date ? inv.due_date.slice(0, 10) : "",
            notes: inv.notes || "",
            line_items: (inv.line_items || []).map((item) => ({
              description: item.description || "",
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              total: item.total || 0,
            })),
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
      const items = prev.line_items.map((item, i) => {
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
      line_items: [...prev.line_items, emptyLineItem()],
    }));
  }

  function removeLineItem(index) {
    setForm((prev) => {
      const items = prev.line_items.filter((_, i) => i !== index);
      return items.length === 0
        ? { ...prev, line_items: [emptyLineItem()] }
        : { ...prev, line_items: items };
    });
  }

  const subtotal = calculateSubtotal(form.line_items);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.customer_name.trim()) {
      setMessage({ type: "error", text: "Customer name is required." });
      return;
    }
    if (form.line_items.length === 0 || !form.line_items[0].description.trim()) {
      setMessage({ type: "error", text: "At least one line item with a description is required." });
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
        line_items: form.line_items.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      if (isEditing) {
        await updateInvoice(editingInvoiceId, payload);
        setMessage({ type: "success", text: "Invoice updated." });
      } else {
        await createInvoice(payload);
        setMessage({ type: "success", text: "Invoice created." });
      }

      setTimeout(() => onNavigate("admin-invoices"), 1500);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };
  const title = isEditing ? "Edit Invoice" : "New Invoice";
  const subtitle = isEditing ? "Update invoice details" : "Create a new invoice";

  if (loading) {
    return (
      <AdminLayout {...layoutProps} title={title} subtitle="Loading invoice...">
        <div className="admin-empty-state">Loading...</div>
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
              <span>Customer Name *</span>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setField("customer_name", e.target.value)}
                required
              />
            </label>

            <label>
              <span>Customer Email</span>
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => setField("customer_email", e.target.value)}
              />
            </label>

            <label>
              <span>Customer Phone</span>
              <input
                type="text"
                value={form.customer_phone}
                onChange={(e) => setField("customer_phone", e.target.value)}
              />
            </label>

            <label>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label>
              <span>Currency</span>
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
              <span>Issue Date</span>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setField("issue_date", e.target.value)}
              />
            </label>

            <label>
              <span>Due Date</span>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setField("due_date", e.target.value)}
              />
            </label>

            <label className="full-field">
              <span>Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </label>
          </div>

          <div className="admin-section-head" style={{ marginTop: "24px" }}>
            <h2>Line Items</h2>
            <button
              type="button"
              className="secondary-action"
              onClick={addLineItem}
            >
              + Add Line Item
            </button>
          </div>

          <div className="admin-table-wrap" style={{ marginTop: "12px" }}>
            <table className="admin-table admin-invoice-line-items-table">
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>Description *</th>
                  <th style={{ width: "14%" }}>Qty</th>
                  <th style={{ width: "18%" }}>Unit Price</th>
                  <th style={{ width: "15%" }}>Total</th>
                  <th style={{ width: "15%" }}></th>
                </tr>
              </thead>
              <tbody>
                {form.line_items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder="Item description"
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
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-invoice-totals-preview">
            <div className="total-row">
              <span className="total-label">Total</span>
              <span className="total-amount">{form.currency === "ILS" ? "\u20AA" : "$"}{subtotal.toFixed(2)}</span>
            </div>
            <p className="total-note">Frontend preview only. Final totals calculated on backend.</p>
          </div>

          <div className="invoice-form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => onNavigate("admin-invoices")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-action"
              disabled={saving}
            >
              {saving ? "Saving..." : isEditing ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminInvoiceFormPage;
