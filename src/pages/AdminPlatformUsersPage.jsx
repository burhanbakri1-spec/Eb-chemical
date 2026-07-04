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

function AccessDenied() {
  return (
    <section className="admin-panel-card company-access-denied" role="alert">
      <ShieldAlert size={28} />
      <div>
        <h2>Access denied</h2>
        <p>Only an explicitly provisioned iGroup Super Admin can manage platform users.</p>
      </div>
    </section>
  );
}

const emptyForm = {
  name: "",
  email: "",
  role: "customer",
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
        else setError(requestError.message || "Unable to load platform users.");
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
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }

    setSavingId(editingUser?.id || "_new");

    try {
      if (editingUser) {
        const changes = {};
        if (form.name !== editingUser.name) changes.name = form.name.trim();
        if (form.email !== editingUser.email) changes.email = form.email.trim().toLowerCase();
        if (form.role !== editingUser.role) changes.role = form.role;
        if (form.phone !== (editingUser.phone || "")) changes.phone = form.phone.trim();
        if (form.department !== (editingUser.department || "")) changes.department = form.department.trim();
        if (form.isActive !== (editingUser.isActive !== false)) changes.isActive = form.isActive;
        if (!Object.keys(changes).length) { setError("No changes to save."); setSavingId(""); return; }
        const saved = await updatePlatformUser(editingUser.id, changes);
        setUsers((current) => current.map((u) => (u.id === saved.id ? saved : u)));
        setSuccess(`${saved.email} updated.`);
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
        setSuccess(`${saved.email} created.`);
        resetForm();
      }
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else if (requestError.status === 403) setError(requestError.message || "Access denied.");
      else setError(requestError.message || "Unable to save user.");
    } finally {
      setSavingId("");
    }
  }

  async function toggleUser(user) {
    if (user.role === "super_admin") return;
    const nextActive = !user.isActive;
    if (!nextActive && !window.confirm(`Disable ${user.email}?`)) return;

    setSavingId(user.id);
    setError("");
    setSuccess("");
    try {
      const saved = await updatePlatformUserStatus(user.id, nextActive);
      setUsers((current) => current.map((entry) => (entry.id === saved.id ? saved : entry)));
      setSuccess(`${saved.email} ${saved.isActive ? "enabled" : "disabled"}.`);
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else if (requestError.status === 403) setError(requestError.message || "Access denied.");
      else setError(requestError.message || "Unable to update user status.");
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
      subtitle="Create, edit, enable, or disable platform users."
      title="Platform Users"
    >
      {accessDenied ? (
        <AccessDenied />
      ) : (
        <div className="company-management-page">
          <div className="admin-toolbar company-toolbar">
            <div>
              <strong>Users across managed tenants</strong>
              <span>{users.length} total</span>
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openNewUser} type="button">
              <Plus size={16} /> New User
            </button>
          </div>

          {error && <div className="message-panel error" role="alert">{error}</div>}
          {success && <div className="message-panel success" role="status">{success}</div>}

          {showForm && (
            <div className="admin-panel-card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <strong>{editingUser ? "Edit User" : "New User"}</strong>
                <button className="text-action" onClick={resetForm} type="button"><X size={16} /></button>
              </div>
              <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <label className="admin-field">
                  <span>Name</span>
                  <input type="text" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Role</span>
                  <select value={form.role} onChange={(e) => handleFormChange("role", e.target.value)}>
                    {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Phone</span>
                  <input type="text" value={form.phone} onChange={(e) => handleFormChange("phone", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Department</span>
                  <input type="text" value={form.department} onChange={(e) => handleFormChange("department", e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Active</span>
                  <select value={form.isActive ? "active" : "inactive"} onChange={(e) => handleFormChange("isActive", e.target.value === "active")}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                {!editingUser && (
                  <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
                    <span>Temporary Password</span>
                    <input type="password" value={form.password} onChange={(e) => handleFormChange("password", e.target.value)} placeholder="Required for new users" />
                  </label>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button className="admin-btn admin-btn-primary" disabled={savingId === (editingUser?.id || "_new")} onClick={handleSave} type="button">
                  {savingId === (editingUser?.id || "_new") ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </button>
                <button className="admin-btn" onClick={resetForm} type="button">Cancel</button>
              </div>
            </div>
          )}

          {isLoading ? (
            <section className="admin-panel-card company-loading" aria-busy="true">Loading users...</section>
          ) : users.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table company-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
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
                        <td>{user.phone || "-"}</td>
                        <td>{user.department || "-"}</td>
                        <td>
                          <span className={`admin-status-pill ${user.isActive ? "active" : "neutral"}`}>
                            {user.isActive ? "Active" : "Inactive"}
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
                              title="Edit user"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="text-action"
                              disabled={isProtected || savingId === user.id}
                              onClick={() => toggleUser(user)}
                              type="button"
                            >
                              {isProtected ? "CLI" : user.isActive ? "Disable" : "Enable"}
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
              <strong>No platform users found</strong>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPlatformUsersPage;