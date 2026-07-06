import React from "react";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

const lifestyleImage = "/products/limescale-remover-main.jpg";
const saveBannerImage = "/products/limescale-remover-hover.jpg";

function PointsIcon({ type }) {
  const paths = {
    order: (
      <>
        <path d="M5 8.5 12 4l7 4.5-7 4.5L5 8.5Z" />
        <path d="M5 8.5v7L12 20l7-4.5v-7" />
        <path d="M12 13v7" />
      </>
    ),
    social: (
      <>
        <path d="M7 19v-1.2A4.8 4.8 0 0 1 11.8 13h.4A4.8 4.8 0 0 1 17 17.8V19" />
        <path d="M9 7.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
        <path d="M18 7h3" />
        <path d="M19.5 5.5v3" />
      </>
    ),
    gift: (
      <>
        <path d="M5 11h14v9H5z" />
        <path d="M4 7h16v4H4z" />
        <path d="M12 7v13" />
        <path d="M12 7s-4.5.2-4.5-2.1C7.5 3.8 8.4 3 9.5 3 11.2 3 12 7 12 7Z" />
        <path d="M12 7s4.5.2 4.5-2.1C16.5 3.8 15.6 3 14.5 3 12.8 3 12 7 12 7Z" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="eb-points-card-icon" fill="none" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

function localized(en, ar, he) {
  if (language === "ar") return ar;
  if (language === "he") return he;
  return en;
}

function EBPointsPage({ currentUser, language, onNavigate, websiteMedia = [] }) {
  const resolvedLifestyleImage = getWebsiteMediaImage(
    websiteMedia,
    "eb_points_lifestyle",
    lifestyleImage,
  );
  const resolvedSaveBannerImage = getWebsiteMediaImage(
    websiteMedia,
    "eb_points_save_banner",
    saveBannerImage,
  );
  const cards = [
    {
      icon: "order",
      badge: localized("1 EB POINT FOR EVERY ₪1 SPENT", "نقطة EB لكل 1 شيكل", "נקודת EB אחת על כל ₪1"),
      title: localized("Place an order", "اطلب من الموقع", "בצע הזמנה"),
      description: localized(
        "Earn 1 EB Point for every ₪1 you spend on EB Chemical products.",
        "اكسب نقطة EB مقابل كل 1 شيكل تنفقه على منتجات EB Chemical.",
        "הרוויח נקודת EB אחת על כל ₪1 שאתה מוציא על מוצרי EB Chemical.",
      ),
    },
    {
      icon: "social",
      badge: localized("50 EB POINTS", "50 نقطة EB", "50 נקודות EB"),
      title: localized("Follow us on Instagram", "تابعنا على إنستغرام", "עקבו אחרינו באינסטגרם"),
      description: localized(
        "Follow EB Chemical on Instagram and earn extra points as part of our loyalty program.",
        "تابع EB Chemical على إنستغرام واحصل على نقاط إضافية ضمن برنامج الولاء.",
        "עקבו אחרי EB Chemical באינסטגרם והרוויחו נקודות נוספות במסגרת תוכנית הנאמנות.",
      ),
    },
    {
      icon: "gift",
      badge: localized("50 EB POINTS", "50 نقطة EB", "50 נקודות EB"),
      title: localized("Celebrate your birthday", "احتفل بعيد ميلادك", "חגוג את יום ההולדת שלך"),
      description: localized(
        "Get bonus EB Points on your birthday as a thank-you from EB Chemical.",
        "احصل على نقاط EB إضافية في عيد ميلادك كهدية من EB Chemical.",
        "קבל נקודות EB נוספות ביום ההולדת שלך כמתנה מ-EB Chemical.",
      ),
    },
  ];

  return (
    <section className="eb-points-page">
      <section className="eb-points-hero">
        <div>
          <h1>{localized("EB Points Loyalty Program", "برنامج نقاط EB", "תוכנית הנאמנות EB Points")}</h1>
          <p>
            {localized(
              "Earn reward points on every purchase. Redeem for discounts on future purchases. 100 EB Points = ₪5",
              "اكسب نقاط مكافآت مع كل عملية شراء. استخدمها للحصول على خصومات في مشترياتك القادمة. كل 100 نقطة EB = 5 شيكل",
              "הרוויח נקודות תגמול על כל רכישה. השתמש בהן להנחות ברכישות הבאות. 100 EB Points = ₪5",
            )}
          </p>
          <div className="eb-points-hero-rating">
            <span className="eb-points-hero-rating-text">
              {localized(
                "Over 500+ orders from happy customers",
                "أكثر من 500+ طلب من عملاء سعداء",
                "יותר מ-500+ הזמנות מלקוחות מרוצים",
              )}
            </span>
            <span className="eb-points-hero-stars">
              <strong>4.85</strong>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0L13.09 6.26L20 7.12L14.14 12.17L15.12 19.02L10 15.71L4.87 19.02L5.85 12.17L0 7.12L6.91 6.26L10 0Z" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      <section className="eb-points-lifestyle" aria-label={localized("EB Points lifestyle", "نقاط EB", "אורח חיים EB Points")}>
        <img alt="" src={resolvedLifestyleImage} />
      </section>

      <section className="eb-points-how">
        <h2>{localized("How it works", "كيف يعمل البرنامج", "איך זה עובד")}</h2>
        <div className="eb-points-card-grid">
          {cards.map((card) => (
            <article className="eb-points-step-card" key={card.icon}>
              <div className="eb-points-step-visual">
                <PointsIcon type={card.icon} />
              </div>
              <div className="eb-points-step-copy">
                <span>{card.badge}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="eb-points-cta">
        <img alt="" src={resolvedSaveBannerImage} />
        <div className="eb-points-cta-copy">
          <h2>{localized("Save with every order", "وفّر مع كل طلب", "חסוך בכל הזמנה")}</h2>
          <p>
            {localized(
              "Find out how many EB Points you've already saved in your account page.",
              "اكتشف عدد نقاط EB التي جمعتها بالفعل من خلال صفحة حسابك.",
              "גלה כמה נקודות EB כבר צברת בדף החשבון שלך.",
            )}
          </p>
          <button
            className="eb-points-yellow-button"
            onClick={() => onNavigate(currentUser ? "account" : "register")}
            type="button"
          >
            {localized("Sign up", "سجّل الآن", "הירשם")}
          </button>
        </div>
      </section>
    </section>
  );
}

export default EBPointsPage;
