import React from "react";
import { Building2, Pencil, Plus, ShieldAlert } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import {
  adminModuleRegistry,
  defaultAdminModules,
  resolveAdminModules,
} from "../data/adminModules.js";
import {
  createPlatformCompany,
  disablePlatformCompany,
  fetchPlatformCompanies,
  updatePlatformCompany,
} from "../utils/platformCompaniesApi.js";

const emptyForm = {
  name: "",
  slug: "",
  domain: "",
  status: "draft",
  settings: {
    currency: "",
    language: "",
    supportEmail: "",
    supportPhone: "",
    adminModules: defaultAdminModules(),
  },
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const currentEbStorefrontDomains = ["ebchemi.com", "www.ebchemi.com"];

function normalizeDisplayDomain(value) {
  const input = String(value || "").trim().toLowerCase();
  if (!input) return "";
  try {
    return new URL(input.includes("://") ? input : `https://${input}`).hostname.replace(/\.$/, "");
  } catch {
    return input
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .split(/[/?#]/, 1)[0]
      .replace(/:\d+$/, "")
      .replace(/\.$/, "");
  }
}

function domainDisplayPriority(domain) {
  if (domain === "ebchemi.com") return 0;
  if (domain === "www.ebchemi.com") return 1;
  if (domain.startsWith("www.")) return 20;
  if (domain.startsWith("api.")) return 80;
  if (domain.endsWith(".vercel.app")) return 100;
  return 10;
}

function preferredCompanyDomain(company) {
  const candidates = [
    ...(Array.isArray(company?.domains) ? company.domains : []),
    company?.domain,
    ...(company?.id === "eb-chemical" || company?.isDefault ? currentEbStorefrontDomains : []),
  ];
  const domains = [...new Set(candidates.map(normalizeDisplayDomain).filter(Boolean))];
  return domains.sort((a, b) => domainDisplayPriority(a) - domainDisplayPriority(b))[0] || "";
}

function cloneForm(company = emptyForm) {
  return {
    name: company.name || "",
    slug: company.slug || "",
    domain: company.domain || "",
    status: company.status || "draft",
    settings: {
      ...(company.settings || {}),
      currency: company.settings?.currency || "",
      language: company.settings?.language || "",
      supportEmail: company.settings?.supportEmail || "",
      supportPhone: company.settings?.supportPhone || "",
      adminModules: resolveAdminModules(company.settings, company.id),
    },
  };
}

function validateCompany(form) {
  if (!form.name.trim()) return "Company name is required.";
  if (form.slug && !slugPattern.test(form.slug)) {
    return "Slug must use lowercase letters, numbers, and single hyphens only.";
  }
  if (!["draft", "inactive", "active"].includes(form.status)) {
    return "Select a valid company status.";
  }
  return "";
}

function CompanyForm({ company, form, isSaving, language = "en", onCancel, onChange, onSubmit }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  function localDesc(desc) {
    if (!desc) return "";
    if (typeof desc === "string") return desc;
    return desc[language] || desc.en || "";
  }
  function loc(value) {
    if (!value || typeof value === "string") return value || "";
    return value[language] || value.ar || value.en || "";
  }
  const isEditing = Boolean(company);

  return (
    <section className="admin-panel-card company-editor-card">
      <div className="admin-section-head">
        <div>
          <h2>{isEditing ? localized(`Edit ${company.name}`, `تعديل ${company.name}`, `ערוך ${company.name}`) : localized("Create company draft", "إنشاء مسودة شركة", "צור טיוטת חברה")}</h2>
          <p>{localized("New companies are not connected to a public storefront or domain resolver.", "الشركات الجديدة غير متصلة بواجهة متجر عامة أو محلل نطاق.", "חברות חדשות אינן מחוברות לחנות ציבורית או לפתרון שמות מתחם.")}</p>
        </div>
      </div>
      <form className="admin-form company-form" onSubmit={onSubmit}>
        <label>
          {localized("Company name", "اسم الشركة", "שם החברה")}
          <input
            autoComplete="organization"
            name="name"
            onChange={onChange}
            required
            value={form.name}
          />
        </label>
        <label>
          {localized("Slug", "الاسم المختصر", "מזהה")}
          <input
            disabled={company?.isDefault}
            name="slug"
            onChange={onChange}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="new-company"
            value={form.slug}
          />
        </label>
        <label>
          {localized("Domain", "النطاق", "דומיין")}
          <input
            autoCapitalize="none"
            name="domain"
            onChange={onChange}
            placeholder="company.example.com"
            value={form.domain}
          />
        </label>
        <label>
          {localized("Status", "الحالة", "סטטוס")}
          <select
            disabled={company?.isDefault}
            name="status"
            onChange={onChange}
            value={form.status}
          >
            <option value="draft">{localized("Draft", "مسودة", "טיוטה")}</option>
            <option value="inactive">{localized("Inactive", "غير نشط", "לא פעיל")}</option>
            <option value="active">{localized("Active", "نشط", "פעיל")}</option>
          </select>
        </label>
        <label>
          {localized("Currency", "العملة", "מטבע")}
          <input
            name="settings.currency"
            onChange={onChange}
            placeholder="USD"
            value={form.settings.currency}
          />
        </label>
        <label>
          {localized("Language", "اللغة", "שפה")}
          <input
            name="settings.language"
            onChange={onChange}
            placeholder="en"
            value={form.settings.language}
          />
        </label>
        <label>
          {localized("Support email", "البريد الإلكتروني للدعم", "אימייל תמיכה")}
          <input
            name="settings.supportEmail"
            onChange={onChange}
            type="email"
            value={form.settings.supportEmail}
          />
        </label>
        <label>
          {localized("Support phone", "هاتف الدعم", "טלפון תמיכה")}
          <input
            name="settings.supportPhone"
            onChange={onChange}
            value={form.settings.supportPhone}
          />
        </label>
        <fieldset className="full-field company-modules-fieldset">
          <legend>{localized("Admin modules", "وحدات الإدارة", "מודולי ניהול")}</legend>
          <p>{localized("Choose which sections are available in this company's admin panel.", "اختر الأقسام المتاحة في لوحة إدارة هذه الشركة.", "בחר אילו קטעים זמינים בלוח הניהול של חברה זו.")}</p>
          <div className="company-modules-grid">
            {adminModuleRegistry.map((module) => (
              <label className="company-module-option" key={module.key}>
                <input
                  checked={form.settings.adminModules[module.key] === true}
                  name={`settings.adminModules.${module.key}`}
                  onChange={onChange}
                  type="checkbox"
                />
                <span>
                  <strong>{module.label.en}</strong>
                  <small>{localDesc(module.description)}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-actions full-field">
          <button className="secondary-action" disabled={isSaving} onClick={onCancel} type="button">
            {localized("Cancel", "إلغاء", "ביטול")}
          </button>
          <button className="admin-primary-button" disabled={isSaving} type="submit">
            {isSaving ? localized("Saving...", "جار الحفظ...", "שומר...") : isEditing ? localized("Save changes", "حفظ التغييرات", "שמור שינויים") : localized("Create draft", "إنشاء مسودة", "צור טיוטה")}
          </button>
        </div>
      </form>
    </section>
  );
}

function AccessDenied({ language = "en" }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  return (
    <section className="admin-panel-card company-access-denied" role="alert">
      <ShieldAlert size={28} />
      <div>
        <h2>{localized("Access denied", "الوصول مرفوض", "גישה נדחתה")}</h2>
        <p>{localized("Only an explicitly provisioned Super Admin can manage platform companies.", "فقط مسؤول النظام المخول يمكنه إدارة شركات المنصة.", "רק מנהל על שהוקצה במפורש יכול לנהל חברות פלטפורמה.")}</p>
      </div>
    </section>
  );
}

function AdminCompaniesPage({
  currentUser,
  isDarkMode,
  language,
  onLanguageChange,
  onLogout,
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

  const [companies, setCompanies] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(currentUser?.role === "super_admin");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [accessDenied, setAccessDenied] = React.useState(currentUser?.role !== "super_admin");
  const [editorCompany, setEditorCompany] = React.useState(null);
  const [form, setForm] = React.useState(cloneForm());
  const onLogoutRef = React.useRef(onLogout);

  React.useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  React.useEffect(() => {
    let active = true;

    if (currentUser?.role !== "super_admin") {
      setAccessDenied(true);
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setAccessDenied(false);

    async function load() {
      try {
        const result = await fetchPlatformCompanies();
        if (active) setCompanies(result);
      } catch (requestError) {
        if (!active) return;
        if (requestError.status === 401) {
          void onLogoutRef.current();
        } else if (requestError.status === 403) {
          setAccessDenied(true);
        } else {
          setError(requestError.message || localized("Unable to load companies.", "غير قادر على تحميل الشركات.", "לא ניתן לטעון חברות."));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [currentUser?.role]);

  function beginCreate() {
    setEditorCompany(null);
    setForm(cloneForm());
    setError("");
    setSuccess("");
  }

  function beginEdit(company) {
    setEditorCompany(company);
    setForm(cloneForm(company));
    setError("");
    setSuccess("");
  }

  function changeForm(event) {
    const { checked, name, type, value } = event.target;
    if (name.startsWith("settings.adminModules.")) {
      const moduleKey = name.slice("settings.adminModules.".length);
      setForm((current) => ({
        ...current,
        settings: {
          ...current.settings,
          adminModules: {
            ...current.settings.adminModules,
            [moduleKey]: type === "checkbox" ? checked : value,
          },
        },
      }));
      return;
    }
    if (name.startsWith("settings.")) {
      const settingName = name.slice("settings.".length);
      setForm((current) => ({
        ...current,
        settings: { ...current.settings, [settingName]: value },
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitCompany(event) {
    event.preventDefault();
    const validationError = validateCompany(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      domain: form.domain.trim(),
      status: form.status,
      settings: Object.fromEntries(
        Object.entries(form.settings).filter(([, value]) => String(value).trim()),
      ),
    };

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = editorCompany
        ? await updatePlatformCompany(editorCompany.id, payload)
        : await createPlatformCompany(payload);
      setCompanies((current) => {
        const exists = current.some((company) => company.id === saved.id);
        return exists
          ? current.map((company) => (company.id === saved.id ? saved : company))
          : [...current, saved];
      });
      setSuccess(editorCompany ? localized("Company updated.", "تم تحديث الشركة.", "החברה עודכנה.") : localized("Company draft created.", "تم إنشاء مسودة الشركة.", "טיוטת החברה נוצרה."));
      setEditorCompany(null);
      setForm(cloneForm());
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else if (requestError.status === 403) setAccessDenied(true);
      else setError(requestError.message || localized("Unable to save company.", "غير قادر على حفظ الشركة.", "לא ניתן לשמור חברה."));
    } finally {
      setIsSaving(false);
    }
  }

  async function disableCompany(company) {
    if (company.isDefault) return;
    if (!window.confirm(localized(`Disable ${company.name}? Its public resolution remains unavailable.`, `تعطيل ${company.name}؟ يبقى حله العام غير متاح.`, `להשבית את ${company.name}? הפתרון הציבורי שלה יישאר לא זמין.`))) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = await disablePlatformCompany(company.id);
      setCompanies((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setSuccess(localized(`${company.name} disabled.`, `${company.name} معطل.`, `${company.name} הושבתה.`));
      if (editorCompany?.id === company.id) {
        setEditorCompany(saved);
        setForm(cloneForm(saved));
      }
    } catch (requestError) {
      if (requestError.status === 401) void onLogout();
      else if (requestError.status === 403) setAccessDenied(true);
      else setError(requestError.message || localized("Unable to disable company.", "غير قادر على تعطيل الشركة.", "לא ניתן להשבית חברה."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout
      activePage="admin-platform-companies"
      currentUser={currentUser}
      isDarkMode={isDarkMode}
      language={language}
      onLanguageChange={onLanguageChange}
      onLogout={onLogout}
      onNavigate={onNavigate}
      onToggleDarkMode={onToggleDarkMode}
      subtitle={loc({ en: "Manage tenant companies under iGroup without enabling public tenant switching.", ar: "إدارة شركات المستأجرين تحت iGroup دون تمكين تبديل المستأجر العام.", he: "נהל חברות דיירים תחת iGroup מבלי לאפשר החלפת דיירים ציבורית." })}
      title={loc({ en: "Companies", ar: "الشركات", he: "חברות" })}
    >
      {accessDenied ? (
        <AccessDenied language={language} />
      ) : (
        <div className="company-management-page">
          <div className="admin-toolbar company-toolbar">
            <div>
              <strong>{localized("Companies managed by iGroup", "الشركات التي تديرها iGroup", "חברות המנוהלות על ידי iGroup")}</strong>
              <span>{companies.length} {localized("total", "الإجمالي", "סה\"כ")}</span>
            </div>
            <button className="admin-primary-button" onClick={beginCreate} type="button">
              <Plus size={15} />
              {localized("New company", "شركة جديدة", "חברה חדשה")}
            </button>
          </div>

          {error && (
            <div className="message-panel error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="message-panel success" role="status">
              {success}
            </div>
          )}

          {isLoading ? (
            <section className="admin-panel-card company-loading" aria-busy="true">
              {localized("Loading companies...", "جار تحميل الشركات...", "טוען חברות...")}
            </section>
          ) : companies.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table company-table">
                <thead>
                  <tr>
                    <th>{localized("Company", "الشركة", "חברה")}</th>
                    <th>{localized("ID", "المعرف", "מזהה")}</th>
                    <th>{localized("Slug", "الاسم المختصر", "מזהה")}</th>
                    <th>{localized("Status", "الحالة", "סטטוס")}</th>
                    <th>{localized("Domain", "النطاق", "דומיין")}</th>
                    <th>{localized("Default", "افتراضي", "ברירת מחדל")}</th>
                    <th>{localized("Actions", "الإجراءات", "פעולות")}</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.name}</strong>
                      </td>
                      <td>
                        <code>{company.id}</code>
                      </td>
                      <td>{company.slug || "-"}</td>
                      <td>
                        <span
                          className={`admin-status-pill ${company.status === "active" ? "active" : company.status === "draft" ? "warning" : "neutral"}`}
                        >
                          {company.status === "active" ? localized("Active", "نشط", "פעיל") : company.status === "draft" ? localized("Draft", "مسودة", "טיוטה") : localized("Inactive", "غير نشط", "לא פעיל")}
                        </span>
                      </td>
                      <td>{preferredCompanyDomain(company) || localized("Not assigned", "غير معين", "לא הוקצה")}</td>
                      <td>
                        {company.isDefault ? (
                          <span className="admin-status-pill active">{localized("Default tenant", "المستأجر الافتراضي", "דייר ברירת מחדל")}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div className="company-row-actions">
                          <button
                            className="text-action"
                            onClick={() => beginEdit(company)}
                            type="button"
                          >
                            <Pencil size={14} /> {localized("Edit", "تعديل", "ערוך")}
                          </button>
                          {!company.isDefault && company.status !== "inactive" && (
                            <button
                              className="text-action company-disable-button"
                              disabled={isSaving}
                              onClick={() => disableCompany(company)}
                              type="button"
                            >
                              {localized("Disable", "تعطيل", "השבת")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <Building2 size={24} />
              <strong>{localized("No companies found", "لم يتم العثور على شركات", "לא נמצאו חברות")}</strong>
              <span>{localized("Create a draft company to begin configuration.", "أنشئ شركة مسودة لبدء التكوين.", "צור חברת טיוטה כדי להתחיל בתצורה.")}</span>
            </div>
          )}

          <CompanyForm
            company={editorCompany}
            form={form}
            isSaving={isSaving}
            language={language}
            onCancel={beginCreate}
            onChange={changeForm}
            onSubmit={submitCompany}
          />
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCompaniesPage;
