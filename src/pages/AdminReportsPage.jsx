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

function statusBadge(status, language) {
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
  const labels = {
    draft: { en: "Draft", ar: "مسودة", he: "טיוטה" },
    issued: { en: "Issued", ar: "صادر", he: "הונפק" },
    paid: { en: "Paid", ar: "مدفوع", he: "שולם" },
    cancelled: { en: "Cancelled", ar: "ملغي", he: "בוטל" },
    void: { en: "Void", ar: "ملغى", he: "מבוטל" },
    pending: { en: "Pending", ar: "معلق", he: "ממתין" },
    completed: { en: "Completed", ar: "مكتمل", he: "הושלם" },
    delivered: { en: "Delivered", ar: "تم التوصيل", he: "נמסר" },
    shipped: { en: "Shipped", ar: "تم الشحن", he: "נשלח" },
  };
  const label = labels[status?.toLowerCase()];
  const display = label ? (label[language] || label.en) : status;
  return <span style={{ background: c.bg, color: c.text, padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>{display}</span>;
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
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

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
    <AdminLayout {...layoutProps} title={localized("Reports", "التقارير", "דוחות")} subtitle={localized("Company performance and activity summary", "ملخص أداء الشركة ونشاطها", "סיכום ביצועי חברה ופעילות")}>
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head" style={{ flexWrap: "wrap", gap: "8px" }}>
          <div><h2>{localized("Dashboard Reports", "تقارير لوحة التحكم", "דוחות לוח בקרה")}</h2></div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <select value={preset} onChange={(e) => handlePresetChange(e.target.value)} style={{ minHeight: "32px", fontSize: "13px" }}>
              <option value="today">{localized("Today", "اليوم", "היום")}</option>
              <option value="last7">{localized("Last 7 days", "آخر 7 أيام", "7 הימים האחרונים")}</option>
              <option value="last30">{localized("Last 30 days", "آخر 30 يومًا", "30 הימים האחרונים")}</option>
              <option value="custom">{localized("Custom", "مخصص", "מותאם אישית")}</option>
            </select>
            {preset === "custom" && (
              <>
                <input type="date" value={dateRange.date_from ? dateRange.date_from.slice(0, 10) : ""} onChange={(e) => setDateRange((prev) => ({ ...prev, date_from: new Date(e.target.value).toISOString() }))} style={{ minHeight: "32px", fontSize: "13px" }} />
                <input type="date" value={dateRange.date_to ? dateRange.date_to.slice(0, 10) : ""} onChange={(e) => setDateRange((prev) => ({ ...prev, date_to: new Date(e.target.value).toISOString() }))} style={{ minHeight: "32px", fontSize: "13px" }} />
                <button className="admin-primary-button" onClick={handleCustomDate} type="button">{localized("Apply", "تطبيق", "החל")}</button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">{localized("Loading reports...", "جار تحميل التقارير...", "טוען דוחות...")}</div>
        ) : !data ? (
          <div className="admin-empty-state"><strong>{localized("No data available", "لا توجد بيانات متاحة", "אין נתונים זמינים")}</strong></div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
              {summaryCard(localized("Total Orders", "إجمالي الطلبات", "סה\"כ הזמנות"), data.summary.orders_count)}
              {summaryCard(localized("Revenue", "الإيرادات", "הכנסות"), `${data.summary.revenue_total.toFixed(2)} \u20AA`, "#16a34a")}
              {summaryCard(localized("Pending", "معلق", "ממתין"), data.summary.pending_orders, "#856404")}
              {summaryCard(localized("Completed", "مكتمل", "הושלם"), data.summary.completed_orders, "#155724")}
              {summaryCard(localized("Invoices", "الفواتير", "חשבוניות"), data.summary.invoices_count)}
              {summaryCard(localized("Paid", "مدفوع", "שולם"), data.summary.paid_invoices, "#21633b")}
              {summaryCard(localized("Void", "ملغى", "מבוטל"), data.summary.void_invoices, "#a52222")}
              {summaryCard(localized("Products", "المنتجات", "מוצרים"), data.summary.products_count)}
              {summaryCard(localized("Customers", "العملاء", "לקוחות"), data.summary.customers_count)}
              {summaryCard(localized("Cities", "المدن", "ערים"), data.summary.delivery_zones_count)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div className="admin-panel-card">
                <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>{localized("Orders by Status", "الطلبات حسب الحالة", "הזמנות לפי סטטוס")}</h3>
                {data.orders.by_status.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>{localized("No orders in this period.", "لا توجد طلبات في هذه الفترة.", "אין הזמנות בתקופה זו.")}</p> : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>{localized("Status", "الحالة", "סטטוס")}</th><th>{localized("Count", "العدد", "כמות")}</th></tr></thead>
                      <tbody>
                        {data.orders.by_status.map((s) => (
                          <tr key={s.status}><td>{statusBadge(s.status, language)}</td><td style={{ fontWeight: 600 }}>{s.count}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-panel-card">
                <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>{localized("Invoices by Status", "الفواتير حسب الحالة", "חשבוניות לפי סטטוס")}</h3>
                {data.invoices.by_status.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>{localized("No invoices in this period.", "لا توجد فواتير في هذه الفترة.", "אין חשבוניות בתקופה זו.")}</p> : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>{localized("Status", "الحالة", "סטטוס")}</th><th>{localized("Count", "العدد", "כמות")}</th></tr></thead>
                      <tbody>
                        {data.invoices.by_status.map((s) => (
                          <tr key={s.status}><td>{statusBadge(s.status, language)}</td><td style={{ fontWeight: 600 }}>{s.count}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-section-head"><h2>{localized("Latest Orders", "أحدث الطلبات", "ההזמנות האחרונות")}</h2></div>
            {data.orders.latest.length === 0 ? (
              <div className="admin-empty-state">{localized("No orders in this period.", "لا توجد طلبات في هذه الفترة.", "אין הזמנות בתקופה זו.")}</div>
            ) : (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>{localized("Order", "الطلب", "הזמנה")}</th><th>{localized("Customer", "العميل", "לקוח")}</th><th>{localized("Total", "الإجمالي", "סה\"כ")}</th><th>{localized("Status", "الحالة", "סטטוס")}</th><th>{localized("Date", "التاريخ", "תאריך")}</th></tr></thead>
                  <tbody>
                    {data.orders.latest.map((o) => (
                      <tr key={o.id}><td style={{ fontSize: "13px" }}>{o.id}</td><td>{o.customer_name}</td><td>{o.total.toFixed(2)} &#x20AA;</td><td>{statusBadge(o.status, language)}</td><td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatTime(o.created_at)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-section-head"><h2>{localized("Latest Invoices", "أحدث الفواتير", "החשבוניות האחרונות")}</h2></div>
            {data.invoices.latest.length === 0 ? (
              <div className="admin-empty-state">{localized("No invoices in this period.", "لا توجد فواتير في هذه الفترة.", "אין חשבוניות בתקופה זו.")}</div>
            ) : (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>{localized("Invoice", "الفاتورة", "חשבונית")}</th><th>{localized("Customer", "العميل", "לקוח")}</th><th>{localized("Total", "الإجمالי", "סה\"כ")}</th><th>{localized("Status", "الحالة", "סטטוס")}</th><th>{localized("Date", "التاريخ", "תאריך")}</th></tr></thead>
                  <tbody>
                    {data.invoices.latest.map((inv) => (
                      <tr key={inv.id}><td>{inv.invoice_number || inv.id}</td><td>{inv.customer_name}</td><td>{inv.total.toFixed(2)} &#x20AA;</td><td>{statusBadge(inv.status, language)}</td><td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatTime(inv.created_at)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-section-head"><h2>{localized("Products", "المنتجات", "מוצרים")}</h2></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              {summaryCard(localized("Total Products", "إجمالي المنتجات", "סה\"כ מוצרים"), data.summary.products_count)}
              {summaryCard(localized("Visible", "مرئي", "גלוי"), data.products.visible, "#16a34a")}
              {summaryCard(localized("Hidden", "مخفي", "מוסתר"), data.products.hidden, "#a52222")}
            </div>
            {data.products.latest.length > 0 && (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>{localized("Product", "المنتج", "מוצר")}</th><th>{localized("Status", "الحالة", "סטטוס")}</th></tr></thead>
                  <tbody>
                    {data.products.latest.map((p) => (
                      <tr key={p.id}><td>{p.name || p.slug}</td><td>{p.visible ? <span style={{ color: "#16a34a", fontWeight: 600 }}>{localized("Visible", "مرئي", "גלוי")}</span> : <span style={{ color: "#a52222", fontWeight: 600 }}>{localized("Hidden", "مخفي", "מוסתר")}</span>}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-section-head"><h2>{localized("Delivery", "التوصيل", "משלוח")}</h2></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              {summaryCard(localized("Total Cities", "إجمالي المدن", "סה\"כ ערים"), data.summary.delivery_zones_count)}
              {summaryCard(localized("Enabled", "مفعل", "מופעל"), data.delivery.enabled, "#16a34a")}
              {summaryCard(localized("Disabled", "معطل", "מושבת"), data.delivery.disabled, "#a52222")}
            </div>
            {data.delivery.top_cities.length > 0 && (
              <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                <table className="admin-table">
                  <thead><tr><th>{localized("City", "المدينة", "עיר")}</th><th>{localized("Orders", "الطلبات", "הזמנות")}</th></tr></thead>
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
                <div className="admin-section-head"><h2>{localized("Activity Summary", "ملخص النشاط", "סיכום פעילות")}</h2></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="admin-panel-card">
                    <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>{localized("Actions by Type", "الإجراءات حسب النوع", "פעולות לפי סוג")}</h3>
                    {data.activity.by_action.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>{localized("No activity.", "لا يوجد نشاط.", "אין פעילות.")}</p> : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead><tr><th>{localized("Action", "الإجراء", "פעולה")}</th><th>{localized("Count", "العدد", "כמות")}</th></tr></thead>
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
                    <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>{localized("Most Active Admins", "المشرفون الأكثر نشاطًا", "המנהלים הפעילים ביותר")}</h3>
                    {data.activity.by_actor.length === 0 ? <p style={{ color: "#888", fontSize: "13px" }}>{localized("No activity.", "لا يوجد نشاط.", "אין פעילות.")}</p> : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead><tr><th>{localized("Actor", "الفاعل", "מבצע")}</th><th>{localized("Actions", "الإجراءات", "פעולות")}</th></tr></thead>
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

                <div className="admin-section-head"><h2>{localized("Latest Activity", "آخر النشاطات", "הפעילות האחרונה")}</h2></div>
                <div className="admin-table-wrap" style={{ marginBottom: "24px" }}>
                  <table className="admin-table">
                    <thead><tr><th>{localized("Date", "التاريخ", "תאריך")}</th><th>{localized("Actor", "الفاعل", "מבצע")}</th><th>{localized("Action", "الإجراء", "פעולה")}</th><th>{localized("Summary", "الملخص", "סיכום")}</th></tr></thead>
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
