import React from "react";
import { ImageOff, ImagePlus, Save, Trash2, Upload } from "lucide-react";
import { defaultWebsiteMedia, withWebsiteMediaVersion } from "../data/websiteMedia.js";
import { uploadImage } from "../utils/api.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const emptyItem = {
  id: "",
  sectionKey: "",
  sectionLabel: "",
  groupKey: "sections",
  imageUrl: "",
  title: "",
  subtitle: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
};

const groupLabels = {
  homepage: { en: "Homepage Sections", ar: "أقسام الصفحة الرئيسية", he: "קטעי דף הבית" },
  homepage_categories: { en: "Homepage Cards", ar: "بطاقات الصفحة الرئيسية", he: "כרטיסיות דף הבית" },
  products: { en: "Products Page", ar: "صفحة المنتجات", he: "דף המוצרים" },
  about: { en: "Static Sections - About", ar: "الأقسام الثابتة - من نحن", he: "קטעים סטטיים - אודות" },
  cleanups: { en: "Static Sections - Cleanups", ar: "الأقسام الثابتة - حملات التنظيف", he: "קטעים סטטיים - ניקיונות" },
  cleanups_gallery: { en: "Cleanups Gallery", ar: "معرض حملات التنظيف", he: "גלריית ניקיונות" },
  cleanups_tabs: { en: "Cleanups Tabs", ar: "تبويبات حملات التنظيف", he: "לשוניות ניקיונות" },
  eb_points: { en: "EB Points", ar: "نقاط EB", he: "נקודות EB" },
  sustainability: { en: "Static Sections - Sustainability", ar: "الأقسام الثابتة - الاستدامة", he: "קטעים סטטיים - קיימות" },
  how_it_works: { en: "Static Sections - How It Works", ar: "الأقسام الثابتة - كيف يعمل", he: "קטעים סטטיים - איך זה עובד" },
  ads: { en: "Ads / Banners", ar: "الإعلانات والبنرات", he: "מודעות / באנרים" },
  header_dropdown: { en: "Header Dropdown Images", ar: "صور القوائم المنسدلة في الرأس", he: "תמונות תפריט נפתח בכותר" },
  sections: { en: "Other Static Website Images", ar: "صور الموقع الثابتة الأخرى", he: "תמונות סטטיות אחרות לאתר" },
};

const groupOrder = [
  "homepage",
  "homepage_categories",
  "products",
  "about",
  "sustainability",
  "how_it_works",
  "cleanups_gallery",
  "cleanups_tabs",
  "eb_points",
  "ads",
  "header_dropdown",
  "sections",
];

function mediaGroupKey(item) {
  const sectionKey = item.sectionKey || "";
  if (sectionKey.startsWith("homepage_category_") || item.groupKey === "homepage_community") {
    return "homepage_categories";
  }
  if (/promo|banner|homepage_split/.test(sectionKey)) return "ads";
  if (item.groupKey === "cleanups") return "cleanups_gallery";
  return groupOrder.includes(item.groupKey) ? item.groupKey : "sections";
}

function groupItems(items) {
  return items.reduce((groups, item) => {
    const key = mediaGroupKey(item);
    groups[key] = [...(groups[key] || []), item];
    return groups;
  }, {});
}

function defaultManagerItem(item) {
  return {
    ...item,
    id: "",
    _draftKey: `default-${item.sectionKey}`,
    fallbackImageUrl: item.fallbackImageUrl || item.imageUrl || "",
    imageUrl: "",
  };
}

function mergeDefaultMediaItems(items, hiddenSectionKeys = []) {
  const hiddenKeys = new Set(hiddenSectionKeys);
  const seenSectionKeys = new Set((items || []).map((item) => item.sectionKey).filter(Boolean));
  const missingDefaults = defaultWebsiteMedia
    .filter((item) => item.sectionKey && !hiddenKeys.has(item.sectionKey) && !seenSectionKeys.has(item.sectionKey))
    .map(defaultManagerItem);

  return [...(items || []).filter((item) => !hiddenKeys.has(item.sectionKey)), ...missingDefaults];
}

function ConfirmDialog({ message, onConfirm, onCancel, deleting, localized }) {
  return (
    <div className="website-media-confirm-overlay">
      <div className="website-media-confirm-dialog">
        <p>{message}</p>
        <div className="website-media-confirm-actions">
          <button className="website-media-confirm-yes" disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? localized("Deleting...", "جار الحذف...", "מוחק...") : localized("Yes, delete", "نعم، احذف", "כן, מחק")}
          </button>
          <button className="website-media-confirm-no" disabled={deleting} onClick={onCancel} type="button">
            {localized("Cancel", "إلغاء", "ביטול")}
          </button>
        </div>
      </div>
    </div>
  );
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) return file;
  if (file.size < MAX_FILE_SIZE && !file.type.includes("png")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = file.type === "image/png" ? 1 : 0.85;
      canvas.toBlob((blob) => {
        if (blob && blob.size < file.size) {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, mimeType === "image/png" ? ".png" : ".jpg"), { type: mimeType }));
        } else {
          resolve(file);
        }
      }, mimeType, quality);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

