import React from "react";
import { brand } from "../data/brand.js";
import { trackContact, trackSocialClick } from "../utils/metaPixel.js";

const instagramUrl = "https://www.instagram.com/eb_chemical";
const facebookUrl = "https://www.facebook.com/profile.php?id=61586630773060";

function localized(en, ar, he, language) {
  if (language === "ar") return ar;
  if (language === "he") return he;
  return en;
}

function Footer({ onNavigate, t, language = "en" }) {
  const [openSection, setOpenSection] = React.useState("shop");

  function toggleSection(section) {
    setOpenSection((current) => (current === section ? "" : section));
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col footer-col-newsletter">
          <div className="footer-newsletter-card">
            <h3>{t("footer.newsletterTitle")}</h3>
            <p>{localized("Follow updates, product care tips, and upcoming offers from EB Chemical.", "تابع التحديثات ونصائح العناية بالمنتجات والعروض القادمة من EB Chemical.", "עקבו אחר עדכונים, טיפים למוצרים ומבצעים קרובים מ-EB Chemical.", language)}</p>
            <div className="footer-newsletter-form">
              <input aria-label="Email" placeholder={t("footer.emailPlaceholder")} />
              <button type="button">{t("footer.subscribe")}</button>
            </div>
          </div>
        </div>

        <div className={openSection === "shop" ? "footer-col footer-col-shop is-open" : "footer-col footer-col-shop"}>
          <button
            aria-expanded={openSection === "shop"}
            className="footer-section-toggle"
            onClick={() => toggleSection("shop")}
            type="button"
          >
            <span>{t("footer.shop")}</span>
            <span className="footer-section-icon" aria-hidden="true">{openSection === "shop" ? "\u2212" : "+"}</span>
          </button>
          <p className="footer-brand-text">{t("footer.description")}</p>
          <nav>
            <button onClick={() => onNavigate("products")} type="button">{t("footer.products")}</button>
            <button type="button">{localized("Cleaning Products", "منتجات التنظيف", "מוצרי ניקוי", language)}</button>
            <button type="button">{localized("Car Care", "العناية بالسيارة", "טיפוח רכב", language)}</button>
            <button type="button">{localized("Bundles & Sets", "الباقات والمجموعات", "מארזים וסטים", language)}</button>
            <button type="button">{localized("Refills", "إعادة التعبئة", "מילוי", language)}</button>
            <button type="button">{localized("Accessories", "الإكسسوارات", "אביזרים", language)}</button>
          </nav>
        </div>

        <div className={openSection === "about" ? "footer-col footer-col-about is-open" : "footer-col footer-col-about"}>
          <button
            aria-expanded={openSection === "about"}
            className="footer-section-toggle"
            onClick={() => toggleSection("about")}
            type="button"
          >
            <span>{localized("About", "حول", "אודות", language)}</span>
            <span className="footer-section-icon" aria-hidden="true">{openSection === "about" ? "\u2212" : "+"}</span>
          </button>
          <nav>
            <button onClick={() => onNavigate("about")} type="button">{localized("About us", "معلومات عنا", "עלינו", language)}</button>
            <button type="button">{localized("How it Works", "كيف يعمل", "איך זה עובד", language)}</button>
            <button type="button">{localized("Sustainability", "الاستدامة", "קיימות", language)}</button>
            <button type="button">{localized("Stories", "قصص", "סיפורים", language)}</button>
            <button type="button">{localized("Careers", "الوظائف", "קריירה", language)}</button>
            <button type="button">{localized("Wholesale", "الجملة", "סיטונאי", language)}</button>
          </nav>
        </div>

        <div className={openSection === "help" ? "footer-col footer-col-help is-open" : "footer-col footer-col-help"}>
          <button
            aria-expanded={openSection === "help"}
            className="footer-section-toggle"
            onClick={() => toggleSection("help")}
            type="button"
          >
            <span>{localized("Help & support", "المساعدة والدعم", "עזרה ותמיכה", language)}</span>
            <span className="footer-section-icon" aria-hidden="true">{openSection === "help" ? "\u2212" : "+"}</span>
          </button>
          <nav>
            <button type="button">{localized("Frequently asked questions", "الأسئلة الشائعة", "שאלות נפוצות", language)}</button>
            <button type="button">{localized("Shipping Information", "معلومات الشحن", "מידע משלוחים", language)}</button>
            <button onClick={() => trackContact({ method: "contact" })} type="button">
              {t("footer.contact")}
            </button>
            <a
              href={`https://wa.me/${brand.whatsappLinkNumber}`}
              onClick={() => trackContact({ method: "whatsapp", url: `https://wa.me/${brand.whatsappLinkNumber}` })}
            >
              {localized("WhatsApp", "واتساب", "וואטסאפ", language)}
            </a>
            <a
              href={instagramUrl}
              onClick={() => trackSocialClick({ platform: "instagram", url: instagramUrl })}
              rel="noopener noreferrer"
              target="_blank"
            >
              {localized("Instagram", "إنستغرام", "אינסטגרם", language)}
            </a>
            <a
              href={facebookUrl}
              onClick={() => trackSocialClick({ platform: "facebook", url: facebookUrl })}
              rel="noopener noreferrer"
              target="_blank"
            >
              {localized("Facebook", "فيسبوك", "פייסבוק", language)}
            </a>
            <button type="button">{localized("Terms & Conditions", "الشروط والأحكام", "תנאים והגבלות", language)}</button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
