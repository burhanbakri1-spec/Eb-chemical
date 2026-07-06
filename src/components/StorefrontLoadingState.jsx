import React from "react";

export function StorefrontLoadingState({ label = "Loading the latest EB Chemical content", language = "en" }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  if (label === "Loading the latest EB Chemical content") {
    label = localized(
      "Loading the latest EB Chemical content",
      "جارٍ تحميل أحدث محتوى من EB Chemical",
      "טוען את התוכן העדכני ביותר של EB Chemical",
    );
  }
  return (
    <section className="storefront-loading-state" aria-busy="true" aria-label={label}>
      <div className="storefront-skeleton storefront-skeleton-hero" />
      <div className="storefront-skeleton-grid">
        <div className="storefront-skeleton storefront-skeleton-card" />
        <div className="storefront-skeleton storefront-skeleton-card" />
        <div className="storefront-skeleton storefront-skeleton-card" />
      </div>
    </section>
  );
}

export function StorefrontEmptyState({ message, title }) {
  return (
    <section className="page-shell storefront-empty-state" role="status">
      <div className="empty-panel">
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </section>
  );
}
