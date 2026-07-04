import React from "react";
import { ShieldAlert, Users } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  fetchPlatformUsers,
  updatePlatformUserStatus,
} from "../utils/platformDirectoryApi.js";

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
        <p>Only an explicitly provisioned iGroup Super Admin can view platform users.</p>
      </div>
    </section>
  );
}

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

  React.useEffect(() => {
    let active = true;
    if (currentUser?.role !== "super_admin") {
      setAccessDenied(true);
      setIsLoading(false);
      return () => {
        active = false;
      };
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
    return () => {
      active = false;
    };
  }, [currentUser?.role, onLogout]);

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
      subtitle="Platform identities managed by iGroup. Roles remain read-only until membership-based authorization is universal."
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
          </div>

          {error && <div className="message-panel error" role="alert">{error}</div>}
          {success && <div className="message-panel success" role="status">{success}</div>}

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
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
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
                        <td>
                          <span className={`admin-status-pill ${user.isActive ? "active" : "neutral"}`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.updatedAt)}</td>
                        <td>
                          <button
                            className="text-action"
                            disabled={isProtected || savingId === user.id}
                            onClick={() => toggleUser(user)}
                            type="button"
                          >
                            {isProtected ? "CLI managed" : user.isActive ? "Disable" : "Enable"}
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
