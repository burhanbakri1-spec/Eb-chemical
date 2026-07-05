import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  createCustomModule,
  disableCustomModule,
  updateCustomModule,
} from "../utils/customModulesApi.js";

export const customFieldTypes = [
  "text", "textarea", "number", "date", "datetime", "boolean", "select",
  "multi_select", "url", "email", "phone", "image_url", "file_url",
];

const blankField = (order = 0) => ({
  key: "",
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  optionsText: "",
  showInList: true,
  order,
});

function moduleForm(module) {
  return {
    key: module?.key || "",
    label: module?.label || "",
    description: module?.description || "",
    icon: module?.icon || "folder",
    sidebarOrder: module?.sidebarOrder ?? 100,
    enabled: module?.enabled !== false,
    fieldsSchema: module?.fieldsSchema?.length
      ? module.fieldsSchema.map((field) => ({
          ...field,
          optionsText: (field.options || []).map((option) => `${option.value}:${option.label}`).join("\n"),
        }))
      : [blankField()],
  };
}

function fieldPayload(field, order) {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    placeholder: field.placeholder,
    showInList: field.showInList,
    order,
    options: ["select", "multi_select"].includes(field.type)
      ? field.optionsText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
          const [value, ...label] = line.split(":");
          return { value: value.trim(), label: label.join(":").trim() || value.trim() };
        })
      : [],
  };
}

