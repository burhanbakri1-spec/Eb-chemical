import React from "react";
import { RotateCcw, Save } from "lucide-react";
import AdminLayout from "../components/AdminLayout.jsx";
import { defaultWebsiteTexts, websiteTextGroups } from "../data/websiteTexts.js";
import {
  deleteWebsiteText,
  fetchAdminWebsiteTexts,
  saveWebsiteText,
} from "../utils/websiteTextsApi.js";

function mergeDefaults(records) {
  const byKey = new Map((records || []).map((record) => [record.key, record]));
  return defaultWebsiteTexts.map((definition, index) => {
    const record = byKey.get(definition.key);
    return {
      ...definition,
      ...record,
      valueEn: record?.valueEn ?? definition.value.en,
      valueAr: record?.valueAr ?? definition.value.ar,
      valueHe: record?.valueHe ?? definition.value.he,
      sortOrder: record?.sortOrder ?? index,
      isActive: record?.isActive !== false,
    };
  });
}

function AdminWebsiteTextsPage({
  currentUser,
  isDarkMode,
  language = "en",
  onLanguageChange,
  onLogout,
  onNavigate,
  onTextsChanged,
  onToggleDarkMode,
}) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const [items, setItems] = React.useState(() => mergeDefaults([]));
  const [selectedGroup, setSelectedGroup] = React.useState("homepage");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [savingKey, setSavingKey] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    fetchAdminWebsiteTexts()
      .then((records) => {
        if (active) setItems(mergeDefaults(records));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || localized("Failed to load texts", "فشل تحميل النصوص", "טעינת הטקסטים נכשלה"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function updateItem(key, changes) {
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...changes } : item));
  }

  async function saveItem(item) {
    setSavingKey(item.key);
    setMessage("");
    setError("");
    try {
      const saved = await saveWebsiteText(item);
      updateItem(item.key, saved);
      onTextsChanged?.((current) => {
        const filtered = (current || []).filter((record) => record.key !== saved.key);
        return [...filtered, saved];
      });
      setMessage(localized("Text saved successfully", "تم حفظ النص بنجاح", "הטקסט נשמר בהצלחה"));
    } catch (requestError) {
      setError(requestError.message || localized("Failed to save text", "فشل حفظ النص", "שמירת הטקסט נכשלה"));
    } finally {
      setSavingKey("");
    }
  }

  async function resetItem(item) {
    const definition = defaultWebsiteTexts.find((entry) => entry.key === item.key);
    if (!definition) return;
    setSavingKey(item.key);
    setMessage("");
    setError("");
    try {
      if (item.id) await deleteWebsiteText(item.id);
      updateItem(item.key, {
        id: "",
        valueEn: definition.value.en,
        valueAr: definition.value.ar,
        valueHe: definition.value.he,
      });
      onTextsChanged?.((current) => (current || []).filter((record) => record.key !== item.key));
      setMessage(localized("Reset to default", "تمت إعادة النص الافتراضي", "הטקסט אופס לברירת המחדל"));
    } catch (requestError) {
      setError(requestError.message || localized("Failed to reset text", "فشلت إعادة النص", "איפוס הטקסט נכשל"));
    } finally {
      setSavingKey("");
    }
  }

  const normalizedSearch = search.trim().toLowerCase();
  const visibleItems = items.filter((item) => item.group === selectedGroup).filter(
    (item) => !normalizedSearch || `${item.key} ${item.label}`.toLowerCase().includes(normalizedSearch),
  );

  return (
    <AdminLayout
      activePage="admin-website-texts"
      currentUser={currentUser}
      isDarkMode={isDarkMode}
      language={language}
      onLanguageChange={onLanguageChange}
      onLogout={onLogout}
      onNavigate={onNavigate}
      onToggleDarkMode={onToggleDarkMode}
      subtitle={localized("Edit safe, company-specific storefront text overrides.", "تعديل نصوص واجهة المتجر الخاصة بالشركة بأمان.", "עריכת טקסטים בטוחים וייחודיים לחברה.")}
      title={localized("Website Texts", "نصوص الموقع", "טקסטים באתר")}
    >
      <section className="admin-panel-card website-texts-manager">
        <div className="website-media-tabs" role="tablist">
          {websiteTextGroups.map((group) => (
            <button
              aria-selected={selectedGroup === group.key}
              className={selectedGroup === group.key ? "active" : ""}
              key={group.key}
              onClick={() => setSelectedGroup(group.key)}
              role="tab"
              type="button"
            >
              {group.label[language] || group.label.en}
              <span>{items.filter((item) => item.group === group.key).length}</span>
            </button>
          ))}
        </div>
        <input
          aria-label={localized("Search texts", "بحث النصوص", "חיפוש טקסטים")}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={localized("Search texts", "بحث النصوص", "חיפוש טקסטים")}
          type="search"
          value={search}
        />
        {message && <p className="admin-success-message" role="status">{message}</p>}
        {error && <p className="admin-error-message" role="alert">{error}</p>}
        {loading ? (
          <p>{localized("Loading texts...", "جارٍ تحميل النصوص...", "טוען טקסטים...")}</p>
        ) : (
          <div className="website-texts-list">
            {visibleItems.map((item) => (
              <article className="website-text-card" key={item.key}>
                <header>
                  <div>
                    <strong>{item.label}</strong>
                    <code>{item.key}</code>
                  </div>
                </header>
                <div className="website-text-fields">
                  <label>{localized("English text", "النص الإنجليزي", "טקסט באנגלית")}<textarea value={item.valueEn} onChange={(event) => updateItem(item.key, { valueEn: event.target.value })} /></label>
                  <label dir="rtl">{localized("Arabic text", "النص العربي", "טקסט בערבית")}<textarea value={item.valueAr} onChange={(event) => updateItem(item.key, { valueAr: event.target.value })} /></label>
                  <label dir="rtl">{localized("Hebrew text", "النص العبري", "טקסט בעברית")}<textarea value={item.valueHe} onChange={(event) => updateItem(item.key, { valueHe: event.target.value })} /></label>
                </div>
                <div className="website-media-actions">
                  <button className="admin-primary-button" disabled={savingKey === item.key} onClick={() => saveItem(item)} type="button"><Save size={15} />{localized("Save text", "حفظ النص", "שמור טקסט")}</button>
                  <button className="secondary-action" disabled={savingKey === item.key} onClick={() => resetItem(item)} type="button"><RotateCcw size={15} />{localized("Reset to default", "إعادة للافتراضي", "איפוס לברירת מחדל")}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminWebsiteTextsPage;
