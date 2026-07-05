import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  createCustomModuleEntry,
  deleteCustomModuleEntry,
  fetchCustomModuleEntries,
  fetchCustomModuleEntry,
  updateCustomModuleEntry,
} from "../utils/customModulesApi.js";

function emptyData(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, field.type === "boolean" ? false : field.type === "multi_select" ? [] : ""]));
}

function dataForSchema(fields, source = {}) {
  const defaults = emptyData(fields);
  return Object.fromEntries(fields.map((field) => [
    field.key,
    Object.prototype.hasOwnProperty.call(source, field.key) ? source[field.key] : defaults[field.key],
  ]));
}

function displayValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value == null || value === "" ? "—" : String(value);
}

function EntryField({ field, value, onChange }) {
  const common = { id: `custom-entry-${field.key}`, name: field.key, required: field.required };
  if (field.type === "textarea") return <textarea {...common} placeholder={field.placeholder} value={value || ""} onChange={(event) => onChange(event.target.value)} />;
  if (field.type === "boolean") return <input {...common} checked={value === true} type="checkbox" onChange={(event) => onChange(event.target.checked)} />;
  if (field.type === "select") return <select {...common} value={value || ""} onChange={(event) => onChange(event.target.value)}><option value="">Select…</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  if (field.type === "multi_select") return (
    <select {...common} multiple value={Array.isArray(value) ? value : []} onChange={(event) => onChange([...event.target.selectedOptions].map((option) => option.value))}>
      {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
  const type = field.type === "datetime" ? "datetime-local" : ["text", "number", "date", "email", "url"].includes(field.type) ? field.type : "text";
  return <input {...common} placeholder={field.placeholder} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />;
}

function AdminCustomModuleEntriesPage({
  activePage,
  currentUser,
  customModuleKey,
  customModules,
  customModulesLoaded,
  editingEntryId,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  onToggleDarkMode,
}) {
  const module = customModules.find((item) => item.key === customModuleKey && item.enabled !== false);
  const isForm = activePage !== "admin-custom-entry-list";
  const canManage = ["admin", "company_admin"].includes(currentUser?.role)
    || module?.permissions?.manage?.some((permission) => currentUser?.permissions?.includes(permission));
  const [entries, setEntries] = React.useState([]);
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!module) return;
      setLoading(true);
      setMessage(null);
      try {
        if (isForm) {
          const entry = editingEntryId ? await fetchCustomModuleEntry(module.id, editingEntryId) : null;
          if (!cancelled) setData(dataForSchema(module.fieldsSchema, entry?.data));
        } else {
          const result = await fetchCustomModuleEntries(module.id);
          if (!cancelled) setEntries(result);
        }
      } catch (error) {
        if (!cancelled) setMessage({ type: "error", text: error.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [editingEntryId, isForm, module]);

  const layoutProps = { activePage, currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };
  if (!customModulesLoaded) {
    return <AdminLayout {...layoutProps} title="Custom Module" subtitle="Loading module configuration…"><div className="admin-empty-state">Loading…</div></AdminLayout>;
  }
  if (!module) {
    return <AdminLayout {...layoutProps} title="Module unavailable" subtitle="This custom module is disabled or unavailable."><div className="admin-empty-state">Module not enabled for this company.</div></AdminLayout>;
  }
  if (isForm && !canManage) {
    return <AdminLayout {...layoutProps} title="Access denied" subtitle="Write permission is required."><div className="admin-empty-state">You can view this module, but cannot change its records.</div></AdminLayout>;
  }

  async function saveEntry(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (editingEntryId) await updateCustomModuleEntry(module.id, editingEntryId, data);
      else await createCustomModuleEntry(module.id, data);
      onNavigate("admin-custom-entry-list", { customModuleKey });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(entry) {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteCustomModuleEntry(module.id, entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  const listFields = module.fieldsSchema.filter((field) => field.showInList).slice(0, 8);
  return (
    <AdminLayout {...layoutProps} title={isForm ? `${editingEntryId ? "Edit" : "New"} ${module.label}` : module.label} subtitle={module.description || `Manage ${module.label} records.`}>
      {message && <div className={`message-panel ${message.type}`}>{message.text}</div>}
      {loading ? <div className="admin-empty-state">Loading…</div> : isForm ? (
        <form className="admin-panel-card custom-entry-form" onSubmit={saveEntry}>
          <div className="company-form">
            {module.fieldsSchema.map((field) => (
              <label className={["textarea", "multi_select"].includes(field.type) ? "full-field" : ""} key={field.key} htmlFor={`custom-entry-${field.key}`}>
                {field.label}{field.required ? " *" : ""}
                <EntryField field={field} value={data[field.key]} onChange={(value) => setData((current) => ({ ...current, [field.key]: value }))} />
              </label>
            ))}
          </div>
          <div className="form-actions"><button onClick={() => onNavigate("admin-custom-entry-list", { customModuleKey })} type="button">Cancel</button><button className="admin-primary-button" disabled={saving} type="submit">{saving ? "Saving…" : module.formConfig?.submitLabel || "Save"}</button></div>
        </form>
      ) : (
        <section className="admin-panel-card">
          <div className="admin-section-head"><div><h2>{module.label}</h2><p>{entries.length} records</p></div>{canManage && <button className="admin-primary-button" onClick={() => onNavigate("admin-custom-entry-new", { customModuleKey })} type="button">Add Entry</button>}</div>
          {entries.length ? (
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{listFields.map((field) => <th key={field.key}>{field.label}</th>)}{canManage && <th>Actions</th>}</tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}>{listFields.map((field) => <td key={field.key}>{displayValue(entry.data[field.key])}</td>)}{canManage && <td><div className="custom-module-actions"><button onClick={() => onNavigate("admin-custom-entry-edit", { customModuleKey, entryId: entry.id })} type="button">Edit</button><button onClick={() => removeEntry(entry)} type="button">Delete</button></div></td>}</tr>)}</tbody></table></div>
          ) : <div className="admin-empty-state">No records yet.</div>}
        </section>
      )}
    </AdminLayout>
  );
}

export default AdminCustomModuleEntriesPage;
