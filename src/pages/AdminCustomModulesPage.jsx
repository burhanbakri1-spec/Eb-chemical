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
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  function loc(value) {
    if (!value || typeof value === "string") return value || "";
    return value[language] || value.ar || value.en || "";
  }

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
      <AdminLayout {...layoutProps} title={loc({ en: "Access denied", ar: "الوصول مرفوض", he: "גישה נדחתה" })} subtitle={loc({ en: "Company admin access is required.", ar: "صلاحية مدير الشركة مطلوبة.", he: "נדרשת גישת מנהל חברה." })}>
        <div className="admin-empty-state">{loc({ en: "Company admin access is required.", ar: "صلاحية مدير الشركة مطلوبة.", he: "נדרשת גישת מנהל חברה." })}</div>
      </AdminLayout>
    );
  }
  if (activePage === "admin-custom-modules-edit" && !customModulesLoaded) {
    return <AdminLayout {...layoutProps} title={localized("Edit Custom Module", "تعديل الوحدة المخصصة", "ערוך מודול מותאם אישית")} subtitle={localized("Loading module configuration\u2026", "جار تحميل تكوين الوحدة\u2026", "טוען תצורת מודול\u2026")}><div className="admin-empty-state">{localized("Loading\u2026", "جار التحميل\u2026", "טוען\u2026")}</div></AdminLayout>;
  }
  if (activePage === "admin-custom-modules-edit" && !editingModule) {
    return <AdminLayout {...layoutProps} title={localized("Module not found", "الوحدة غير موجودة", "מודול לא נמצא")} subtitle={localized("The requested module is unavailable.", "الوحدة المطلوبة غير متاحة.", "המודול המבוקש אינו זמין.")}><div className="admin-empty-state">{localized("Custom module not found for this company.", "لم يتم العثور على وحدة مخصصة لهذه الشركة.", "מודול מותאם אישית לא נמצא עבור חברה זו.")}</div></AdminLayout>;
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
      formConfig: { submitLabel: localized("Save", "حفظ", "שמור") },
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
      title={isForm ? editingModule ? localized("Edit Custom Module", "تعديل الوحدة المخصصة", "ערוך מודול מותאם אישית") : localized("New Custom Module", "وحدة مخصصة جديدة", "מודול מותאם אישית חדש") : localized("Custom Modules", "الوحدات المخصصة", "מודולים מותאמים אישית")}
      subtitle={localized("Build safe, database-backed admin sections without executable code.", "أنشئ أقسام إدارة آمنة مدعومة بقاعدة بيانات بدون كود قابل للتنفيذ.", "בנה קטעי ניהול בטוחים המגובים במסד נתונים ללא קוד בר הפעלה.")}
    >
      {message && <div className={`message-panel ${message.type}`}>{message.text}</div>}
      {!isForm ? (
        <section className="admin-panel-card">
          <div className="admin-section-head">
            <div><h2>{localized("Module Builder", "منشئ الوحدات", "בונה מודולים")}</h2><p>{localized("Manage custom sections for this company.", "إدارة الأقسام المخصصة لهذه الشركة.", "נהל קטעים מותאמים אישית עבור חברה זו.")}</p></div>
            <button className="admin-primary-button" onClick={() => onNavigate("admin-custom-modules-new")} type="button">{localized("New Module", "وحدة جديدة", "מודול חדש")}</button>
          </div>
          {customModules.length ? (
            <div className="custom-modules-list">
              {customModules.map((module) => (
                <article className="custom-module-card" key={module.id}>
                  <div>
                    <strong>{module.label}</strong>
                    <span>{module.description || module.key}</span>
                    <small>{module.fieldsSchema.length} {localized("fields", "حقول", "שדות")} \u00B7 {module.enabled ? localized("Enabled", "مفعل", "מופעל") : localized("Disabled", "معطل", "מושבת")}</small>
                  </div>
                  <div className="custom-module-actions">
                    {module.enabled && <button onClick={() => onNavigate("admin-custom-entry-list", { customModuleKey: module.key })} type="button">{localized("Open", "فتح", "פתח")}</button>}
                    <button onClick={() => onNavigate("admin-custom-modules-edit", { moduleId: module.id })} type="button">{localized("Edit", "تعديل", "ערוך")}</button>
                    <button disabled={saving} onClick={() => toggleModule(module)} type="button">{module.enabled ? localized("Disable", "تعطيل", "השבת") : localized("Enable", "تفعيل", "הפעל")}</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="admin-empty-state">{localized("No custom modules yet.", "لا توجد وحدات مخصصة بعد.", "אין מודולים מותאמים אישית עדיין.")}</div>}
        </section>
      ) : (
        <form className="admin-panel-card custom-module-builder" onSubmit={saveModule}>
          <div className="company-form">
            <label>{localized("Module label", "تسمية الوحدة", "תווית מודול")}<input maxLength="120" required value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} /></label>
            <label>{localized("Key / slug", "المفتاح / المعرف", "מפתח / מזהה")}<input disabled={Boolean(editingModule)} maxLength="50" pattern="[a-z][a-z0-9_]+" required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} /></label>
            <label>{localized("Icon", "الأيقونة", "סמל")}<input maxLength="50" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} /></label>
            <label>{localized("Sidebar order", "ترتيب الشريط الجانبي", "סדר בסרגל הצד")}<input min="0" max="999" type="number" value={form.sidebarOrder} onChange={(event) => setForm({ ...form, sidebarOrder: Number(event.target.value) })} /></label>
            <label className="full-field">{localized("Description", "الوصف", "תיאור")}<textarea maxLength="500" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label className="custom-checkbox full-field"><input checked={form.enabled} type="checkbox" onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /> {localized("Enabled", "مفعل", "מופעל")}</label>
          </div>
          <div className="admin-section-head"><div><h2>{localized("Fields", "الحقول", "שדות")}</h2><p>{localized("Only the supported declarative field types can be used.", "يمكن استخدام أنواع الحقول التصريحية المدعومة فقط.", "ניתן להשתמש רק בסוגי השדות ההצהרתיים הנתמכים.")}</p></div><button onClick={() => setForm((current) => ({ ...current, fieldsSchema: [...current.fieldsSchema, blankField(current.fieldsSchema.length)] }))} type="button">{localized("Add Field", "إضافة حقل", "הוסף שדה")}</button></div>
          <div className="custom-fields-list">
            {form.fieldsSchema.map((field, index) => (
              <div className="custom-field-card" key={`${index}-${field.key}`}>
                <div className="custom-field-grid">
                  <label>{localized("Label", "التسمية", "תווית")}<input required value={field.label} onChange={(event) => updateField(index, "label", event.target.value)} /></label>
                  <label>{localized("Key", "المفتاح", "מפתח")}<input pattern="[a-z][a-z0-9_]+" required value={field.key} onChange={(event) => updateField(index, "key", event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))} /></label>
                  <label>{localized("Type", "النوع", "סוג")}<select value={field.type} onChange={(event) => updateField(index, "type", event.target.value)}>{customFieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <label>{localized("Placeholder", "النص التوجيهي", "טקסט מנחה")}<input value={field.placeholder} onChange={(event) => updateField(index, "placeholder", event.target.value)} /></label>
                  {["select", "multi_select"].includes(field.type) && <label className="full-field">{localized("Options (one per line: value:Label)", "خيارات (واحد لكل سطر: قيمة:تسمية)", "אפשרויות (אחת לשורה: ערך:תווית)")}<textarea required value={field.optionsText} onChange={(event) => updateField(index, "optionsText", event.target.value)} /></label>}
                </div>
                <div className="custom-field-actions">
                  <label><input checked={field.required} type="checkbox" onChange={(event) => updateField(index, "required", event.target.checked)} /> {localized("Required", "مطلوب", "נדרש")}</label>
                  <label><input checked={field.showInList} type="checkbox" onChange={(event) => updateField(index, "showInList", event.target.checked)} /> {localized("Show in list", "عرض في القائمة", "הצג ברשימה")}</label>
                  <button disabled={index === 0} onClick={() => moveField(index, -1)} type="button">{localized("Up", "أعلى", "למעלה")}</button>
                  <button disabled={index === form.fieldsSchema.length - 1} onClick={() => moveField(index, 1)} type="button">{localized("Down", "أسفل", "למטה")}</button>
                  <button disabled={form.fieldsSchema.length === 1} onClick={() => setForm((current) => ({ ...current, fieldsSchema: current.fieldsSchema.filter((_, fieldIndex) => fieldIndex !== index) }))} type="button">{localized("Remove", "إزالة", "הסר")}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="form-actions"><button onClick={() => onNavigate("admin-custom-modules")} type="button">{localized("Cancel", "إلغاء", "ביטול")}</button><button className="admin-primary-button" disabled={saving} type="submit">{saving ? localized("Saving\u2026", "جار الحفظ\u2026", "שומר\u2026") : localized("Save Module", "حفظ الوحدة", "שמור מודול")}</button></div>
        </form>
      )}
    </AdminLayout>
  );
}

export default AdminCustomModulesPage;
