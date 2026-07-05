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
      setMessage({ type: "error", text: "City name is required." });
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
        setMessage({ type: "success", text: "Delivery zone updated." });
      } else {
        await createDeliveryZone(payload);
        setMessage({ type: "success", text: "Delivery zone created." });
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
    if (!window.confirm("Delete this delivery zone?")) return;
    try {
      await deleteDeliveryZone(zoneId);
      setMessage({ type: "success", text: "Delivery zone deleted." });
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
    <AdminLayout {...layoutProps} title="Delivery Zones" subtitle="Manage city delivery pricing">
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head">
          <div>
            <h2>Delivery Cities</h2>
          </div>
          {!showForm && (
            <button className="admin-primary-button" onClick={openCreate} type="button">
              + Add City
            </button>
          )}
        </div>

        {showForm ? (
          <form className="admin-panel-card" onSubmit={handleSave} style={{ marginBottom: "16px" }}>
            <div className="invoice-form-grid">
              <label>
                <span>City Name *</span>
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
                <span>City Key</span>
                <input
                  type="text"
                  value={form.city_key}
                  onChange={(e) => setField("city_key", e.target.value)}
                  placeholder="Auto-generated from name"
                />
              </label>

              <label>
                <span>Region</span>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setField("region", e.target.value)}
                  placeholder="e.g. West Bank"
                />
              </label>

              <label>
                <span>Delivery Price *</span>
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
                <span>Display Order</span>
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
                <span>Enabled</span>
              </label>
            </div>

            <div className="invoice-form-actions">
              <button type="button" className="secondary-action" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="primary-action" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update City" : "Add City"}
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="admin-empty-state">Loading delivery zones...</div>
        ) : zones.length === 0 ? (
          <div className="admin-empty-state">
            <strong>No delivery zones yet</strong>
            <p>Add cities and set delivery prices.</p>
            <button className="admin-primary-button" onClick={openCreate} type="button">Add your first city</button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Region</th>
                  <th>Delivery Price</th>
                  <th>Order</th>
                  <th>Enabled</th>
                  <th>Actions</th>
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
                        {zone.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="secondary-action" onClick={() => openEdit(zone)} type="button">Edit</button>
                        <button className="secondary-action" onClick={() => handleDelete(zone.id)} type="button" style={{ color: "#a52222" }}>Delete</button>
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
