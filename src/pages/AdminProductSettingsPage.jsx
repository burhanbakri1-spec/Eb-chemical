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
    label: { en: "New Field", ar: "حقل جديد", he: "שדה חדש" },
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

function FieldEditor({ fields, forcedTab, onChange, title, language = "en" }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  function loc(value) {
    if (!value || typeof value === "string") return value || "";
    return value[language] || value.ar || value.en || "";
  }

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
        <div><h2>{title}</h2><p>{localized("Configure labels, visibility, type, and order.", "تكوين التسميات والرؤية والنوع والترتيب.", "הגדר תוויות, נראות, סוג וסדר.")}</p></div>
        <button type="button" onClick={() => onChange([...fields, newField(forcedTab || "custom_sections", fields.length)])}>{localized("Add Field", "إضافة حقل", "הוסף שדה")}</button>
      </div>
      <div className="product-schema-fields">
        {fields.map((field, index) => (
          <article className="product-schema-field" key={`${field.key}-${index}`}>
            <div className="product-schema-field-grid">
              <label>{localized("Key", "المفتاح", "מפתח")}<input disabled={field.protected} value={field.key} onChange={(event) => update(index, { key: event.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} /></label>
              {!forcedTab && <label>{localized("Tab", "التبويب", "לשונית")}<select disabled={field.protected} value={field.tab} onChange={(event) => update(index, { tab: event.target.value })}>{productTabKeys.map((tab) => <option key={tab} value={tab}>{tab}</option>)}</select></label>}
              <label>{localized("English label", "التسمية بالإنجليزية", "תווית באנגלית")}<input value={field.label?.en || ""} onChange={(event) => update(index, { label: { ...field.label, en: event.target.value } })} /></label>
              <label>{localized("Arabic label", "التسمية بالعربية", "תווית בערבית")}<input value={field.label?.ar || ""} onChange={(event) => update(index, { label: { ...field.label, ar: event.target.value } })} /></label>
              <label>{localized("Hebrew label", "التسمية بالعبرية", "תווית בעברית")}<input value={field.label?.he || ""} onChange={(event) => update(index, { label: { ...field.label, he: event.target.value } })} /></label>
              <label>{localized("Type", "النوع", "סוג")}<select disabled={field.protected} value={field.type} onChange={(event) => update(index, { type: event.target.value, options: [] })}>{productFieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
              <label>{localized("Sort order", "ترتيب الفرز", "סדר מיון")}<input min="0" max="9999" type="number" value={field.sortOrder || 0} onChange={(event) => update(index, { sortOrder: Number(event.target.value) })} /></label>
              <label>{localized("Default value", "القيمة الافتراضية", "ערך ברירת מחדל")}<input value={Array.isArray(field.defaultValue) ? field.defaultValue.join(",") : String(field.defaultValue ?? "")} onChange={(event) => update(index, { defaultValue: field.type === "multi_select" ? event.target.value.split(",").map((item) => item.trim()).filter(Boolean) : event.target.value })} /></label>
              {["select", "multi_select"].includes(field.type) && (
                <label className="full-field">{localized("Options (one per line: value:English:Arabic)", "خيارات (واحد لكل سطر: قيمة:إنجليزية:عربية)", "אפשרויות (אחת לשורה: ערך:אנגלית:ערבית)")}
                  <textarea
                    value={(field.options || []).map((option) => `${option.value}:${option.label?.en || option.value}:${option.label?.ar || option.label?.en || option.value}`).join("\n")}
                    onChange={(event) => update(index, { options: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { const [value, en, ar] = line.split(":"); return { value: value.trim(), label: { en: (en || value).trim(), ar: (ar || en || value).trim() } }; }) })}
                  />
                </label>
              )}
            </div>
            <div className="product-schema-switches">
              <label><input checked={field.enabled !== false} disabled={field.protected} type="checkbox" onChange={(event) => update(index, { enabled: event.target.checked })} /> {localized("Enabled", "مفعل", "מופעל")}</label>
              <label><input checked={field.required === true} type="checkbox" onChange={(event) => update(index, { required: event.target.checked })} /> {localized("Required", "مطلوب", "נדרש")}</label>
              <label><input checked={field.storefrontVisible === true} type="checkbox" onChange={(event) => update(index, { storefrontVisible: event.target.checked })} /> {localized("Storefront", "واجهة المتجر", "חנות")}</label>
              <button disabled={index === 0} type="button" onClick={() => move(index, -1)}>{localized("Up", "أعلى", "למעלה")}</button>
              <button disabled={index === fields.length - 1} type="button" onClick={() => move(index, 1)}>{localized("Down", "أسفل", "למטה")}</button>
              {!field.protected && <button className="text-action danger" type="button" onClick={() => onChange(fields.filter((_, fieldIndex) => fieldIndex !== index))}>{localized("Delete", "حذف", "מחק")}</button>}
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

  function loc(value) {
    if (!value || typeof value === "string") return value || "";
    return value[language] || value.ar || value.en || "";
  }
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  React.useEffect(() => setSchema(productSchema), [productSchema]);

  const layoutProps = { activePage: "admin-product-settings", currentUser, isDarkMode, language, onLanguageChange, onLogout, onNavigate, onToggleDarkMode };
  if (!["admin", "company_admin"].includes(currentUser?.role)) {
    return <AdminLayout {...layoutProps} title={loc({ en: "Access denied", ar: "الوصول مرفوض", he: "גישה נדחתה" })} subtitle={loc({ en: "Company admin access is required.", ar: "صلاحية مدير الشركة مطلوبة.", he: "נדרשת גישת מנהל חברה." })}><div className="admin-empty-state">{loc({ en: "Company admin access is required.", ar: "صلاحية مدير الشركة مطلوبة.", he: "נדרשת גישת מנהל חברה." })}</div></AdminLayout>;
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
      setMessage({ type: "success", text: loc({ en: "Product schema saved.", ar: "تم حفظ مخطط المنتج.", he: "סכימת המוצר נשמרה." }) });
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
    <AdminLayout {...layoutProps} title={loc({ en: "Product Settings", ar: "إعدادات المنتجات", he: "הגדרות מוצר" })} subtitle={loc({ en: "Configure this company's product form and storefront fields.", ar: "تكوين نموذج المنتج وحقول المتجر للشركة.", he: "הגדר את טופס המוצר ושדות החנות של החברה." })}>
      {message && <div className={`message-panel ${message.type}`}>{message.text}</div>}
      <section className="admin-panel-card product-schema-builder">
        <div className="admin-section-head"><div><h2>{localized("Product Form Tabs", "تبويبات نموذج المنتج", "לשוניות טופס מוצר")}</h2><p>{localized("Basic remains enabled because it contains protected core fields.", "التبويب الأساسي يبقى مفعلاً لأنه يحتوي على حقول أساسية محمية.", "הלשונית הבסיסית נשארת מופעלת מכיוון שהיא מכילה שדות ליבה מוגנים.")}</p></div><button className="admin-primary-button" disabled={saving} onClick={save} type="button">{saving ? localized("Saving...", "جار الحفظ...", "שומר...") : localized("Save Schema", "حفظ المخطط", "שמור סכימה")}</button></div>
        <div className="product-schema-tabs">
          {schema.tabs.map((tab, index) => (
            <article key={tab.key}>
              <label><input checked={tab.enabled !== false} disabled={tab.protected} type="checkbox" onChange={(event) => updateTab(index, { enabled: event.target.checked })} /> {tab.key}</label>
              <input aria-label={localized(`${tab.key} English label`, `${tab.key} التسمية بالإنجليزية`, `${tab.key} תווית באנגלית`)} value={tab.label?.en || ""} onChange={(event) => updateTab(index, { label: { ...tab.label, en: event.target.value } })} />
              <input aria-label={localized(`${tab.key} Arabic label`, `${tab.key} التسمية بالعربية`, `${tab.key} תווית בערבית`)} value={tab.label?.ar || ""} onChange={(event) => updateTab(index, { label: { ...tab.label, ar: event.target.value } })} />
              <input aria-label={localized(`${tab.key} Hebrew label`, `${tab.key} التسمية بالعبرية`, `${tab.key} תווית בעברית`)} value={tab.label?.he || ""} onChange={(event) => updateTab(index, { label: { ...tab.label, he: event.target.value } })} />
            </article>
          ))}
        </div>
        <FieldEditor fields={schema.fields} language={language} onChange={(fields) => setSchema((current) => ({ ...current, fields }))} title={localized("Product Fields", "حقول المنتج", "שדות מוצר")} />
        <FieldEditor fields={schema.variantAttributes} forcedTab="variants" language={language} onChange={(variantAttributes) => setSchema((current) => ({ ...current, variantAttributes }))} title={localized("Variant Attributes", "خصائص المتغيرات", "מאפייני וריאציות")} />
        <p className="admin-note">{localized("Price, stock, variant image, and website visibility remain available for every variant.", "السعر والمخزون وصورة المتغير وظهور الموقع تبقى متاحة لكل متغير.", "מחיר, מלאי, תמונת וריאציה ונראות באתר נשארים זמינים לכל וריאציה.")}</p>
        <FieldEditor fields={schema.mediaFields} forcedTab="media" language={language} onChange={(mediaFields) => setSchema((current) => ({ ...current, mediaFields }))} title={localized("Media Fields", "حقول الوسائط", "שדות מדיה")} />
        <section className="product-schema-group">
          <div className="admin-section-head"><div><h2>{localized("Showcase Sections", "أقسام العرض", "סקציות תצוגה")}</h2><p>{localized("Dynamic product-detail sections and their fields.", "أقسام ديناميكية لتفاصيل المنتج وحقولها.", "סקציות דינמיות של פרטי מוצר והשדות שלהן.")}</p></div><button type="button" onClick={() => setSchema((current) => ({ ...current, showcaseSections: [...current.showcaseSections, { key: `section_${Date.now()}`, title: { en: "New Section", ar: "قسم جديد", he: "סקציה חדשה" }, enabled: true, storefrontVisible: true, sortOrder: (current.showcaseSections.length + 1) * 10, fields: [] }] }))}>{localized("Add Section", "إضافة قسم", "הוסף סקציה")}</button></div>
          {schema.showcaseSections.map((section, index) => (
            <article className="product-showcase-config" key={section.key}>
              <div className="product-schema-field-grid">
                <label>{localized("Key", "المفتاح", "מפתח")}<input value={section.key} onChange={(event) => updateShowcaseSection(index, { key: event.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} /></label>
                <label>{localized("English title", "العنوان بالإنجليزية", "כותרת באנגלית")}<input value={section.title?.en || ""} onChange={(event) => updateShowcaseSection(index, { title: { ...section.title, en: event.target.value } })} /></label>
                <label>{localized("Arabic title", "العنوان بالعربية", "כותרת בערבית")}<input value={section.title?.ar || ""} onChange={(event) => updateShowcaseSection(index, { title: { ...section.title, ar: event.target.value } })} /></label>
              </div>
              <div className="product-schema-switches"><label><input checked={section.enabled !== false} type="checkbox" onChange={(event) => updateShowcaseSection(index, { enabled: event.target.checked })} /> {localized("Enabled", "مفعل", "מופעל")}</label><label><input checked={section.storefrontVisible !== false} type="checkbox" onChange={(event) => updateShowcaseSection(index, { storefrontVisible: event.target.checked })} /> {localized("Storefront", "واجهة المتجر", "חנות")}</label><button className="text-action danger" type="button" onClick={() => setSchema((current) => ({ ...current, showcaseSections: current.showcaseSections.filter((_, sectionIndex) => sectionIndex !== index) }))}>{localized("Delete section", "حذف القسم", "מחק סקציה")}</button></div>
              <FieldEditor fields={section.fields || []} forcedTab="showcase" language={language} onChange={(fields) => updateShowcaseSection(index, { fields })} title={loc({ en: `${section.title?.en || section.key} Fields`, ar: `حقول ${section.title?.ar || section.key}`, he: `שדות ${section.title?.he || section.title?.en || section.key}` })} />
            </article>
          ))}
        </section>
        <div className="form-actions"><button className="admin-primary-button" disabled={saving} onClick={save} type="button">{saving ? localized("Saving...", "جار الحفظ...", "שומר...") : localized("Save Product Schema", "حفظ مخطط المنتج", "שמור סכימת מוצר")}</button></div>
      </section>
    </AdminLayout>
  );
}

export default AdminProductSettingsPage;
