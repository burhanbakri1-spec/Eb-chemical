import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  fetchPlatformMemberships,
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

    async function loadMemberships() {
      try {
        const result = await fetchPlatformMemberships();
        if (active) setMemberships(result);
      } catch (requestError) {
        if (!active) return;
        if (requestError.status === 401) void onLogout();
        else if (requestError.status === 403) setAccessDenied(true);
        else setError(requestError.message || "Unable to load platform memberships.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    setAccessDenied(false);
    void loadMemberships();
    return () => {
      active = false;
    };
  }, [currentUser?.role, onLogout]);

  function changeMembership(id, field, value) {
    setMemberships((current) => current.map((membership) => (
      membership.id === id ? { ...membership, [field]: value } : membership
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
          </div>

          {error && <div className="message-panel error" role="alert">{error}</div>}
          {success && <div className="message-panel success" role="status">{success}</div>}

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