function MediaEditor({ item, language, onDelete, onSave }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const [draft, setDraft] = React.useState(item);
  const [message, setMessage] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const uploadDisabledRef = React.useRef(false);

  React.useEffect(() => setDraft(item), [item]);

  function update(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage(localized("Unsupported file type.", "نوع الملف غير مدعوم.", "סוג קובץ לא נתמך."));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage(localized("File is too large. Maximum size is 5MB.", "الملف كبير جدًا. الحد الأقصى 5 ميجابايت.", "הקובץ גדול מדי. הגודל המרבי הוא 5MB."));
      return;
    }

    if (uploadDisabledRef.current) return;
    uploadDisabledRef.current = true;

    try {
      setUploading(true);
      setMessage("");
      const compressed = await compressImage(file);
      const result = await uploadImage(compressed);
      update("imageUrl", result.url || result.path || "");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      uploadDisabledRef.current = false;
    }
  }

  async function handleSave() {
    if (!draft.sectionKey.trim()) {
      setMessage(localized("Section key is required.", "أدخل مفتاح القسم.", "הזן מפתח קטע."));
      return;
    }

    try {
      setMessage("");
      const saved = await onSave({ ...draft, sortOrder: Number(draft.sortOrder || 0) });
      if (saved) {
        setDraft(saved);
      }
      setMessage(localized("Image saved.", "تم حفظ الصورة.", "התמונה נשמרה."));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleClearImage() {
    const nextDraft = { ...draft, imageUrl: "", sortOrder: Number(draft.sortOrder || 0) };
    setDraft(nextDraft);

    try {
      setMessage("");
      const saved = await onSave(nextDraft);
      if (saved) {
        setDraft(saved);
      }
      setMessage(localized(
        "Image cleared. The fallback will display only when no uploaded image exists.",
        "تم مسح الصورة. سيظهر البديل فقط عند العرض.",
        "התמונה נמחקה. החלופה תוצג רק כאשר אין תמונה שהועלתה.",
      ));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setMessage("");
    try {
      await onDelete(draft);
    } catch (error) {
      setMessage(error.message);
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  return (
    <article className="website-media-card">
      {confirmDelete && (
        <ConfirmDialog
          deleting={deleting}
          localized={localized}
          message={localized("Delete this media card?", "حذف بطاقة الوسائط هذه?", "למחוק כרטיס מדיה זה?")}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
      <div className="website-media-preview">
        {draft.imageUrl ? (
          <img
            alt={draft.sectionLabel || draft.sectionKey}
            decoding="async"
            loading="lazy"
            src={withWebsiteMediaVersion(draft.imageUrl, draft.updatedAt || draft.id)}
          />
        ) : (
          <ImagePlus aria-hidden="true" size={30} />
        )}
        <span>{draft.isActive ? localized("Active", "نشطة", "פעיל") : localized("Hidden", "مخفية", "מוסתר")}</span>
      </div>

      <div className="website-media-fields">
        <label>
          {localized("Section label", "اسم القسم", "תווית קטע")}
          <input value={draft.sectionLabel} onChange={(event) => update("sectionLabel", event.target.value)} />
        </label>
        <label>
          {localized("Section key", "مفتاح القسم", "מפתח קטע")}
          <input value={draft.sectionKey} onChange={(event) => update("sectionKey", event.target.value)} />
        </label>
        <label className="full-field">
          {localized("Image URL", "رابط الصورة", "קישור תמונה")}
          <input value={draft.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} />
        </label>
        <label>
          {localized("Group", "المجموعة", "קבוצה")}
          <input value={draft.groupKey} onChange={(event) => update("groupKey", event.target.value)} />
        </label>
        <label>
          {localized("Sort order", "الترتيب", "סדר מיון")}
          <input type="number" value={draft.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} />
        </label>
        <label>
          {localized("Optional title", "العنوان الاختياري", "כותרת אופציונלית")}
          <input value={draft.title} onChange={(event) => update("title", event.target.value)} />
        </label>
        <label>
          {localized("Optional subtitle", "الوصف الاختياري", "תיאור אופציונלי")}
          <input value={draft.subtitle} onChange={(event) => update("subtitle", event.target.value)} />
        </label>
        <label>
          {localized("Optional link", "الرابط الاختياري", "קישור אופציונלי")}
          <input value={draft.linkUrl} onChange={(event) => update("linkUrl", event.target.value)} />
        </label>
        <label className="website-media-toggle">
          <input
            checked={draft.isActive !== false}
            onChange={(event) => update("isActive", event.target.checked)}
            type="checkbox"
          />
          {localized("Show image on website", "إظهار الصورة في الموقع", "הצג תמונה באתר")}
        </label>
      </div>

      <div className="website-media-actions">
        <label className="admin-upload-button">
          <Upload size={15} />
          {uploading ? localized("Uploading...", "جار الرفع...", "מעלה...") : localized("Upload image", "رفع صورة", "העלה תמונה")}
          <input accept="image/*" disabled={uploading} hidden onChange={handleUpload} type="file" />
        </label>
        <button
          className="website-media-clear"
          disabled={!draft.imageUrl}
          onClick={handleClearImage}
          type="button"
        >
          <ImageOff size={15} />
          {localized("Clear image", "مسح الصورة", "נקה תמונה")}
        </button>
        <button className="admin-primary-button" onClick={handleSave} type="button">
          <Save size={15} />
          {localized("Save", "حفظ", "שמור")}
        </button>
        <button className="website-media-delete" onClick={() => setConfirmDelete(true)} type="button">
          <Trash2 size={15} />
          {localized("Delete card", "حذف البطاقة", "מחק כרטיס")}
        </button>
      </div>
      {message && <p className="website-media-message">{message}</p>}
    </article>
  );
}

function WebsiteMediaManager({ hiddenSectionKeys = [], language = "en", items = [], onDelete, onSave }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const [drafts, setDrafts] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const registeredItems = React.useMemo(
    () => mergeDefaultMediaItems(items, hiddenSectionKeys),
    [hiddenSectionKeys, items],
  );
  const grouped = groupItems([...registeredItems, ...drafts].sort(
    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
  ));
  const availableGroups = groupOrder.filter((group) => grouped[group]?.length);
  const [selectedGroup, setSelectedGroup] = React.useState("homepage");
  const normalizedSearch = search.trim().toLowerCase();
  const matchingGroups = normalizedSearch
    ? availableGroups.filter((group) => grouped[group].some((item) =>
        `${item.sectionKey || ""} ${item.sectionLabel || ""}`.toLowerCase().includes(normalizedSearch),
      ))
    : availableGroups;

  React.useEffect(() => {
    if (matchingGroups.includes(selectedGroup)) return;
    setSelectedGroup(matchingGroups[0] || availableGroups[0] || "homepage");
  }, [availableGroups, matchingGroups, selectedGroup]);

  const visibleEntries = (grouped[selectedGroup] || []).filter((item) =>
    !normalizedSearch
    || `${item.sectionKey || ""} ${item.sectionLabel || ""}`.toLowerCase().includes(normalizedSearch),
  );

  function addDraft() {
    setDrafts((current) => [
      ...current,
      {
        ...emptyItem,
        groupKey: selectedGroup,
        _draftKey: `draft-${Date.now()}`,
        sortOrder: items.length + current.length + 1,
      },
    ]);
  }

  async function saveItem(item) {
    const { _draftKey, ...payload } = item;
    const saved = await onSave(payload);
    if (item._draftKey) {
      setDrafts((current) => current.filter((draft) => draft._draftKey !== item._draftKey));
    }
    return saved;
  }

  async function deleteItem(item) {
    if (item._draftKey?.startsWith("draft-")) {
      setDrafts((current) => current.filter((draft) => draft._draftKey !== item._draftKey));
      return;
    }
    return onDelete(item);
  }

  return (
    <section className="website-media-manager">
      <header className="website-media-head">
        <div>
          <h2>{localized("Website Media", "صور الموقع", "מדיה לאתר")}</h2>
          <p>
            {localized(
              "Manage static section images without changing product media.",
              "غيّر صور أقسام الموقع الثابتة بدون تعديل صور المنتجات.",
              "נהל תמונות סטטיות של האזור מבלי לשנות מדיה של מוצרים.",
            )}
          </p>
        </div>
        <button className="admin-primary-button" onClick={addDraft} type="button">
          <ImagePlus size={16} />
          {localized("Add image", "إضافة صورة", "הוסף תמונה")}
        </button>
      </header>

      <div className="website-media-toolbar">
        <div className="website-media-tabs" role="tablist">
          {availableGroups.map((group) => (
            <button
              aria-selected={selectedGroup === group}
              className={selectedGroup === group ? "active" : ""}
              key={group}
              onClick={() => setSelectedGroup(group)}
              role="tab"
              type="button"
            >
              {groupLabels[group]?.[language] || group.replaceAll("_", " ")}
              <span>{grouped[group].length}</span>
            </button>
          ))}
        </div>
        <input
          aria-label={localized("Search media", "بحث الوسائط", "חיפוש מדיה")}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={localized("Search media", "بحث الوسائط", "חיפוש מדיה")}
          type="search"
          value={search}
        />
      </div>

      <section className="website-media-group">
        <h3>{groupLabels[selectedGroup]?.[language] || selectedGroup.replaceAll("_", " ")}</h3>
        <div className="website-media-grid">
          {visibleEntries.map((entry) => (
            <MediaEditor
              item={entry}
              key={entry.id || entry._draftKey}
              language={language}
              onDelete={deleteItem}
              onSave={saveItem}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

export default WebsiteMediaManager;
