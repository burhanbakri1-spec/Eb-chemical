import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import EmployeeForm from "../components/EmployeeForm.jsx";
import EmployeeTable from "../components/EmployeeTable.jsx";

function AdminEmployeesPage({
  activePage = "admin-staff",
  currentUser,
  employees,
  isDarkMode,
  language = "en",
  onLanguageChange,
  onDeleteEmployee,
  onLogout,
  onNavigate,
  onSaveEmployee,
  onToggleDarkMode,
  onToggleEmployeeStatus,
  sessions,
  statusMessage,
  t,
}) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const [editingEmployee, setEditingEmployee] = React.useState(null);
  const [localMessage, setLocalMessage] = React.useState(null);
  const [formKey, setFormKey] = React.useState(0);
  const title = activePage === "admin-staff-new"
    ? localized("New Staff Member", "موظف جديد", "חבר צוות חדש")
    : localized("Staff", "الموظفون", "צוות");
  const subtitle = activePage === "admin-staff-new"
    ? localized("Create a staff account", "إنشاء حساب موظف جديد", "צור חשבון צוות")
    : localized("Manage staff accounts, roles, and permissions", "إدارة حسابات الموظفين والأدوار والصلاحيات", "ניהול חשבונות צוות, תפקידים והרשאות");

  const layoutProps = {
    activePage,
    currentUser,
    isDarkMode,
    language,
    onLanguageChange,
    onLogout,
    onNavigate,
    onToggleDarkMode,
  };

  if (currentUser?.role !== "admin") {
    return (
      <AdminLayout {...layoutProps} subtitle={t("admin.adminOnly")} title={t("admin.accessDenied")}>
        <div className="admin-empty-state">
          <strong>{t("admin.accessDenied")}</strong>
          <span>{t("admin.adminOnly")}</span>
        </div>
      </AdminLayout>
    );
  }

  async function handleSave(employee) {
    const result = await onSaveEmployee(employee);

    if (result?.ok) {
      setEditingEmployee(null);
      setFormKey((currentKey) => currentKey + 1);
      setLocalMessage({ type: "success", text: result.message });
      onNavigate("admin-staff");
    } else if (result?.message) {
      setLocalMessage({ type: "error", text: result.message });
    }
  }

  function handleEdit(employee) {
    setEditingEmployee(employee);
    onNavigate("admin-staff-new");
  }

  return (
    <AdminLayout {...layoutProps} subtitle={subtitle} title={title}>
      {(localMessage || statusMessage) && (
        <div className={localMessage?.type === "error" ? "message-panel error" : "message-panel success"}>
          {localMessage?.text || statusMessage}
        </div>
      )}

      {activePage === "admin-staff-new" ? (
        <section className="admin-panel-card">
          <div className="admin-role-info">
            <strong>{localized("Admin", "مسؤول", "מנהל")}</strong>
            <span>{localized("Full access: manage staff, settings, all content, and all operations.", "صلاحية كاملة: إدارة الموظفين والإعدادات وجميع المحتويات والعمليات.", "גישה מלאה: ניהול צוות, הגדרות, כל התוכן וכל הפעולות.")}</span>
            <strong>{localized("Manager", "مدير", "מנהל מחלקה")}</strong>
            <span>{localized("Manage products, orders, customers, reviews, and content. Cannot manage staff or settings.", "إدارة المنتجات والطلبات والعملاء والمراجعات والمحتوى. لا يمكن إدارة الموظفين أو الإعدادات.", "ניהול מוצרים, הזמנות, לקוחות, ביקורות ותוכן. לא יכול לנהל צוות או הגדרות.")}</span>
            <strong>{localized("Employee", "موظف", "עובד")}</strong>
            <span>{localized("View-only access for admin sections and regular employee workspace access.", "وصول للعرض فقط للأقسام الإدارية ووصول منتظم لمساحة عمل الموظف.", "גישת צפייה בלבד לאזורי ניהול וגישת עבודה רגילה לעובד.")}</span>
          </div>
          <EmployeeForm
            editingEmployee={editingEmployee}
            key={formKey}
            onCancel={() => {
              setEditingEmployee(null);
              onNavigate("admin-staff");
            }}
            onSave={handleSave}
            t={t}
          />
        </section>
      ) : (
        <section className="admin-panel-card">
          <div className="admin-section-head">
            <div>
              <h2>{localized("Staff", "الموظفون", "צוות")}</h2>
              <p>{subtitle}</p>
            </div>
            <button className="admin-primary-button" onClick={() => onNavigate("admin-staff-new")} type="button">
              {localized("Add Staff", "إضافة موظف", "הוסף צוות")}
            </button>
          </div>
          <EmployeeTable
            employees={employees}
            onDelete={onDeleteEmployee}
            onEdit={handleEdit}
            onToggleStatus={onToggleEmployeeStatus}
            sessions={sessions}
            t={t}
          />
        </section>
      )}
    </AdminLayout>
  );
}

export default AdminEmployeesPage;
