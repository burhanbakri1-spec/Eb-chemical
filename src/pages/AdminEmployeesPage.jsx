import React from "react";
import EmployeeForm from "../components/EmployeeForm.jsx";
import EmployeeTable from "../components/EmployeeTable.jsx";

function AdminEmployeesPage({
  currentUser,
  employees,
  onDeleteEmployee,
  onNavigate,
  onSaveEmployee,
  onToggleEmployeeStatus,
  sessions,
  statusMessage,
  t,
}) {
  const [editingEmployee, setEditingEmployee] = React.useState(null);
  const [localMessage, setLocalMessage] = React.useState(null);
  const [formKey, setFormKey] = React.useState(0);

  if (currentUser?.role !== "admin") {
    return (
      <section className="page-shell">
        <div className="empty-panel">
          <h1>{t("admin.accessDenied")}</h1>
          <p>{t("admin.adminOnly")}</p>
          <button className="primary-action" onClick={() => onNavigate("login")}>
            {t("auth.login")}
          </button>
        </div>
      </section>
    );
  }

  async function handleSave(employee) {
    const result = await onSaveEmployee(employee);

    if (result?.ok) {
      setEditingEmployee(null);
      setFormKey((currentKey) => currentKey + 1);
      setLocalMessage({ type: "success", text: result.message });
    } else if (result?.message) {
      setLocalMessage({ type: "error", text: result.message });
    }
  }

  return (
    <section className="page-shell admin-page">
      <div className="page-heading">
        <p className="eyebrow">{t("admin.employees")}</p>
        <h1>{t("admin.employeesManagement")}</h1>
      </div>

      {(localMessage || statusMessage) && (
        <div
          className={
            localMessage?.type === "error"
              ? "message-panel error"
              : "message-panel success"
          }
        >
          {localMessage?.text || statusMessage}
        </div>
      )}

      <EmployeeForm
        editingEmployee={editingEmployee}
        key={formKey}
        onCancel={() => setEditingEmployee(null)}
        onSave={handleSave}
        t={t}
      />
      <EmployeeTable
        employees={employees}
        onDelete={onDeleteEmployee}
        onEdit={setEditingEmployee}
        onToggleStatus={onToggleEmployeeStatus}
        sessions={sessions}
        t={t}
      />
    </section>
  );
}

export default AdminEmployeesPage;
