import React from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  productFieldTypes,
  productTabKeys,
} from "../data/productSchema.js";
import { updateProductSchema } from "../utils/productSchemaApi.js";

function newField(tab = "custom_sections", index = 0) {
  return {
    key: `custom_field_${Date.now()}_${index}`,
    tab,
    label: { en: "New Field", ar: "حقل جديد" },
    type: "text",
    required: false,
    enabled: true,
    storefrontVisible: true,
    protected: false,
    sortOrder: (index + 1) * 10,
    defaultValue: "",
    options: [],
  };
}

function FieldEditor({ fields, forcedTab, onChange, title }) {
  function update(index, changes) {
    onChange(fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...changes } : field));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((field, fieldIndex) => ({ ...field, sortOrder: (fieldIndex + 1) * 10 })));
  }

  return (
    <section className="product-schema-group">
      <div className="admin-section-head">
        <div><h2>{title}</h2><p>Configure labels, visibility, type, and order.</p></div>
        <button type="button" onClick={() => onChange([...fields, newField(forcedTab || "custom_sections", fields.length)])}>Add Field</button>
      </div>
      <div className="product-schema-fields">
        {fields.map((field, index) => (
          <article className="product-schema-field" key={`${field.key}-${index}`}>
            <div className="product-schema-field-grid">
              <label>Key<input disabled={field.protected} value={field.key} onChange={(event) => update(index, { key: event.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} /></label>
              {!forcedTab && <label>Tab<select disabled={field.protected} value={field.tab} onChange={(event) => update(index, { tab: event.target.value })}>{productTabKeys.map((tab) => <option key={tab} value={tab}>{tab}</option>)}</select></label>}
              <label>English label<input value={field.label?.en || ""} onChange={(event) => update(index, { label: { ...field.label, en: event.target.value } })} /></label>
              <label>Arabic label<input value={field.label?.ar || ""} onChange={(event) => update(index, { label: { ...field.label, ar: event.target.value } })} /></label>
              <label>Type<select disabled={field.protected} value={field.type} onChange={(event) => update(index, { type: event.target.value, options: [] })}>{productFieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
              <label>Sort order<input min="0" max="9999" type="number" value={field.sortOrder || 0} onChange={(event) => update(index, { sortOrder: Number(event.target.value) })} /></label>
              <label>Default value<input value={Array.isArray(field.defaultValue) ? field.defaultValue.join(",") : String(field.defaultValue ?? "")} onChange={(event) => update(index, { defaultValue: field.type === "multi_select" ? event.target.value.split(",").map((item) => item.trim()).filter(Boolean) : event.target.value })} /></label>
              {["select", "multi_select"].includes(field.type) && (
                <label className="full-field">Options (one per line: value:English:Arabic)
                  <textarea
                    value={(field.options || []).map((option) => `${option.value}:${option.label?.en || option.value}:${option.label?.ar || option.label?.en || option.value}`).join("\n")}
                    onChange={(event) => update(index, { options: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { const [value, en, ar] = line.split(":"); return { value: value.trim(), label: { en: (en || value).trim(), ar: (ar || en || value).trim() } }; }) })}
                  />
                </label>
              )}
            </div>
            <div className="product-schema-switches">
              <label><input checked={field.enabled !== false} disabled={field.protected} type="checkbox" onChange={(event) => update(index, { enabled: event.target.checked })} /> Enabled</label>
              <label><input checked={field.required === true} type="checkbox" onChange={(event) => update(index, { required: event.target.checked })} /> Required</label>
              <label><input checked={field.storefrontVisible === true} type="checkbox" onChange={(event) => update(index, { storefrontVisible: event.target.checked })} /> Storefront</label>
              <button disabled={index === 0} type="button" onClick={() => move(index, -1)}>Up</button>
              <button disabled={index === fields.length - 1} type="button" onClick={() => move(index, 1)}>Down</button>
              {!field.protected && <button className="text-action danger" type="button" onClick={() => onChange(fields.filter((_, fieldIndex) => fieldIndex !== index))}>Delete</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminProductSettingsPage({
  currentUser,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  onSchemaChanged,
  onToggleDarkMode,
  productSchema,
}) {
  const [schema, setSchema] = React.useState(productSchema);
  const [message, setMessage] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setSchema(productSchema), [productSchema]);

  const layoutProps = { activePage: "admin-product-settings", currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };
  if (!["admin", "company_admin"].includes(currentUser?.role)) {
    return <AdminLayout {...layoutProps} title="Access denied" subtitle="Company admin access is required."><div className="admin-empty-state">Company admin access is required.</div></AdminLayout>;
  }

  function updateTab(index, changes) {
    setSchema((current) => ({ ...current, tabs: current.tabs.map((tab, tabIndex) => tabIndex === index ? { ...tab, ...changes } : tab) }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const saved = await updateProductSchema(schema);
      onSchemaChanged(saved);
      setMessage({ type: "success", text: "Product schema saved." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  function updateShowcaseSection(index, changes) {
    setSchema((current) => ({ ...current, showcaseSections: current.showcaseSections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...changes } : section) }));
  }

  return (
    <AdminLayout {...layoutProps} title="Product Settings" subtitle="Configure this company’s product form and storefront fields.">
      {message && <div className={`message-panel ${message.type}`}>{message.text}</div>}
      <section className="admin-panel-card product-schema-builder">
        <div className="admin-section-head"><div><h2>Product Form Tabs</h2><p>Basic remains enabled because it contains protected core fields.</p></div><button className="admin-primary-button" disabled={saving} onClick={save} type="button">{saving ? "Saving…" : "Save Schema"}</button></div>
        <div className="product-schema-tabs">
          {schema.tabs.map((tab, index) => (
            <article key={tab.key}>
              <label><input checked={tab.enabled !== false} disabled={tab.protected} type="checkbox" onChange={(event) => updateTab(index, { enabled: event.target.checked })} /> {tab.key}</label>
              <input aria-label={`${tab.key} English label`} value={tab.label?.en || ""} onChange={(event) => updateTab(index, { label: { ...tab.label, en: event.target.value } })} />
              <input aria-label={`${tab.key} Arabic label`} value={tab.label?.ar || ""} onChange={(event) => updateTab(index, { label: { ...tab.label, ar: event.target.value } })} />
            </article>
          ))}
        </div>
        <FieldEditor fields={schema.fields} onChange={(fields) => setSchema((current) => ({ ...current, fields }))} title="Product Fields" />
        <FieldEditor fields={schema.variantAttributes} forcedTab="variants" onChange={(variantAttributes) => setSchema((current) => ({ ...current, variantAttributes }))} title="Variant Attributes" />
        <p className="admin-note">Price, stock, variant image, and website visibility remain available for every variant.</p>
        <FieldEditor fields={schema.mediaFields} forcedTab="media" onChange={(mediaFields) => setSchema((current) => ({ ...current, mediaFields }))} title="Media Fields" />
        <section className="product-schema-group">
          <div className="admin-section-head"><div><h2>Showcase Sections</h2><p>Dynamic product-detail sections and their fields.</p></div><button type="button" onClick={() => setSchema((current) => ({ ...current, showcaseSections: [...current.showcaseSections, { key: `section_${Date.now()}`, title: { en: "New Section", ar: "قسم جديد" }, enabled: true, storefrontVisible: true, sortOrder: (current.showcaseSections.length + 1) * 10, fields: [] }] }))}>Add Section</button></div>
          {schema.showcaseSections.map((section, index) => (
            <article className="product-showcase-config" key={section.key}>
              <div className="product-schema-field-grid">
                <label>Key<input value={section.key} onChange={(event) => updateShowcaseSection(index, { key: event.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} /></label>
                <label>English title<input value={section.title?.en || ""} onChange={(event) => updateShowcaseSection(index, { title: { ...section.title, en: event.target.value } })} /></label>
                <label>Arabic title<input value={section.title?.ar || ""} onChange={(event) => updateShowcaseSection(index, { title: { ...section.title, ar: event.target.value } })} /></label>
              </div>
              <div className="product-schema-switches"><label><input checked={section.enabled !== false} type="checkbox" onChange={(event) => updateShowcaseSection(index, { enabled: event.target.checked })} /> Enabled</label><label><input checked={section.storefrontVisible !== false} type="checkbox" onChange={(event) => updateShowcaseSection(index, { storefrontVisible: event.target.checked })} /> Storefront</label><button className="text-action danger" type="button" onClick={() => setSchema((current) => ({ ...current, showcaseSections: current.showcaseSections.filter((_, sectionIndex) => sectionIndex !== index) }))}>Delete section</button></div>
              <FieldEditor fields={section.fields || []} forcedTab="showcase" onChange={(fields) => updateShowcaseSection(index, { fields })} title={`${section.title?.en || section.key} Fields`} />
            </article>
          ))}
        </section>
        <div className="form-actions"><button className="admin-primary-button" disabled={saving} onClick={save} type="button">{saving ? "Saving…" : "Save Product Schema"}</button></div>
      </section>
    </AdminLayout>
  );
}

export default AdminProductSettingsPage;
