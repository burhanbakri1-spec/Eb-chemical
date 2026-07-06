import React from "react";
import { ShieldAlert, ShieldCheck, X, Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  fetchPlatformCompanies,
  fetchPlatformMemberships,
  createPlatformMembership,
  updatePlatformMembership,
} from "../utils/platformDirectoryApi.js";

const membershipRoles = [
  "super_admin",
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
        <p>{localized("Only an explicitly provisioned iGroup Super Admin can manage memberships.", "فقط مسؤول iGroup المخول يمكنه إدارة العضويات.", "רק מנהל על של iGroup שהוקצה במפורש יכול לנהל חברויות.")}</p>
      </div>
    </section>
  );
}

function AdminPlatformMembershipsPage({
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

  const [memberships, setMemberships] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(currentUser?.role === "super_admin");
  const [savingId, setSavingId] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [accessDenied, setAccessDenied] = React.useState(currentUser?.role !== "super_admin");
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    companyId: "",
    email: "",
    name: "",
    role: "employee",
    isActive: true,
  });

  React.useEffect(() => {
    let active = true;
    if (currentUser?.role !== "super_admin") {
      setAccessDenied(true);
      setIsLoading(false);
      return () => { active = false; };
    }

    async function loadData() {
      try {
        const [membershipsResult, companiesResult] = await Promise.all([
          fetchPlatformMemberships(),
          fetchPlatformCompanies(),
        ]);
        if (active) {
          setMemberships(Array.isArray(membershipsResult) ? membershipsResult : membershipsResult?.memberships || membershipsResult);
          const raw = Array.isArray(companiesResult) ? companiesResult : [];
          setCompanies(raw.map((c) => ({ ...c, _id: c.id || c.companyId || c.company_id })));
        }
      } catch (requestError) {
        if (!active) return;
        if (requestError.status === 401) void onLogout();
        else if (requestError.status === 403) setAccessDenied(true);
        else setError(requestError.message || localized("Unable to load memberships.", "غير قادر على تحميل العضويات.", "לא ניתן לטעון חברויות."));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    setAccessDenied(false);
    void loadData();
    return () => { active = false; };
  }, [currentUser?.role, onLogout]);

  function resetForm() {
    setForm({ companyId: "", email: "", name: "", role: "employee", isActive: true });
    setShowForm(false);
  }

  function openNewMembership() {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    setError("");
    setSuccess("");
    if (!form.companyId) { setError(localized("Company is required.", "الشركة مطلوبة.", "חברה נדרשת.")); return; }
    if (!form.email.trim()) { setError(localized("Email is required.", "البريد الإلكتروني مطلوب.", "אימייל נדרש.")); return; }

    setSavingId("_new");
    try {
      const saved = await createPlatformMembership({
        companyId: form.companyId,
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        role: form.role,
        status: form.isActive ? "active" : "inactive",
      });
      setMemberships((current) => [saved, ...current]);
      setSuccess(localized(`Membership for ${saved.userEmail || saved.email || form.email} created.`, `تم إنشاء العضوية لـ ${saved.userEmail || saved.email || form.email}.`, `חברות עבור ${saved.userEmail || saved.email || form.email} נוצרה.`));
      resetForm();
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else setError(requestError.message || localized("Unable to create membership.", "غير قادر على إنشاء العضوية.", "לא ניתן ליצור חברות."));
    } finally {
      setSavingId("");
    }
  }

  function changeMembership(id, field, value) {
    setMemberships((current) => current.map((m) => (
      m.id === id ? { ...m, [field]: value } : m
    )));
    setSuccess("");
  }

  async function saveMembership(membership) {
    const isProtected = membership.role === "super_admin" || membership.userRole === "super_admin";
    if (isProtected) return;

    setSavingId(membership.id);
    setError("");
    setSuccess("");
    try {
      const saved = await updatePlatformMembership(membership.id, {
        role: membership.role,
        status: membership.isActive ? "active" : "inactive",
      });
      setMemberships((current) => current.map((entry) => (
        entry.id === saved.id ? saved : entry
      )));
      setSuccess(localized(`Membership for ${saved.userEmail || saved.userId} updated.`, `تم تحديث العضوية لـ ${saved.userEmail || saved.userId}.`, `חברות עבור ${saved.userEmail || saved.userId} עודכנה.`));
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else setError(requestError.message || localized("Unable to update membership.", "غير قادر على تحديث العضوية.", "לא ניתן לעדכן חברות."));
    } finally {
      setSavingId("");
    }
  }

  return (
    <AdminLayout
      activePage="admin-platform-memberships"
      currentUser={currentUser}
      isDarkMode={isDarkMode}
      language={language}
      onLanguageChange={onLanguageChange}
      onLogout={onLogout}
      onNavigate={onNavigate}
      onToggleDarkMode={onToggleDarkMode}
      subtitle={loc({ en: "Manage how users belong to tenant companies under iGroup. EB Chemical remains company_id eb-chemical.", ar: "إدارة كيفية انتماء المستخدمين للشركات المستأجرة تحت iGroup. تبقى EB Chemical company_id eb-chemical.", he: "נהל כיצד משתמשים שייכים לחברות דיירים תחת iGroup. EB Chemical נשארת company_id eb-chemical." })}
      title={loc({ en: "Company Memberships", ar: "عضويات الشركة", he: "חברויות חברה" })}
    >
      {accessDenied ? (
        <AccessDenied language={language} />
      ) : (
        <div className="company-management-page">
          <div className="admin-toolbar company-toolbar">
            <div>
              <strong>{localized("Tenant memberships", "عضويات المستأجرين", "חברויות דיירים")}</strong>
              <span>{memberships.length} {localized("total", "الإجمالي", "סה\"כ")}</span>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openNewMembership} type="button">
              <Plus size={16} /> {localized("New Membership", "عضوية جديدة", "חברות חדשה")}
            </button>
          </div>

          {error && <div className="message-panel error" role="alert">{error}</div>}
          {success && <div className="message-panel success" role="status">{success}</div>}

          {showForm && (
            <div className="admin-panel-card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <strong>{localized("New Membership", "عضوية جديدة", "חברות חדשה")}</strong>
                <button className="text-action" onClick={resetForm} type="button"><X size={16} /></button>
              </div>
              <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <label className="admin-field">
                  <span>{localized("Company", "الشركة", "חברה")}</span>
                  <select value={form.companyId} onChange={(e) => handleFormChange("companyId", e.target.value)}>
                    <option value="">{localized("Select company...", "اختر شركة...", "בחר חברה...")}</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c._id})</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>{localized("User Email", "البريد الإلكتروني للمستخدم", "אימייל משתמש")}</span>
                  <input type="email" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} placeholder="user@example.com" />
                </label>
                <label className="admin-field">
                  <span>{localized("Name (optional)", "الاسم (اختياري)", "שם (אופציונלי)")}</span>
                  <input type="text" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} placeholder={localized("Display name", "اسم العرض", "שם לתצוגה")} />
                </label>
                <label className="admin-field">
                  <span>{localized("Membership Role", "دور العضوية", "תפקיד בחברות")}</span>
                  <select value={form.role} onChange={(e) => handleFormChange("role", e.target.value)}>
                    {membershipRoles.filter((r) => r !== "super_admin").map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>{localized("Status", "الحالة", "סטטוס")}</span>
                  <select value={form.isActive ? "active" : "inactive"} onChange={(e) => handleFormChange("isActive", e.target.value === "active")}>
                    <option value="active">{localized("Active", "نشط", "פעיל")}</option>
                    <option value="inactive">{localized("Inactive", "غير نشط", "לא פעיל")}</option>
                  </select>
                </label>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button className="admin-btn admin-btn-primary" disabled={savingId === "_new"} onClick={handleCreate} type="button">
                  {savingId === "_new" ? localized("Creating...", "جار الإنشاء...", "יוצר...") : localized("Create Membership", "إنشاء عضوية", "צור חברות")}
                </button>
                <button className="admin-btn" onClick={resetForm} type="button">{localized("Cancel", "إلغاء", "ביטול")}</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <section className="admin-panel-card company-loading" aria-busy="true">{localized("Loading memberships...", "جار تحميل العضويات...", "טוען חברויות...")}</section>
          ) : memberships.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table company-table">
                <thead>
                  <tr>
                    <th>{localized("Company", "الشركة", "חברה")}</th>
                    <th>{localized("User", "المستخدم", "משתמש")}</th>
                    <th>{localized("User role", "دور المستخدم", "תפקיד משתמש")}</th>
                    <th>{localized("Membership role", "دور العضوية", "תפקיד חברות")}</th>
                    <th>{localized("Status", "الحالة", "סטטוס")}</th>
                    <th>{localized("Created", "تاريخ الإنشاء", "נוצר")}</th>
                    <th>{localized("Updated", "تاريخ التحديث", "עודכן")}</th>
                    <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((membership) => {
                    const isProtected = membership.role === "super_admin" || membership.userRole === "super_admin";
                    return (
                      <tr key={membership.id}>
                        <td>
                          <strong>{membership.companyName || membership.companyId}</strong>
                          <br />
                          <code>{membership.companyId}</code>
                        </td>
                        <td>
                          <strong>{membership.userName || "-"}</strong>
                          <br />
                          <span>{membership.userEmail || membership.userId}</span>
                        </td>
                        <td><code>{membership.userRole}</code></td>
                        <td>
                          <select
                            disabled={isProtected || savingId === membership.id}
                            onChange={(event) => changeMembership(membership.id, "role", event.target.value)}
                            value={membership.role}
                          >
                            {membershipRoles.map((role) => (
                              <option disabled={role === "super_admin" && membership.role !== "super_admin"} key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            disabled={isProtected || savingId === membership.id}
                            onChange={(event) => changeMembership(membership.id, "isActive", event.target.value === "active")}
                            value={membership.isActive ? "active" : "inactive"}
                          >
                            <option value="active">{localized("Active", "نشط", "פעיל")}</option>
                            <option value="inactive">{localized("Inactive", "غير نشط", "לא פעיל")}</option>
                          </select>
                        </td>
                        <td>{formatDate(membership.createdAt)}</td>
                        <td>{formatDate(membership.updatedAt)}</td>
                        <td>
                          <button
                            className="text-action"
                            disabled={isProtected || savingId === membership.id}
                            onClick={() => saveMembership(membership)}
                            type="button"
                          >
                            {isProtected ? localized("CLI managed", "مدار بواسطة CLI", "מנוהל על ידי CLI") : savingId === membership.id ? localized("Saving...", "جار الحفظ...", "שומר...") : localized("Save", "حفظ", "שמור")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <ShieldCheck size={24} />
              <strong>{localized("No memberships found", "لم يتم العثور على عضويات", "לא נמצאו חברויות")}</strong>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPlatformMembershipsPage;
