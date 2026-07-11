import React from "react";
import { sendHeartbeat } from "../utils/workSessionsApi.js";
import { fetchActivityLogs } from "../utils/activityLogApi.js";

function formatMinutes(minutes = 0) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

const MAX_OPEN_SESSION_MINUTES = 10;

function getSessionDuration(session) {
  if (session.totalMinutes != null) return Math.max(0, Math.round(Number(session.totalMinutes) || 0));
  const loginTime = session.loginTime ? new Date(session.loginTime) : null;
  if (!loginTime || Number.isNaN(loginTime.getTime())) return 0;

  if (session.logoutTime) {
    const logoutTime = new Date(session.logoutTime);
    return Number.isNaN(logoutTime.getTime()) ? 0 : Math.max(0, Math.round((logoutTime - loginTime) / 60000));
  }

  if (session.lastActivityAt) {
    const lastActivityAt = new Date(session.lastActivityAt);
    return Number.isNaN(lastActivityAt.getTime()) ? 0 : Math.max(0, Math.round((lastActivityAt - loginTime) / 60000));
  }

  return Math.min(MAX_OPEN_SESSION_MINUTES, Math.max(0, Math.round((Date.now() - loginTime) / 60000)));
}

function EmployeePerformanceView({
  employee,
  language,
  onBack,
  onModerateReview,
  orders,
  reviews,
  sessions,
  t,
}) {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [activityLogs, setActivityLogs] = React.useState([]);
  const [logsLoaded, setLogsLoaded] = React.useState(false);
  const [modMessage, setModMessage] = React.useState("");

  React.useEffect(() => {
    if (!employee?.id && !employee?.email) return;
    setLogsLoaded(false);
    fetchActivityLogs({ limit: 500 })
      .then((data) => {
        const rows = Array.isArray(data?.logs) ? data.logs : Array.isArray(data) ? data : [];
        setActivityLogs(rows.filter((log) => {
          const ids = [log.actor_id, log.actor_user_id, log.user_id, log.userId, log.employeeId].filter(Boolean);
          const emails = [log.actor_email, log.email, log.userEmail].filter(Boolean).map((value) => String(value).toLowerCase());
          return ids.includes(employee.id) || (employee.email && emails.includes(String(employee.email).toLowerCase()));
        }));
        setLogsLoaded(true);
      })
      .catch(() => setLogsLoaded(true));
  }, [employee?.email, employee?.id]);

  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const employeeOrders = orders.filter(
    (o) =>
      o.handledByEmployeeId === employee.id ||
      o.assignedToEmployeeId === employee.id ||
      o.createdByEmployeeId === employee.id,
  );

  const completedOrders = employeeOrders.filter((o) => o.status === "Completed" || o.status === "completed" || o.status === "Delivered" || o.status === "delivered");
  const pendingOrders = employeeOrders.filter((o) => o.status !== "Completed" && o.status !== "completed" && o.status !== "Delivered" && o.status !== "delivered");
  const totalHandledValue = employeeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const employeeReviews = reviews.filter(
    (r) => r.type === "employee" && r.employeeId === employee.id,
  );
  const approvedReviews = employeeReviews.filter((r) => r.isApproved && r.status === "approved");
  const pendingReviews = employeeReviews.filter((r) => r.status === "pending");
  const avgRating = approvedReviews.length
    ? (approvedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / approvedReviews.length).toFixed(1)
    : null;

  const employeeSessions = sessions.filter((s) => s.employeeId === employee.id);
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = employeeSessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((total, session) => total + getSessionDuration(session), 0);
  const totalMinutes = employeeSessions.reduce((total, session) => total + getSessionDuration(session), 0);

  const sortedSessions = [...employeeSessions].sort(
    (a, b) => new Date(b.loginTime || 0) - new Date(a.loginTime || 0),
  );

  const copy = {
    performance: localized("Performance", "الأداء", "ביצועים"),
    overview: localized("Overview", "نظرة عامة", "סקירה כללית"),
    orders: localized("Orders", "الطلبات", "הזמנות"),
    sessions: localized("Work Sessions", "ساعات العمل", "משמרות עבודה"),
    reviews: localized("Reviews", "التقييمات", "ביקורות"),
    activity: localized("Activity Log", "تعديلات الموظف", "יומן פעילות"),
    totalOrders: localized("Total Orders", "إجمالي الطلبات", "סך הכל הזמנות"),
    completed: localized("Completed", "مكتمل", "הושלם"),
    pending: localized("Pending", "قيد الانتظار", "ממתין"),
    totalValue: localized("Total Value", "القيمة الإجمالית", "שווי כולל"),
    today: localized("Today", "اليوم", "היום"),
    totalHours: localized("Total Hours", "إجمالي الساعات", "סך הכל שעות"),
    noSession: localized("No sessions recorded", "لا توجد جلسات مسجلة", "אין משמרות"),
    rating: localized("Rating", "التقييم", "דירוג"),
    noReviews: localized("No reviews yet", "لا توجد تقييمات بعد", "אין ביקורות עדיין"),
    noRating: localized("No rating", "لا يوجد", "אין דירוג"),
    approve: localized("Approve", "موافقة", "אשר"),
    reject: localized("Reject", "رفض", "דחה"),
    hide: localized("Hide", "إخفاء", "הסתר"),
    employeeDetails: localized("Employee Details", "تفاصيل الموظف", "פרטי עובד"),
    active: localized("Active", "نشط", "פעיל"),
    inactive: localized("Inactive", "غير نشط", "לא פעיל"),
    department: localized("Department", "القسم", "מחלקה"),
    position: localized("Position", "المنصب", "תפקיד"),
    orderId: localized("Order ID", "رقم الطلب", "מספר הזמנה"),
    dateTime: localized("Date & Time", "التاريخ والوقت", "תאריך ושעה"),
    customerName: localized("Customer Name", "اسم العميل", "שם לקוח"),
    phone: localized("Phone", "رقم التواصل", "טלפון"),
    status: localized("Status", "الحالة", "סטטוס"),
    total: localized("Total", "الإجمالي", "סה\"כ"),
  };

  function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return "-";
      const locale = language === "ar" ? "ar" : language === "he" ? "he-IL" : "en-US";
      return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return "-"; }
  }

  function formatOrderValue(value) {
    return `${Number(value || 0).toLocaleString()} ${t("common.ils")}`;
  }

  async function handleModerate(reviewId, status) {
    try {
      await onModerateReview(reviewId, status);
      setModMessage(localized("Review updated", "تم تحديث التقييم", "הביקורת עודכנה"));
    } catch {
      setModMessage(localized("Failed to update review", "فشل تحديث التقييم", "נכשל בעדכון הביקורת"));
    }
  }

  function renderOverview() {
    return (
      <div>
        {modMessage && <div className="message-panel success" style={{ marginBottom: "0.5rem" }}>{modMessage}</div>}
        <div className="admin-metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <div className="admin-metric-card">
            <strong>{employeeOrders.length}</strong>
            <span>{copy.totalOrders}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{completedOrders.length}</strong>
            <span>{localized("Completed", "مكتمل", "הושלם")}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{pendingOrders.length}</strong>
            <span>{localized("Pending", "قيد الانتظار", "ממתין")}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{Number(totalHandledValue).toLocaleString()} {t("common.ils")}</strong>
            <span>{copy.totalValue}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{formatMinutes(todayMinutes)}</strong>
            <span>{copy.today}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{formatMinutes(totalMinutes)}</strong>
            <span>{copy.totalHours}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{avgRating ? `${avgRating} / 5` : copy.noRating}</strong>
            <span>{localized("Avg Rating", "متوسط التقييم", "דירוג ממוצע")}</span>
          </div>
          <div className="admin-metric-card">
            <strong>{approvedReviews.length}</strong>
            <span>{localized("Approved", "مقبول", "מאושר")}</span>
          </div>
        </div>
      </div>
    );
  }

  function renderEmployeeInfo() {
    return (
      <div className="admin-panel-card">
        <div className="admin-section-head">
          <h3>{copy.employeeDetails}</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem 0" }}>
          <div><strong>{t("admin.name")}</strong><p>{employee.name}</p></div>
          <div><strong>{t("admin.email")}</strong><p>{employee.email}</p></div>
          {employee.phone && <div><strong>{t("admin.phone")}</strong><p>{employee.phone}</p></div>}
          <div><strong>{copy.position}</strong><p>{employee.position || "-"}</p></div>
          {employee.department && <div><strong>{copy.department}</strong><p>{employee.department}</p></div>}
          <div><strong>{t("admin.employeeStatus")}</strong><p>{employee.isActive ? copy.active : copy.inactive}</p></div>
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{copy.orderId}</th>
              <th>{copy.dateTime}</th>
              <th>{copy.customerName}</th>
              <th>{copy.phone}</th>
              <th>{copy.status}</th>
              <th>{copy.total}</th>
            </tr>
          </thead>
          <tbody>
            {employeeOrders.length === 0 && (
              <tr><td colSpan={6}>{localized("No orders found", "لا توجد طلبات", "אין הזמנות")}</td></tr>
            )}
            {employeeOrders.map((order) => {
              const custName = order.customer?.name || order.customerName || order.customer_name || "-";
              const custPhone = order.customer?.phone || order.customerPhone || order.customer_phone || "-";
              return (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{formatDateTime(order.createdAt || order.created_at || order.updatedAt || order.updated_at || order.date)}</td>
                  <td>{custName}</td>
                  <td>{custPhone}</td>
                  <td><span className="admin-status-pill">{order.status || "-"}</span></td>
                  <td>{formatOrderValue(order.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderSessions() {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{localized("Date", "التاريخ", "תאריך")}</th>
              <th>{localized("Login", "تسجيل الدخول", "כניסה")}</th>
              <th>{localized("Logout", "تسجيل الخروج", "יציאה")}</th>
              <th>{localized("Duration", "المدة", "משך")}</th>
            </tr>
          </thead>
          <tbody>
            {employeeSessions.length === 0 && (
              <tr><td colSpan={4}>{copy.noSession}</td></tr>
            )}
            {sortedSessions.slice(0, 50).map((session) => {
              const loginTime = session.loginTime ? new Date(session.loginTime) : null;
              const logoutTime = session.logoutTime ? new Date(session.logoutTime) : null;
              const duration = getSessionDuration(session);
              return (
                <tr key={session.id}>
                  <td>{session.date || (loginTime ? loginTime.toLocaleDateString() : "-")}</td>
                  <td>{loginTime ? loginTime.toLocaleTimeString() : "-"}</td>
                  <td>{logoutTime ? logoutTime.toLocaleTimeString() : localized("Active", "نشط", "פעיל")}</td>
                  <td>{formatMinutes(duration)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {employeeSessions.length > 50 && (
          <p style={{ padding: "0.5rem", textAlign: "center", opacity: 0.6 }}>
            {localized("Showing last 50 sessions", "عرض آخر 50 جلسة", "מציג 50 משמרות אחרונות")}
          </p>
        )}
      </div>
    );
  }

  function renderReviews() {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{localized("Customer", "العميل", "לקוח")}</th>
              <th>{localized("Order", "الطلب", "הזמנה")}</th>
              <th>{localized("Rating", "التقييم", "דירוג")}</th>
              <th>{localized("Comment", "التعليق", "תגובה")}</th>
              <th>{localized("Status", "الحالة", "סטטוס")}</th>
              <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
            </tr>
          </thead>
          <tbody>
            {employeeReviews.length === 0 && (
              <tr><td colSpan={6}>{copy.noReviews}</td></tr>
            )}
            {employeeReviews.map((review) => (
              <tr key={review.id}>
                <td>{review.customerName || "-"}</td>
                <td>{review.orderId ? String(review.orderId).slice(-8) : "-"}</td>
                <td>{"★".repeat(Number(review.rating || 0))}</td>
                <td>{typeof review.comment === "object" ? review.comment[language] || review.comment.en || "" : review.comment}</td>
                <td><span className="admin-status-pill">{review.status}</span></td>
                <td>
                  <div className="row-actions">
                    {review.status !== "approved" && (
                      <button className="text-action" onClick={() => handleModerate(review.id, "approved")}>
                        {copy.approve}
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button className="text-action" onClick={() => handleModerate(review.id, "rejected")}>
                        {copy.reject}
                      </button>
                    )}
                    <button className="text-action" onClick={() => handleModerate(review.id, "hidden")}>
                      {copy.hide}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderActivityLog() {
    if (!logsLoaded) {
      return <div className="admin-empty-state"><span>{localized("Loading...", "جارٍ التحميل...", "טוען...")}</span></div>;
    }
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{localized("Date & Time", "التاريخ والوقت", "תאריך ושעה")}</th>
              <th>{localized("Action", "نوع العملية", "פעולה")}</th>
              <th>{localized("Entity", "القسم / العنصر", "ישות")}</th>
              <th>{localized("Details", "التفاصيل", "פרטים")}</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.length === 0 && (
              <tr><td colSpan={4}>{localized("No employee activity logs found", "لا توجد تعديلات مسجلة لهذا الموظف", "לא נמצאו יומני פעילות לעובד זה")}</td></tr>
            )}
            {activityLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.created_at || log.createdAt || log.date)}</td>
                <td>{log.action || "-"}</td>
                <td>{log.entity_type || "-"}{log.entity_id ? ` #${String(log.entity_id).slice(-8)}` : ""}</td>
                <td>{log.changes ? JSON.stringify(log.changes).slice(0, 100) : log.details || log.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="admin-empty-state">
        <strong>{localized("Employee not found", "الموظف غير موجود", "העובד לא נמצא")}</strong>
      </div>
    );
  }

  return (
    <section className="admin-panel-card">
      <div className="admin-section-head">
        <div>
          <button className="text-action" onClick={onBack} type="button" style={{ marginBottom: "0.5rem" }}>
            ← {localized("Back to Staff", "العودة إلى الموظفين", "חזרה לצוות")}
          </button>
          <h2>{employee.name}</h2>
          <p>{employee.position || employee.email}</p>
        </div>
      </div>

      {renderEmployeeInfo()}

      <div className="admin-tabs" style={{ marginTop: "1rem" }}>
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")} type="button">{copy.overview}</button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")} type="button">{copy.orders} ({employeeOrders.length})</button>
        <button className={activeTab === "sessions" ? "active" : ""} onClick={() => setActiveTab("sessions")} type="button">{copy.sessions}</button>
        <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")} type="button">{copy.reviews} ({employeeReviews.length})</button>
        <button className={activeTab === "activity" ? "active" : ""} onClick={() => setActiveTab("activity")} type="button">{copy.activity} ({activityLogs.length})</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "sessions" && renderSessions()}
        {activeTab === "reviews" && renderReviews()}
        {activeTab === "activity" && renderActivityLog()}
      </div>
    </section>
  );
}

export default EmployeePerformanceView;
