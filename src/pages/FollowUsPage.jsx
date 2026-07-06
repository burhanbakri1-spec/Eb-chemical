import React from "react";
import { trackContact, trackSocialClick } from "../utils/metaPixel.js";

const socialLinks = [
  {
    key: "instagram",
    name: "Instagram",
    handle: "@eb_chemical",
    url: "https://www.instagram.com/eb_chemical",
    icon: "IG",
    descriptionEn: "Follow product care tips, updates, and everyday cleaning ideas.",
    descriptionAr: "تابع نصائح العناية بالمنتجات والتحديثات وأفكار التنظيف اليومية.",
    descriptionHe: "עקבו אחר טיפים לטיפול במוצרים, עדכונים ורעיונות לניקיון יומיומי.",
  },
  {
    key: "facebook",
    name: "Facebook",
    handle: "EB Chemical",
    url: "https://www.facebook.com/profile.php?id=61586630773060",
    icon: "f",
    descriptionEn: "See announcements, offers, and EB Chemical news.",
    descriptionAr: "شاهد الإعلانات والعروض وأخبار EB Chemical.",
    descriptionHe: "ראה הודעות, מבצעים וחדשות EB Chemical.",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    handle: "00972599130765",
    url: "https://wa.me/972599130765",
    icon: "WA",
    descriptionEn: "Direct support and product inquiries will be available soon.",
    descriptionAr: "الدعم المباشر واستفسارات المنتجات ستكون متاحة قريبًا.",
    descriptionHe: "תמיכה ישירה ושאלות על מוצרים יהיו זמינות בקרוב.",
  },
  {
    key: "email",
    name: "Email",
    handle: "elyas.2006@yahoo.com",
    url: "mailto:elyas.2006@yahoo.com",
    icon: "@",
    descriptionEn: "Send us questions, product requests, or business inquiries by email.",
    descriptionAr: "أرسل لنا أسئلتك وطلبات المنتجات أو استفسارات العمل عبر البريد الإلكتروني.",
    descriptionHe: "שלח לנו שאלות, בקשות מוצרים או פניות עסקיות במייל.",
  },
  {
    key: "tiktok",
    name: "TikTok",
    handle: "Coming soon",
    url: "",
    icon: "TT",
    descriptionEn: "Short cleaning tips and product videos will be available soon.",
    descriptionAr: "نصائح تنظيف قصيرة وفيديوهات منتجات ستكون متاحة قريبًا.",
    descriptionHe: "טיפים קצרים לניקיון וסרטוני מוצרים יהיו זמינים בקרוב.",
  },
];

function FollowUsPage({ language = "en" }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  function handleSocialClick(social) {
    trackSocialClick({ platform: social.key, url: social.url });
    if (social.key === "whatsapp" || social.key === "email") {
      trackContact({ method: social.key, url: social.url });
    }
  }

  return (
    <section className="page-shell social-page follow-us-page">
      <div className="page-heading">
        <p className="eyebrow">{localized("Follow us", "تابعنا", "עקבו אחרינו")}</p>
        <h1>{localized("Follow EB Chemical", "تابع EB Chemical", "עקבו אחרי EB Chemical")}</h1>
        <p>{localized("Stay connected with EB Chemical through our official social media channels.", "ابقَ على تواصل مع EB Chemical عبر قنوات التواصل الاجتماعي الرسمية.", "הישארו מחוברים ל-EB Chemical דרך ערוצי המדיה החברתית הרשמיים שלנו.")}</p>
      </div>

      <div className="social-grid follow-social-grid">
        {socialLinks.map((social) => {
          const CardElement = social.url ? "a" : "article";
          const cardProps = social.url
            ? {
                href: social.url,
                onClick: () => handleSocialClick(social),
                rel: "noopener noreferrer",
                target: "_blank",
              }
            : {
                "aria-label": `${social.name} ${localized("link coming soon", "الرابط قريبًا", "הקישור בקרוב")}`,
              };

          return (
            <CardElement
              className={`social-card follow-social-card follow-social-card-${social.key}${
                social.url ? "" : " follow-social-card-disabled"
              }`}
              key={social.name}
              {...cardProps}
            >
              <span className="follow-social-icon">{social.icon}</span>
              <div className="follow-social-copy">
                <h2>{social.name}</h2>
                <strong>{social.handle}</strong>
                <p>{localized(social.descriptionEn, social.descriptionAr, social.descriptionHe)}</p>
              </div>
              <span className="follow-social-status">{social.url ? localized("Open channel", "فتح القناة", "פתח ערוץ") : localized("Link coming soon", "الرابط قريبًا", "הקישור בקרוב")}</span>
            </CardElement>
          );
        })}
      </div>
    </section>
  );
}

export default FollowUsPage;
