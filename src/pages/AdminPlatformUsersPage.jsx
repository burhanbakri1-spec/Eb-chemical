import React from "react";
import { ShieldAlert, Users, X, Plus, Pencil, Check } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  fetchPlatformUsers,
  createPlatformUser,
  updatePlatformUser,
  updatePlatformUserStatus,
} from "../utils/platformDirectoryApi.js";

const availableRoles = [
  "admin",
  "manager",
  "company_admin",
  "employee",
  "staff",
  "customer",
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function AccessDenied({ language = "en" }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  return (
    <section className="admin-panel-card company-access-denied" role="alert">
      <ShieldAlert size={28} />
      <div>
        <h2>{localized("Access denied", "الوصول مرفوض", "גישה נדחתה")}</h2>
        <p>{localized("Only an explicitly provisioned iGroup Super Admin can manage platform users.", "فقط مسؤول iGroup المخول يمكنه إدارة مستخدمي المنصة.", "רק מנהל על של iGroup שהוקצה במפורש יכול לנהל משתמשי פלטפורמה.")}</p>
      </div>
    </section>
  );
}

const emptyForm = {
  name: "",
  email: "",
  role: "customer",
  accountType: "retail",
  phone: "",
  department: "",
  password: "",
  isActive: true,
};

function AdminPlatformUsersPage({
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

  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(currentUser?.role === "super_admin");
  const [savingId, setSavingId] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [accessDenied, setAccessDenied] = React.useState(currentUser?.role !== "super_admin");
  const [showForm, setShowForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    let active = true;
    if (currentUser?.role !== "super_admin") {
      setAccessDenied(true);
      setIsLoading(false);
      return () => { active = false; };
    }

    async function loadUsers() {
      try {
        const result = await fetchPlatformUsers();
        if (active) setUsers(result);
      } catch (requestError) {
        if (!active) return;
        if (requestError.status === 401) void onLogout();
        else if (requestError.status === 403) setAccessDenied(true);
        else setError(requestError.message || localized("Unable to load platform users.", "غير قادر على تحميل مستخدمي المنصة.", "לא ניתן לטעון משתמשי פלטפורמה."));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    setAccessDenied(false);
    void loadUsers();
    return () => { active = false; };
  }, [currentUser?.role, onLogout]);

  function resetForm() {
    setForm(emptyForm);
    setEditingUser(null);
    setShowForm(false);
  }

  function openNewUser() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditUser(user) {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "customer",
      accountType: user.accountType || "retail",
      phone: user.phone || "",
      department: user.department || "",
      password: "",
      isActive: user.isActive !== false,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    if (!form.name.trim()) { setError(localized("Name is required.", "الاسم مطلوب.", "שם נדרש.")); return; }
    if (!form.email.trim()) { setError(localized("Email is required.", "البريد الإلكتروني مطلوب.", "אימייל נדרש.")); return; }

    setSavingId(editingUser?.id || "_new");

    try {
      if (editingUser) {
        const changes = {};
        if (form.name !== editingUser.name) changes.name = form.name.trim();
        if (form.email !== editingUser.email) changes.email = form.email.trim().toLowerCase();
        if (form.role !== editingUser.role) changes.role = form.role;
        if (form.accountType !== (editingUser.accountType || "retail")) changes.accountType = form.accountType;
        if (form.phone !== (editingUser.phone || "")) changes.phone = form.phone.trim();
        if (form.department !== (editingUser.department || "")) changes.department = form.department.trim();
        if (form.isActive !== (editingUser.isActive !== false)) changes.isActive = form.isActive;
        if (!Object.keys(changes).length) { setError(localized("No changes to save.", "لا توجد تغييرات للحفظ.", "אין שינויים לשמירה.")); setSavingId(""); return; }
        const saved = await updatePlatformUser(editingUser.id, changes);
        setUsers((current) => current.map((u) => (u.id === saved.id ? saved : u)));
        setSuccess(localized(`${saved.email} updated.`, `${saved.email} تم التحديث.`, `${saved.email} עודכן.`));
        resetForm();
      } else {
        const saved = await createPlatformUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          phone: form.phone.trim(),
          department: form.department.trim(),
          password: form.password,
          isActive: form.isActive,
        });
        setUsers((current) => [saved, ...current]);
        setSuccess(localized(`${saved.email} created.`, `${saved.email} تم الإنشاء.`, `${saved.email} נוצר.`));
        resetForm();
      }
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else if (requestError.status === 403) setError(requestError.message || localized("Access denied.", "الوصول مرفوض.", "גישה נדחתה."));
      else setError(requestError.message || localized("Unable to save user.", "غير قادر على حفظ المستخدم.", "לא ניתן לשמור משתמש."));
    } finally {
      setSavingId("");
    }
  }

  async function toggleUser(user) {
    if (user.role === "super_admin") return;
    const nextActive = !user.isActive;
    if (!nextActive && !window.confirm(localized(`Disable ${user.email}?`, `تعطيل ${user.email}؟`, `להשבית ${user.email}?`))) return;

    setSavingId(user.id);
    setError("");
    setSuccess("");
    try {
      const saved = await updatePlatformUserStatus(user.id, nextActive);
      setUsers((current) => current.map((entry) => (entry.id === saved.id ? saved : entry)));
      setSuccess(localized(`${saved.email} ${saved.isActive ? "enabled" : "disabled"}.`, `${saved.email} ${saved.isActive ? "تم التفعيل" : "تم التعطيل"}.`, `${saved.email} ${saved.isActive ? "הופעל" : "הושבת"}.`));
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else if (requestError.status === 403) setError(requestError.message || localized("Access denied.", "الوصول مرفوض.", "גישה נדחתה."));
      else setError(requestError.message || localized("Unable to update user status.", "غير قادر على تحديث حالة المستخدم.", "לא ניתן לעדכן סטטוס משתמש."));
    } finally {
      setSavingId("");
    }
  }

  return (
    <AdminLayout
      activePage="admin-platform-users"
      currentUser={currentUser}
      isDarkMode={isDarkMode}
      language={language}
      onLanguageChange={onLanguageChange}
      onLogout={onLogout}
      onNavigate={onNavigate}
      onToggleDarkMode={onToggleDarkMode}
      subtitle={loc({ en: "Create, edit, enable, or disable platform users.", ar: "إنشاء أو تعديل أو تفعيل أو تعطيل مستخدمي المنصة.", he: "צור, ערוך, הפעל או השבת משתמשי פלטפורמה." })}
      title={loc({ en: "Platform Users", ar: "مستخدمو المنصة", he: "משתמשי פלטפורמה" })}
    >
      {accessDenied ? (
        <AccessDenied language={language} />
      ) : (
        <div className="company-management-page">
          <div className="admin-toolbar company-toolbar">
            <div>
              <strong>{localized("Users across managed tenants", "المستخدمون عبر المستأجرين المُدارين", "משתמשים בכל הדיירים המנוהלים")}</strong>
              <span>{users.length} {localized("total", "الإجمالي", "סה\"כ")}</span>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openNewUser} type="button">
              <Plus size={16} /> {localized("New User", "مستخدم جديد", "משתמש חדש")}
            </button>
          </div>

          {error && <div className="message-panel error" role="alert">{error}</div>}
          {success && <div className="message-panel success" role="status">{success}</div>}

          {showForm && (
            <div className="admin-panel-card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <strong>{editingUser ? localized("Edit User", "تعديل المستخدم", "ערוך משתמש") : localized("New User", "مستخدم جديد", "משתמש חדש")}</strong>
                <button className="text-action" onClick={resetForm} type="button"><X size={16} /></button>
              </div>
              <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <label className="admin-field">
                  <span>{localized("Name", "الاسم", "שם")}</span>
                  <input type="text" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>{localized("Email", "البريد الإلكتروني", "אימייל")}</span>
                  <input type="email" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>{localized("Role", "الدور", "תפקיד")}</span>
                  <select value={form.role} onChange={(e) => handleFormChange("role", e.target.value)}>
                    {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label className="admin-field">
                  <span>{localized("Account Type", "نوع الحساب", "סוג חשבון")}</span>
                  <select value={form.accountType} onChange={(e) => handleFormChange("accountType", e.target.value)}>
                    <option value="retail">retail</option>
                    <option value="trader">trader</option>
                    <option value="wholesale">wholesale</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>{localized("Phone", "الهاتف", "טלפון")}</span>
                  <input type="text" value={form.phone} onChange={(e) => handleFormChange("phone", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>{localized("Department", "القسم", "מחלקה")}</span>
                  <input type="text" value={form.department} onChange={(e) => handleFormChange("department", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>{localized("Active", "نشط", "פעיל")}</span>
                  <select value={form.isActive ? "active" : "inactive"} onChange={(e) => handleFormChange("isActive", e.target.value === "active")}>
                    <option value="active">{localized("Active", "نشط", "פעיל")}</option>
                    <option value="inactive">{localized("Inactive", "غير نشط", "לא פעיל")}</option>
                  </select>
                </label>
                {!editingUser && (
                  <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
                    <span>{localized("Temporary Password", "كلمة مرور مؤقتة", "סיסמה זמנית")}</span>
                    <input type="password" value={form.password} onChange={(e) => handleFormChange("password", e.target.value)} placeholder={localized("Required for new users", "مطلوب للمستخدمين الجدد", "נדרש למשתמשים חדשים")} />
                  </label>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button className="admin-btn admin-btn-primary" disabled={savingId === (editingUser?.id || "_new")} onClick={handleSave} type="button">
                  {savingId === (editingUser?.id || "_new") ? localized("Saving...", "جار الحفظ...", "שומר...") : editingUser ? localized("Update User", "تحديث المستخدم", "עדכן משתמש") : localized("Create User", "إنشاء مستخدم", "צור משתמש")}
                </button>
                <button className="admin-btn" onClick={resetForm} type="button">{localized("Cancel", "إلغاء", "ביטול")}</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <section className="admin-panel-card company-loading" aria-busy="true">{localized("Loading users...", "جار تحميل المستخدمين...", "טוען משתמשים...")}</section>
          ) : users.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table company-table">
                <thead>
                  <tr>
                    <th>{localized("Name", "الاسم", "שם")}</th>
                    <th>{localized("Email", "البريد الإلكتروني", "אימייל")}</th>
                    <th>{localized("Role", "الدور", "תפקיד")}</th>
                    <th>{localized("Account Type", "نوع الحساب", "סוג חשבון")}</th>
                    <th>{localized("Phone", "الهاتف", "טלפון")}</th>
                    <th>{localized("Department", "القسم", "מחלקה")}</th>
                    <th>{localized("Status", "الحالة", "סטטוס")}</th>
                    <th>{localized("Created", "تاريخ الإنشاء", "נוצר")}</th>
                    <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isProtected = user.role === "super_admin";
                    return (
                      <tr key={user.id}>
                        <td><strong>{user.name || "-"}</strong></td>
                        <td>{user.email || "-"}</td>
                        <td><code>{user.role}</code></td>
                        <td>{user.accountType || "retail"}</td>
                        <td>{user.phone || "-"}</td>
                        <td>{user.department || "-"}</td>
                        <td>
                          <span className={`admin-status-pill ${user.isActive ? "active" : "neutral"}`}>
                            {user.isActive ? localized("Active", "نشط", "פעיל") : localized("Inactive", "غير نشط", "לא פעיל")}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <button
                              className="text-action"
                              disabled={savingId === user.id}
                              onClick={() => openEditUser(user)}
                              type="button"
                              title={localized("Edit user", "تعديل المستخدم", "ערוך משתמש")}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="text-action"
                              disabled={isProtected || savingId === user.id}
                              onClick={() => toggleUser(user)}
                              type="button"
                            >
                              {isProtected ? "CLI" : user.isActive ? localized("Disable", "تعطيل", "השבת") : localized("Enable", "تفعيل", "הפעל")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <Users size={24} />
              <strong>{localized("No platform users found", "لم يتم العثور على مستخدمي منصة", "לא נמצאו משתמשי פלטפורמה")}</strong>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPlatformUsersPage;
