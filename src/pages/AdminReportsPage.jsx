import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { fetchReportsSummary } from "../utils/reportsApi.js";

function formatTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function summaryCard(label, value, accent) {
  return (
    <div className="admin-panel-card" style={{ flex: "1 1 160px", minWidth: "140px", textAlign: "center", padding: "16px 12px" }}>
      <div style={{ fontSize: "28px", fontWeight: "700", color: accent || "var(--admin-primary, #0b2e4e)" }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function statusBadge(status) {
  const colors = {
    draft: { bg: "#eef1f4", text: "#5f6b77" },
    issued: { bg: "#e8f7fb", text: "#0b2e4e" },
    paid: { bg: "#effaf2", text: "#21633b" },
    cancelled: { bg: "#ffe8e8", text: "#a52222" },
    void: { bg: "#eef1f4", text: "#5f6b77" },
    pending: { bg: "#fff3cd", text: "#856404" },
    completed: { bg: "#d4edda", text: "#155724" },
    delivered: { bg: "#d4edda", text: "#155724" },
    shipped: { bg: "#cce5ff", text: "#004085" },
  };
  const c = colors[status?.toLowerCase()] || { bg: "#f0f0f0", text: "#333" };
  return <span style={{ background: c.bg, color: c.text, padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
}

function AdminReportsPage({
  activePage,
  currentUser,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  onToggleDarkMode,
}) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState(null);
  const [dateRange, setDateRange] = React.useState({ date_from: "", date_to: "" });
  const [preset, setPreset] = React.useState("last30");

  function getPresetDates(value) {
    const now = new Date();
    let from;
    switch (value) {
      case "today":
        from = new Date(now);
        break;
      case "last7":
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        break;
      case "last30":
      default:
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        break;
    }
    from.setHours(0, 0, 0, 0);
    return { date_from: from.toISOString(), date_to: now.toISOString() };
  }

  async function load(range) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (range.date_from) params.date_from = range.date_from;
      if (range.date_to) params.date_to = range.date_to;
      const result = await fetchReportsSummary(params);
      setData(result);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const range = getPresetDates(preset);
    setDateRange(range);
    void load(range);
  }, []);

  function handlePresetChange(value) {
    setPreset(value);
    const range = getPresetDates(value);
    setDateRange(range);
    void load(range);
  }

  function handleCustomDate() {
    if (dateRange.date_from && dateRange.date_to) {
      void load(dateRange);
    }
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };

  return (
    <AdminLayout {...layoutProps} title="Reports" subtitle="Company performance and activity summary">
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head" style={{ flexWrap: "wrap", gap: "8px" }}>
          <div><h2>Dashboard Reports</h2></div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <select value={preset} onChange={(e) => handlePresetChange(e.target.value)} style={{ minHeight: "32px", fontSize: "13px" }}>
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="custom">Custom</option>
            </select>
            {preset === "custom" && (
              <>
                <input type="date" value={dateRange.date_from ? dateRange.date_from.slice(0, 10) : ""} onChange={(e) => setDateRange((prev) => ({ ...prev, date_from: new Date(e.target.value).toISOString() }))} style={{ minHeight: "32px", fontSize: "13px" }} />
                <input type="date" value={dateRange.date_to ? dateRange.date_to.slice(0, 10) : ""} onChange={(e) => setDateRange((prev) => ({ ...prev, date_to: new Date(e.target.value).toISOString() }))} style={{ minHeight: "32px", fontSize: "13px" }} />
                <button className="admin-primary-button" onClick={handleCustomDate} type="button">Apply</button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">Loading reports...</div>
        ) : !data ? (
          <div className="admin-empty-state"><strong>No data available</strong></div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
              {summaryCard("Total Orders", data.summary.orders_count)}
              {summaryCard("Revenue", `${data.summary.revenue_total.toFixed(2)} \u20AA`, "#16a34a")}
              {summaryCard("Pending", data.summary.pending_orders, "#856404")}
              {summaryCard("Completed", data.summary.completed_orders, "#155724")}
              {summaryCard("Invoices", data.summary.invoices_count)}
              {summaryCard("Paid", data.summary.paid_invoices, "#21633b")}
              {summaryCard("Void", data.summary.void_invoices, "#a52222")}
              {summaryCard("Products", data.summary.products_count)}
              {summaryCard("Customers", data.summary.customers_count)}
              {summaryCard("Cities", data.summary.delivery_zones_count)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div className="admin-panel-card">
                <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Orders by Status</h3>
                {data.orders.by_status.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>No orders in this period.</p> : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Status</th><th>Count</th></tr></thead>
                      <tbody>
                        {data.orders.by_status.map((s) => (
                          <tr key={s.status}><td>{statusBadge(s.status)}</td><td style={{ fontWeight: 600 }}>{s.count}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-panel-card">
                <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Invoices by Status</h3>
                {data.invoices.by_status.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>No invoices in this period.</p> : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Status</th><th>Count</th></tr></thead>
                      <tbody>
                        {data.invoices.by_status.map((s) => (
                          <tr key={s.status}><td>{statusBadge(s.status)}</td><td style={{ fontWeight: 600 }}>{s.count}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-section-head"><h2>Latest Orders</h2></div>
            {data.orders.latest.length === 0 ? (
              <div className="admin-empty-state">No orders in this period.</div>
            ) : (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {data.orders.latest.map((o) => (
                      <tr key={o.id}><td style={{ fontSize: "13px" }}>{o.id}</td><td>{o.customer_name}</td><td>{o.total.toFixed(2)} &#x20AA;</td><td>{statusBadge(o.status)}</td><td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatTime(o.created_at)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-section-head"><h2>Latest Invoices</h2></div>
            {data.invoices.latest.length === 0 ? (
              <div className="admin-empty-state">No invoices in this period.</div>
            ) : (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {data.invoices.latest.map((inv) => (
                      <tr key={inv.id}><td>{inv.invoice_number || inv.id}</td><td>{inv.customer_name}</td><td>{inv.total.toFixed(2)} &#x20AA;</td><td>{statusBadge(inv.status)}</td><td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatTime(inv.created_at)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-section-head"><h2>Products</h2></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              {summaryCard("Total Products", data.summary.products_count)}
              {summaryCard("Visible", data.products.visible, "#16a34a")}
              {summaryCard("Hidden", data.products.hidden, "#a52222")}
            </div>
            {data.products.latest.length > 0 && (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.products.latest.map((p) => (
                      <tr key={p.id}><td>{p.name || p.slug}</td><td>{p.visible ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Visible</span> : <span style={{ color: "#a52222", fontWeight: 600 }}>Hidden</span>}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-section-head"><h2>Delivery</h2></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              {summaryCard("Total Cities", data.summary.delivery_zones_count)}
              {summaryCard("Enabled", data.delivery.enabled, "#16a34a")}
              {summaryCard("Disabled", data.delivery.disabled, "#a52222")}
            </div>
            {data.delivery.top_cities.length > 0 && (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>City</th><th>Orders</th></tr></thead>
                  <tbody>
                    {data.delivery.top_cities.map((c) => (
                      <tr key={c.city}><td>{c.city}</td><td style={{ fontWeight: 600 }}>{c.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data.activity.latest.length > 0 && (
              <>
                <div className="admin-section-head"><h2>Activity Summary</h2></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="admin-panel-card">
                    <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Actions by Type</h3>
                    {data.activity.by_action.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>No activity.</p> : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead><tr><th>Action</th><th>Count</th></tr></thead>
                          <tbody>
                            {data.activity.by_action.map((a) => (
                              <tr key={a.action}><td><code style={{ fontSize: "12px" }}>{a.action}</code></td><td style={{ fontWeight: 600 }}>{a.count}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="admin-panel-card">
                    <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Most Active Admins</h3>
                    {data.activity.by_actor.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>No activity.</p> : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead><tr><th>Actor</th><th>Actions</th></tr></thead>
                          <tbody>
                            {data.activity.by_actor.map((a) => (
                              <tr key={a.actor}><td>{a.actor}</td><td style={{ fontWeight: 600 }}>{a.count}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-section-head"><h2>Latest Activity</h2></div>
                <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                  <table className="admin-table">
                    <thead><tr><th>Date</th><th>Actor</th><th>Action</th><th>Summary</th></tr></thead>
                    <tbody>
                      {data.activity.latest.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatTime(log.created_at)}</td>
                          <td>{log.actor_name}</td>
                          <td><code style={{ fontSize: "12px", background: "#f0f0f0", padding: "2px 6px", borderRadius: "3px" }}>{log.action}</code></td>
                          <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReportsPage;
