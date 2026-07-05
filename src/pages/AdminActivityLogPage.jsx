import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { fetchActivityLogs } from "../utils/activityLogApi.js";

function formatTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function AdminActivityLogPage({
  activePage,
  currentUser,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  onToggleDarkMode,
}) {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filters, setFilters] = React.useState({ action: "", entity_type: "", actor_email: "" });
  const [selectedLog, setSelectedLog] = React.useState(null);
  const limit = 50;

  async function load(p = page) {
    setLoading(true);
    setMessage(null);
    try {
      const params = { limit, page: p };
      if (filters.action) params.action = filters.action;
      if (filters.entity_type) params.entity_type = filters.entity_type;
      if (filters.actor_email) params.actor_email = filters.actor_email;
      const result = await fetchActivityLogs(params);
      setLogs(result.logs || []);
      setTotal(result.total || 0);
      setPage(result.page || 1);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void load(1); }, []);

  function applyFilters() {
    setPage(1);
    void load(1);
  }

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function viewDetails(log) {
    setSelectedLog(log);
  }

  function closeDetails() {
    setSelectedLog(null);
  }

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };

  return (
    <AdminLayout {...layoutProps} title="Activity Log" subtitle="Administrative activity history">
      <div className="admin-invoices-page">
        {message && (
          <div className={`message-panel ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
            <button className="message-dismiss" type="button" onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="admin-section-head" style={{ flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h2>Activity Logs</h2>
            <span style={{ fontSize: "13px", color: "#888" }}>{total} entries</span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              style={{ minHeight: "32px", fontSize: "13px" }}
            >
              <option value="">All actions</option>
              <option value="invoice.created">invoice.created</option>
              <option value="invoice.updated">invoice.updated</option>
              <option value="invoice.voided">invoice.voided</option>
              <option value="delivery_zone.created">delivery_zone.created</option>
              <option value="delivery_zone.updated">delivery_zone.updated</option>
              <option value="delivery_zone.deleted">delivery_zone.deleted</option>
              <option value="delivery_zone.enabled_changed">delivery_zone.enabled_changed</option>
              <option value="custom_module.created">custom_module.created</option>
              <option value="custom_module.updated">custom_module.updated</option>
              <option value="custom_module.disabled">custom_module.disabled</option>
              <option value="custom_module_entry.created">custom_module_entry.created</option>
              <option value="custom_module_entry.updated">custom_module_entry.updated</option>
              <option value="custom_module_entry.deleted">custom_module_entry.deleted</option>
              <option value="order.created">order.created</option>
              <option value="order.status_updated">order.status_updated</option>
              <option value="product.created">product.created</option>
              <option value="product.updated">product.updated</option>
              <option value="product.deleted">product.deleted</option>
              <option value="product.visibility_changed">product.visibility_changed</option>
            </select>
            <select
              value={filters.entity_type}
              onChange={(e) => handleFilterChange("entity_type", e.target.value)}
              style={{ minHeight: "32px", fontSize: "13px" }}
            >
              <option value="">All entity types</option>
              <option value="invoice">invoice</option>
              <option value="delivery_zone">delivery_zone</option>
              <option value="custom_module">custom_module</option>
              <option value="custom_module_entry">custom_module_entry</option>
              <option value="order">order</option>
              <option value="product">product</option>
            </select>
            <input
              type="text"
              value={filters.actor_email}
              onChange={(e) => handleFilterChange("actor_email", e.target.value)}
              placeholder="Filter by email"
              style={{ minHeight: "32px", fontSize: "13px", width: "160px" }}
            />
            <button className="admin-primary-button" onClick={applyFilters} type="button">Filter</button>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="admin-empty-state">
            <strong>No activity logs found</strong>
            <p>Activity will appear here as admin actions are performed.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity Label</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => viewDetails(log)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ whiteSpace: "nowrap", fontSize: "13px" }}>{formatTime(log.created_at)}</td>
                    <td>{log.actor_name || log.actor_email || log.actor_user_id}</td>
                    <td><code style={{ fontSize: "12px", background: "#f0f0f0", padding: "2px 6px", borderRadius: "3px" }}>{log.action}</code></td>
                    <td>{log.entity_type}</td>
                    <td>{log.entity_label}</td>
                    <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
            <button
              className="secondary-action"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              type="button"
            >
              Previous
            </button>
            <span style={{ padding: "4px 8px", fontSize: "13px" }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="secondary-action"
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        )}

        {selectedLog && (
          <div className="admin-modal-backdrop" onClick={closeDetails}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
              <div className="admin-modal-header">
                <h3>Activity Log Detail</h3>
                <button className="admin-modal-close" onClick={closeDetails} type="button">&times;</button>
              </div>
              <div className="admin-modal-body" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                <div><strong>Date/Time:</strong> {formatTime(selectedLog.created_at)}</div>
                <div><strong>Actor:</strong> {selectedLog.actor_name} ({selectedLog.actor_email}) [{selectedLog.actor_role}]</div>
                <div><strong>Action:</strong> <code>{selectedLog.action}</code></div>
                <div><strong>Entity Type:</strong> {selectedLog.entity_type}</div>
                <div><strong>Entity ID:</strong> {selectedLog.entity_id}</div>
                <div><strong>Entity Label:</strong> {selectedLog.entity_label}</div>
                <div><strong>Summary:</strong> {selectedLog.summary}</div>
                {selectedLog.ip_address && <div><strong>IP:</strong> {selectedLog.ip_address}</div>}

                {selectedLog.before_data && (
                  <div style={{ marginTop: "12px" }}>
                    <strong>Before Data:</strong>
                    <pre style={{ background: "#f4f4f4", padding: "8px", borderRadius: "4px", fontSize: "12px", maxHeight: "200px", overflow: "auto", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(selectedLog.before_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.after_data && (
                  <div style={{ marginTop: "12px" }}>
                    <strong>After Data:</strong>
                    <pre style={{ background: "#f4f4f4", padding: "8px", borderRadius: "4px", fontSize: "12px", maxHeight: "200px", overflow: "auto", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(selectedLog.after_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div style={{ marginTop: "12px" }}>
                    <strong>Metadata:</strong>
                    <pre style={{ background: "#f4f4f4", padding: "8px", borderRadius: "4px", fontSize: "12px", maxHeight: "200px", overflow: "auto", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminActivityLogPage;
