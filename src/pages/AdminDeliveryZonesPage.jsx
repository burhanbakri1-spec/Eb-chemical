import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  fetchAdminDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "../utils/deliveryZonesApi.js";

const currencySymbols = {
  ILS: "\u20AA",
  USD: "$",
  EUR: "\u20AC",
};

function emptyForm() {
  return {
    city_key: "",
    city_name: "",
    region: "",
    delivery_price: 0,
    currency: "ILS",
    enabled: true,
    display_order: 0,
  };
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminDeliveryZonesPage({
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

  const [zones, setZones] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState(emptyForm());
  const [saving, setSaving] = React.useState(false);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const result = await fetchAdminDeliveryZones();
      setZones(result);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(zone) {
    setForm({
      city_key: zone.city_key,
      city_name: zone.city_name,
      region: zone.region || "",
      delivery_price: zone.delivery_price,
      currency: zone.currency || "ILS",
      enabled: zone.enabled !== false,
      display_order: zone.display_order || 0,
    });
    setEditingId(zone.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setMessage(null);
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.city_name.trim()) {
      setMessage({ type: "error", text: localized("City name is required.", "اسم المدينة مطلوب.", "שם העיר נדרש.") });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        city_key: form.city_key || slugify(form.city_name),
        city_name: form.city_name.trim(),
        region: form.region.trim(),
        delivery_price: Number(form.delivery_price),
        currency: form.currency,
        enabled: form.enabled,
        display_order: Number(form.display_order || 0),
      };

      if (editingId) {
        await updateDeliveryZone(editingId, payload);
        setMessage({ type: "success", text: localized("Delivery zone updated.", "تم تحديث منطقة التوصيل.", "אזור המשלוח עודכן.") });
      } else {
        await createDeliveryZone(payload);
        setMessage({ type: "success", text: localized("Delivery zone created.", "تم إنشاء منطقة التوصيل.", "אזור המשלוח נוצר.") });
      }

      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(zoneId) {
    if (!window.confirm(localized("Delete this delivery zone?", "حذف منطقة التوصيل هذه؟", "למחוק אזור משלוח זה?"))) return;
    try {
      await deleteDeliveryZone(zoneId);
      setMessage({ type: "success", text: localized("Delivery zone deleted.", "تم حذف منطقة التوصيل.", "אזור המשלוח נמחק.") });
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function handleToggleEnabled(zone) {
    try {
      await updateDeliveryZone(zone.id, { enabled: !zone.enabled });
      await load();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };

  return (
    <AdminLayout {...layoutProps} title={loc({ en: "Delivery Zones", ar: "مناطق التوصيل", he: "אזורי משלוח" })} subtitle={loc({ en: "Manage city delivery pricing", ar: "إدارة أسعار التوصيل حسب المدينة", he: "ניהול תמחור משלוח לפי עיר" })}>
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head">
          <div>
            <h2>{localized("Delivery Cities", "مدن التوصيل", "ערי משלוח")}</h2>
          </div>
          {!showForm && (
            <button className="admin-primary-button" onClick={openCreate} type="button">
              + {localized("Add City", "إضافة مدينة", "הוסף עיר")}
            </button>
          )}
        </div>

        {showForm ? (
          <form className="admin-panel-card" onSubmit={handleSave} style={{ marginBottom: "16px" }}>
            <div className="invoice-form-grid">
              <label>
                <span>{localized("City Name *", "اسم المدينة *", "שם העיר *")}</span>
                <input
                  type="text"
                  value={form.city_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setField("city_name", name);
                    if (!editingId && !form.city_key) {
                      setField("city_key", slugify(name));
                    }
                  }}
                  required
                />
              </label>

              <label>
                <span>{localized("City Key", "مفتاح المدينة", "מפתח העיר")}</span>
                <input
                  type="text"
                  value={form.city_key}
                  onChange={(e) => setField("city_key", e.target.value)}
                  placeholder={localized("Auto-generated from name", "يُتاح تلقائيًا من الاسم", "נוצר אוטומטית מהשם")}
                />
              </label>

              <label>
                <span>{localized("Region", "المنطقة", "אזור")}</span>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setField("region", e.target.value)}
                  placeholder={localized("e.g. West Bank", "مثال: الضفة الغربية", "למשל: יהודה ושומרון")}
                />
              </label>

              <label>
                <span>{localized("Delivery Price *", "سعر التوصيل *", "מחיר משלוח *")}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.delivery_price}
                  onChange={(e) => setField("delivery_price", e.target.value)}
                  required
                />
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
                <span>{localized("Display Order", "ترتيب العرض", "סדר תצוגה")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.display_order}
                  onChange={(e) => setField("display_order", e.target.value)}
                />
              </label>

              <label className="full-field" style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setField("enabled", e.target.checked)}
                  style={{ width: "auto", minHeight: "auto" }}
                />
                <span>{localized("Enabled", "مفعل", "מופעל")}</span>
              </label>
            </div>

            <div className="invoice-form-actions">
              <button type="button" className="secondary-action" onClick={cancelForm}>{localized("Cancel", "إلغاء", "ביטול")}</button>
              <button type="submit" className="primary-action" disabled={saving}>
                {saving ? localized("Saving...", "جار الحفظ...", "שומר...") : editingId ? localized("Update City", "تحديث المدينة", "עדכן עיר") : localized("Add City", "إضافة مدينة", "הוסף עיר")}
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="admin-empty-state">{localized("Loading delivery zones...", "جار تحميل مناطق التوصيل...", "טוען אזורי משלוח...")}</div>
        ) : zones.length === 0 ? (
          <div className="admin-empty-state">
            <strong>{localized("No delivery zones yet", "لا توجد مناطق توصيل بعد", "אין אזורי משלוח עדיין")}</strong>
            <p>{localized("Add cities and set delivery prices.", "أضف مدنًا وحدد أسعار التوصيل.", "הוסף ערים וקבע מחירי משלוח.")}</p>
            <button className="admin-primary-button" onClick={openCreate} type="button">{localized("Add your first city", "أضف مدينتك الأولى", "הוסף את העיר הראשונה")}</button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{localized("City", "المدينة", "עיר")}</th>
                  <th>{localized("Region", "المنطقة", "אזור")}</th>
                  <th>{localized("Delivery Price", "سعر التوصيل", "מחיר משלוח")}</th>
                  <th>{localized("Order", "الترتيب", "סדר")}</th>
                  <th>{localized("Enabled", "مفعل", "מופעל")}</th>
                  <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td><strong>{zone.city_name}</strong></td>
                    <td>{zone.region || "\u2014"}</td>
                    <td>{currencySymbols[zone.currency] || zone.currency}{Number(zone.delivery_price).toFixed(2)}</td>
                    <td>{zone.display_order}</td>
                    <td>
                      <button
                        className="secondary-action"
                        onClick={() => handleToggleEnabled(zone)}
                        type="button"
                        style={zone.enabled ? { color: "#16a34a" } : { color: "#a52222" }}
                      >
                        {zone.enabled ? localized("Enabled", "مفعل", "מופעל") : localized("Disabled", "معطل", "מושבת")}
                      </button>
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="secondary-action" onClick={() => openEdit(zone)} type="button">{localized("Edit", "تعديل", "ערוך")}</button>
                        <button className="secondary-action" onClick={() => handleDelete(zone.id)} type="button" style={{ color: "#a52222" }}>{localized("Delete", "حذف", "מחק")}</button>
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

export default AdminDeliveryZonesPage;
