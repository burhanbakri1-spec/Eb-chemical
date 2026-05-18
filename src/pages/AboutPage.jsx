import React from "react";

function AboutPage({ t }) {
  return (
    <section className="page-shell about-page">
      <div className="page-heading">
        <p className="eyebrow">{t("about.eyebrow")}</p>
        <h1>{t("about.title")}</h1>
      </div>

      <article className="content-panel">
        <p>{t("brand.aboutText")}</p>
        <div className="brand-content-note">
          <strong>{t("brand.tagline")}</strong>
          <p>{t("brand.contentNotice")}</p>
        </div>
      </article>
    </section>
  );
}

export default AboutPage;
