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

function AccessDenied() {
  return (
    <section className="admin-panel-card company-access-denied" role="alert">
      <ShieldAlert size={28} />
      <div>
        <h2>Access denied</h2>
        <p>Only an explicitly provisioned iGroup Super Admin can manage memberships.</p>
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
        else setError(requestError.message || "Unable to load memberships.");
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
    if (!form.companyId) { setError("Company is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }

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
      setSuccess(`Membership for ${saved.userEmail || saved.email || form.email} created.`);
      resetForm();
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else setError(requestError.message || "Unable to create membership.");
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
      setSuccess(`Membership for ${saved.userEmail || saved.userId} updated.`);
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else setError(requestError.message || "Unable to update membership.");
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
      subtitle="Manage how users belong to tenant companies under iGroup. EB Chemical remains company_id eb-chemical."
      title="Company Memberships"
    >
      {accessDenied ? (
        <AccessDenied />
      ) : (
        <div className="company-management-page">
          <div className="admin-toolbar company-toolbar">
            <div>
              <strong>Tenant memberships</strong>
              <span>{memberships.length} total</span>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openNewMembership} type="button">
              <Plus size={16} /> New Membership
            </button>
          </div>

          {error && <div className="message-panel error" role="alert">{error}</div>}
          {success && <div className="message-panel success" role="status">{success}</div>}

          {showForm && (
            <div className="admin-panel-card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <strong>New Membership</strong>
                <button className="text-action" onClick={resetForm} type="button"><X size={16} /></button>
              </div>
              <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <label className="admin-field">
                  <span>Company</span>
                  <select value={form.companyId} onChange={(e) => handleFormChange("companyId", e.target.value)}>
                    <option value="">Select company...</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c._id})</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>User Email</span>
                  <input type="email" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} placeholder="user@example.com" />
                </label>
                <label className="admin-field">
                  <span>Name (optional)</span>
                  <input type="text" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} placeholder="Display name" />
                </label>
                <label className="admin-field">
                  <span>Membership Role</span>
                  <select value={form.role} onChange={(e) => handleFormChange("role", e.target.value)}>
                    {membershipRoles.filter((r) => r !== "super_admin").map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Status</span>
                  <select value={form.isActive ? "active" : "inactive"} onChange={(e) => handleFormChange("isActive", e.target.value === "active")}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button className="admin-btn admin-btn-primary" disabled={savingId === "_new"} onClick={handleCreate} type="button">
                  {savingId === "_new" ? "Creating..." : "Create Membership"}
                </button>
                <button className="admin-btn" onClick={resetForm} type="button">Cancel</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <section className="admin-panel-card company-loading" aria-busy="true">Loading memberships...</section>
          ) : memberships.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table company-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>User</th>
                    <th>User role</th>
                    <th>Membership role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                            {isProtected ? "CLI managed" : savingId === membership.id ? "Saving..." : "Save"}
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
              <strong>No memberships found</strong>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPlatformMembershipsPage;