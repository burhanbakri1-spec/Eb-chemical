import React from "react";

function formatMinutes(minutes = 0) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
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
  const avgRating = approvedReviews.length
    ? (approvedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / approvedReviews.length).toFixed(1)
    : 0;

  const employeeSessions = sessions.filter((s) => s.employeeId === employee.id);
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = employeeSessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((total, session) => {
    if (session.totalMinutes != null) return total + session.totalMinutes;
    if (session.loginTime) {
      const end = session.logoutTime ? new Date(session.logoutTime) : new Date();
      return total + Math.max(0, Math.round((end - new Date(session.loginTime)) / 60000));
    }
    return total;
  }, 0);
  const totalMinutes = employeeSessions.reduce((total, session) => {
    if (session.totalMinutes != null) return total + session.totalMinutes;
    if (session.loginTime && session.logoutTime) {
      return total + Math.max(0, Math.round((new Date(session.logoutTime) - new Date(session.loginTime)) / 60000));
    }
    return total;
  }, 0);

  const sortedSessions = [...employeeSessions].sort(
    (a, b) => new Date(b.loginTime || 0) - new Date(a.loginTime || 0),
  );
  const lastSession = sortedSessions[0] || null;

  const copy = {
    performance: localized("Performance", "الأداء", "ביצועים"),
    overview: localized("Overview", "نظرة عامة", "סקירה כללית"),
    orders: localized("Orders", "الطلبات", "הזמנות"),
    sessions: localized("Work Sessions", "ساعات العمل", "משמרות עבודה"),
    reviews: localized("Reviews", "التقييمات", "ביקורות"),
    totalOrders: localized("Total Orders", "إجمالي الطلبات", "סך הכל הזמנות"),
    completed: localized("Completed", "مكتمل", "הושלם"),
    pending: localized("Pending", "قيد الانتظار", "ממתין"),
    totalValue: localized("Total Value", "القيمة الإجمالية", "שווי כולל"),
    today: localized("Today", "اليوم", "היום"),
    totalHours: localized("Total Hours", "إجمالي الساعات", "סך הכל שעות"),
    lastSession: localized("Last Session", "آخر جلسة", "משמרת אחרונה"),
    noSession: localized("No sessions recorded", "لا توجد جلسات مسجلة", "אין משמרות"),
    rating: localized("Rating", "التقييم", "דירוג"),
    noReviews: localized("No reviews yet", "لا توجد تقييمات بعد", "אין ביקורות עדיין"),
    approve: localized("Approve", "موافقة", "אשר"),
    reject: localized("Reject", "رفض", "דחה"),
    hide: localized("Hide", "إخفاء", "הסתר"),
    employeeDetails: localized("Employee Details", "تفاصيل الموظف", "פרטי עובד"),
    active: localized("Active", "نشط", "פעיל"),
    inactive: localized("Inactive", "غير نشط", "לא פעיל"),
    department: localized("Department", "القسم", "מחלקה"),
    position: localized("Position", "المنصب", "תפקיד"),
  };

  function renderOverview() {
    return (
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
          <strong>{avgRating} / 5</strong>
          <span>{localized("Avg Rating", "متوسط التقييم", "דירוג ממוצע")}</span>
        </div>
        <div className="admin-metric-card">
          <strong>{approvedReviews.length}</strong>
          <span>{localized("Approved Reviews", "التقييمات المعتمدة", "ביקורות מאושרות")}</span>
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
              <th>{t("admin.orderId")}</th>
              <th>{t("admin.status")}</th>
              <th>{t("admin.total")}</th>
              <th>{localized("Date", "التاريخ", "תאריך")}</th>
            </tr>
          </thead>
          <tbody>
            {employeeOrders.length === 0 && (
              <tr><td colSpan={4}>{localized("No orders found", "لا توجد طلبات", "אין הזמנות")}</td></tr>
            )}
            {employeeOrders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td><span className="admin-status-pill">{order.status || "-"}</span></td>
                <td>{Number(order.total || 0).toLocaleString()} {t("common.ils")}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
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
              let duration = 0;
              if (session.totalMinutes != null) {
                duration = session.totalMinutes;
              } else if (loginTime) {
                const end = logoutTime || new Date();
                duration = Math.max(0, Math.round((end - loginTime) / 60000));
              }
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
              <th>{localized("Rating", "التقييم", "דירוג")}</th>
              <th>{localized("Comment", "التعليق", "תגובה")}</th>
              <th>{localized("Customer", "العميل", "לקוח")}</th>
              <th>{localized("Status", "الحالة", "סטטוס")}</th>
              <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
            </tr>
          </thead>
          <tbody>
            {employeeReviews.length === 0 && (
              <tr><td colSpan={5}>{copy.noReviews}</td></tr>
            )}
            {employeeReviews.map((review) => (
              <tr key={review.id}>
                <td>{"★".repeat(Number(review.rating || 0))}</td>
                <td>{typeof review.comment === "object" ? review.comment[language] || review.comment.en || "" : review.comment}</td>
                <td>{review.customerName || "-"}</td>
                <td><span className="admin-status-pill">{review.status}</span></td>
                <td>
                  <div className="row-actions">
                    {review.status !== "approved" && (
                      <button className="text-action" onClick={() => onModerateReview(review.id, "approved")}>
                        {copy.approve}
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button className="text-action" onClick={() => onModerateReview(review.id, "rejected")}>
                        {copy.reject}
                      </button>
                    )}
                    <button className="text-action" onClick={() => onModerateReview(review.id, "hidden")}>
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
      </div>

      <div style={{ marginTop: "1rem" }}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "sessions" && renderSessions()}
        {activeTab === "reviews" && renderReviews()}
      </div>
    </section>
  );
}

export default EmployeePerformanceView;
