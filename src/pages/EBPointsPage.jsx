import React from "react";

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

function EBPointsPage({ currentUser, language, onNavigate }) {
  const isArabic = language === "ar";
  const cards = [
    {
      icon: "order",
      badge: isArabic ? "نقطة EB لكل 1 شيكل" : "1 EB POINT FOR EVERY ₪1 SPENT",
      title: isArabic ? "اطلب من الموقع" : "Place an order",
      description: isArabic
        ? "اكسب نقطة EB مقابل كل 1 شيكل تنفقه على منتجات EB Chemical."
        : "Earn 1 EB Point for every ₪1 you spend on EB Chemical products.",
    },
    {
      icon: "social",
      badge: isArabic ? "50 نقطة EB" : "50 EB POINTS",
      title: isArabic ? "تابعنا على إنستغرام" : "Follow us on Instagram",
      description: isArabic
        ? "تابع EB Chemical على إنستغرام واحصل على نقاط إضافية ضمن برنامج الولاء."
        : "Follow EB Chemical on Instagram and earn extra points as part of our loyalty program.",
    },
    {
      icon: "gift",
      badge: isArabic ? "50 نقطة EB" : "50 EB POINTS",
      title: isArabic ? "احتفل بعيد ميلادك" : "Celebrate your birthday",
      description: isArabic
        ? "احصل على نقاط EB إضافية في عيد ميلادك كهدية من EB Chemical."
        : "Get bonus EB Points on your birthday as a thank-you from EB Chemical.",
    },
  ];

  return (
    <section className="eb-points-page">
      <section className="eb-points-hero">
        <div>
          <h1>{isArabic ? "برنامج نقاط EB" : "EB Points Loyalty Program"}</h1>
          <p>
            {isArabic
              ? "اكسب نقاط مكافآت مع كل عملية شراء، واستبدل نقاط EB بخصومات على طلباتك القادمة. كل 100 نقطة EB تمنحك خصم 5%."
              : "Earn reward points on every purchase. Redeem your EB Points for discounts on future orders. 100 EB Points = 5% discount."}
          </p>
          <div className="eb-points-rating-row">
            <span>
              {isArabic
                ? "أكثر من 434+ تقييم من عملاء سعداء"
                : "Over 434+ reviews from happy customers"}
            </span>
            <strong>4.85 <span>★</span></strong>
          </div>
        </div>
      </section>

      <section className="eb-points-lifestyle" aria-label={isArabic ? "نقاط EB" : "EB Points lifestyle"}>
        <img alt="" src={lifestyleImage} />
      </section>

      <section className="eb-points-how">
        <h2>{isArabic ? "كيف يعمل البرنامج" : "How it works"}</h2>
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
        <img alt="" src={saveBannerImage} />
        <div className="eb-points-cta-copy">
          <h2>{isArabic ? "وفّر مع كل طلب" : "Save with every order"}</h2>
          <p>
            {isArabic
              ? "تابع نقاط EB من صفحة حسابك واعرف كم وفّرت على طلباتك القادمة."
              : "Track your EB Points from your account page and see how much you’ve already saved on future purchases."}
          </p>
          <button
            className="eb-points-yellow-button"
            onClick={() => onNavigate(currentUser ? "account" : "register")}
            type="button"
          >
            {isArabic ? "سجّل الآن" : "Sign up"}
          </button>
        </div>
      </section>
    </section>
  );
}

export default EBPointsPage;
