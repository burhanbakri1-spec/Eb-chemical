import React from "react";
import { brand } from "../data/brand.js";

function Footer({ onNavigate, t }) {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <h2>{t("footer.newsletterTitle")}</h2>
        <p>{t("home.socialText")}</p>
        <div className="newsletter-form">
          <input aria-label="Email" placeholder={t("footer.emailPlaceholder")} />
          <button className="primary-action" type="button">{t("footer.subscribe")}</button>
        </div>
      </div>

      <div className="footer-brand-block">
        <button className="footer-logo" onClick={() => onNavigate("home")}>
          {brand.logoText}
        </button>
        <p>{t("footer.description")}</p>
      </div>

      <div className="footer-links">
        <strong>{t("footer.shop")}</strong>
        <button onClick={() => onNavigate("products")} type="button">
          {t("nav.products")}
        </button>
        <button onClick={() => onNavigate("about")} type="button">
          {t("nav.about")}
        </button>
        <button onClick={() => onNavigate("social")} type="button">
          {t("nav.social")}
        </button>
        <a href={`https://wa.me/${brand.whatsappLinkNumber}`}>WhatsApp</a>
      </div>

      <p className="footer-note">{t("footer.description")}</p>
    </footer>
  );
}

export default Footer;