function AdminCustomModulesPage({
  activePage,
  currentUser,
  customModules,
  customModulesLoaded,
  editingModuleId,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onModulesChanged,
  onNavigate,
  onToggleDarkMode,
}) {
  const editingModule = customModules.find((module) => module.id === editingModuleId) || null;
  const isForm = activePage !== "admin-custom-modules";
  const [form, setForm] = React.useState(() => moduleForm(editingModule));
  const [message, setMessage] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(moduleForm(editingModule));
  }, [editingModuleId, editingModule]);

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

  if (!["admin", "company_admin"].includes(currentUser?.role)) {
    return (
      <AdminLayout {...layoutProps} title="Access denied" subtitle="Company admin access is required.">
        <div className="admin-empty-state">Company admin access is required.</div>
      </AdminLayout>
    );
  }
  if (activePage === "admin-custom-modules-edit" && !customModulesLoaded) {
    return <AdminLayout {...layoutProps} title="Edit Custom Module" subtitle="Loading module configuration…"><div className="admin-empty-state">Loading…</div></AdminLayout>;
  }
  if (activePage === "admin-custom-modules-edit" && !editingModule) {
    return <AdminLayout {...layoutProps} title="Module not found" subtitle="The requested module is unavailable."><div className="admin-empty-state">Custom module not found for this company.</div></AdminLayout>;
  }

  function updateField(index, name, value) {
    setForm((current) => ({
      ...current,
      fieldsSchema: current.fieldsSchema.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [name]: value } : field),
    }));
  }

  function moveField(index, direction) {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.fieldsSchema.length) return current;
      const fieldsSchema = [...current.fieldsSchema];
      [fieldsSchema[index], fieldsSchema[target]] = [fieldsSchema[target], fieldsSchema[index]];
      return { ...current, fieldsSchema };
    });
  }

  async function saveModule(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = {
      ...form,
      fieldsSchema: form.fieldsSchema.map(fieldPayload),
      listConfig: { pageSize: 25 },
      formConfig: { submitLabel: "Save" },
    };
    try {
      if (editingModule) await updateCustomModule(editingModule.id, payload);
      else await createCustomModule(payload);
      await onModulesChanged();
      onNavigate("admin-custom-modules");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleModule(module) {
    setSaving(true);
    setMessage(null);
    try {
      if (module.enabled) await disableCustomModule(module.id);
      else await updateCustomModule(module.id, { ...module, enabled: true });
      await onModulesChanged();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout
      {...layoutProps}
      title={isForm ? editingModule ? "Edit Custom Module" : "New Custom Module" : "Custom Modules"}
      subtitle="Build safe, database-backed admin sections without executable code."
    >
      {message && <div className={`message-panel ${message.type}`}>{message.text}</div>}
      {!isForm ? (
        <section className="admin-panel-card">
          <div className="admin-section-head">
            <div><h2>Module Builder</h2><p>Manage custom sections for this company.</p></div>
            <button className="admin-primary-button" onClick={() => onNavigate("admin-custom-modules-new")} type="button">New Module</button>
          </div>
          {customModules.length ? (
            <div className="custom-modules-list">
              {customModules.map((module) => (
                <article className="custom-module-card" key={module.id}>
                  <div>
                    <strong>{module.label}</strong>
                    <span>{module.description || module.key}</span>
                    <small>{module.fieldsSchema.length} fields · {module.enabled ? "Enabled" : "Disabled"}</small>
                  </div>
                  <div className="custom-module-actions">
                    {module.enabled && <button onClick={() => onNavigate("admin-custom-entry-list", { customModuleKey: module.key })} type="button">Open</button>}
                    <button onClick={() => onNavigate("admin-custom-modules-edit", { moduleId: module.id })} type="button">Edit</button>
                    <button disabled={saving} onClick={() => toggleModule(module)} type="button">{module.enabled ? "Disable" : "Enable"}</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="admin-empty-state">No custom modules yet.</div>}
        </section>
      ) : (
        <form className="admin-panel-card custom-module-builder" onSubmit={saveModule}>
          <div className="company-form">
            <label>Module label<input maxLength="120" required value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} /></label>
            <label>Key / slug<input disabled={Boolean(editingModule)} maxLength="50" pattern="[a-z][a-z0-9_]+" required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} /></label>
            <label>Icon<input maxLength="50" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} /></label>
            <label>Sidebar order<input min="0" max="999" type="number" value={form.sidebarOrder} onChange={(event) => setForm({ ...form, sidebarOrder: Number(event.target.value) })} /></label>
            <label className="full-field">Description<textarea maxLength="500" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label className="custom-checkbox full-field"><input checked={form.enabled} type="checkbox" onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /> Enabled</label>
          </div>
          <div className="admin-section-head"><div><h2>Fields</h2><p>Only the supported declarative field types can be used.</p></div><button onClick={() => setForm((current) => ({ ...current, fieldsSchema: [...current.fieldsSchema, blankField(current.fieldsSchema.length)] }))} type="button">Add Field</button></div>
          <div className="custom-fields-list">
            {form.fieldsSchema.map((field, index) => (
              <div className="custom-field-card" key={`${index}-${field.key}`}>
                <div className="custom-field-grid">
                  <label>Label<input required value={field.label} onChange={(event) => updateField(index, "label", event.target.value)} /></label>
                  <label>Key<input pattern="[a-z][a-z0-9_]+" required value={field.key} onChange={(event) => updateField(index, "key", event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))} /></label>
                  <label>Type<select value={field.type} onChange={(event) => updateField(index, "type", event.target.value)}>{customFieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <label>Placeholder<input value={field.placeholder} onChange={(event) => updateField(index, "placeholder", event.target.value)} /></label>
                  {["select", "multi_select"].includes(field.type) && <label className="full-field">Options (one per line: value:Label)<textarea required value={field.optionsText} onChange={(event) => updateField(index, "optionsText", event.target.value)} /></label>}
                </div>
                <div className="custom-field-actions">
                  <label><input checked={field.required} type="checkbox" onChange={(event) => updateField(index, "required", event.target.checked)} /> Required</label>
                  <label><input checked={field.showInList} type="checkbox" onChange={(event) => updateField(index, "showInList", event.target.checked)} /> Show in list</label>
                  <button disabled={index === 0} onClick={() => moveField(index, -1)} type="button">Up</button>
                  <button disabled={index === form.fieldsSchema.length - 1} onClick={() => moveField(index, 1)} type="button">Down</button>
                  <button disabled={form.fieldsSchema.length === 1} onClick={() => setForm((current) => ({ ...current, fieldsSchema: current.fieldsSchema.filter((_, fieldIndex) => fieldIndex !== index) }))} type="button">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="form-actions"><button onClick={() => onNavigate("admin-custom-modules")} type="button">Cancel</button><button className="admin-primary-button" disabled={saving} type="submit">{saving ? "Saving…" : "Save Module"}</button></div>
        </form>
      )}
    </AdminLayout>
  );
}

export default AdminCustomModulesPage;
