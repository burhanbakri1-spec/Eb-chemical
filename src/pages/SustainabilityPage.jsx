import React from "react";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

const referenceImages = {
  hero: "https://kinfill.com/cdn/shop/files/7-hand-wash_ca230465-2716-45d5-a94d-aa758eea3c4d.jpg?v=1761639215&width=2000",
  why: "https://kinfill.com/cdn/shop/files/about-kinfill.png?crop=center&height=1080&v=1761647602&width=1920",
  refill: "https://kinfill.com/cdn/shop/files/sustainability-b-corp_1.jpg?crop=center&height=1080&v=1761643484&width=1920",
  safe: "https://kinfill.com/cdn/shop/files/sustainability-safe-body-planet.jpg?crop=center&height=1080&v=1761640080&width=1920",
  performance: "https://kinfill.com/cdn/shop/files/sustainability-performance.jpg?v=1761640082&width=1200",
  impact: "https://kinfill.com/cdn/shop/files/background-impact.jpg?v=1746041840&width=1800",
  stat1: "https://kinfill.com/cdn/shop/files/758411ca1bec7446b7001c23a5fc0ded.jpg?crop=center&height=240&v=1743773389&width=240",
  stat2: "https://kinfill.com/cdn/shop/files/568df7bc6414b1c8b0c565bd5f3245f6.jpg?crop=center&height=240&v=1743773404&width=240",
  stat3: "https://kinfill.com/cdn/shop/files/419a5c884dfb47477b9d1870d1d2ce87.png?crop=center&height=240&v=1743773418&width=240",
  product1: "https://kinfill.com/cdn/shop/files/kinfill-baby-soap-bar-hypoallergenic-plastic-free.jpg?v=1770132324&width=600",
  product2: "https://kinfill.com/cdn/shop/files/Porcelain_Yoga_Spray.jpg?v=1762785486&width=600",
  product3: "https://kinfill.com/cdn/shop/files/1-pump-porcelain_3389268b-1f4c-45d9-a5d3-5fd0b5279b15.jpg?v=1762786399&width=600",
  product4: "https://kinfill.com/cdn/shop/files/1-pump-cloud_c9a0c7c1-f0af-4c69-9853-8903f3dc21a8.jpg?v=1762789727&width=600",
  cta: "https://kinfill.com/cdn/shop/files/dish-soap-2_968044b4-c1a6-4ad1-ade0-e8de01cc7eb5.jpg?v=1763563465&width=1200",
};

const copy = {
  en: {
    heroTitle: "Refills That Revolutionise",
    heroSub: "Smarter living starts here",
    reviews: "Over 500+ reviews from happy users",
    rating: "4.85",
    intro: "We design products that make everyday cleaning easier, more effective, and less wasteful.",
    why: "Why Choose EB Chemical?",
    benefits: [
      { title: "Refillable design", text: "Less waste, same performance.", image: "refill" },
      { title: "Responsible standards", text: "Clear quality control in every product.", image: "why" },
      { title: "Safe for daily spaces", text: "Reliable formulas for homes and workplaces.", image: "safe" },
      { title: "Performance trusted", text: "Strong cleaning with a lighter footprint.", image: "performance" },
    ],
    impactTitle: "The Impact",
    impactText: "Simple numbers. Clear progress.",
    impactLine: "Making everyday routines count",
    since: "Since we started",
    stats: [
      { image: "stat1", number: "500+", label: "orders handled" },
      { image: "stat2", number: "20+", label: "products available" },
      { image: "stat3", number: "4", label: "main categories" },
    ],
    most: "Most requested products",
    products: [
      { image: "product1", tag: "Daily Care", title: "Multi Surface Cleaner", meta: "From $9" },
      { image: "product2", tag: "Car Care", title: "Car Shampoo", meta: "From $10" },
      { image: "product3", tag: "Home Care", title: "Fabric Cleaner", meta: "From $8" },
      { image: "product4", tag: "Cooling", title: "Radiator Water", meta: "From $7" },
    ],
    ourProducts: "Our products",
    ourText: "Performance without unnecessary waste.",
    accordions: [
      { title: "Formulated with purpose", text: "Practical formulas for daily use." },
      { title: "Refill-ready", text: "Reduced packaging by design." },
      { title: "Built to last", text: "Durability for smarter routines." },
    ],
    ctaTitle: "Goodbye, waste. Hello, smarter cleaning.",
    ctaText: "Explore all refillable products.",
    ctaButton: "Discover products",
    ctaTag: "Cleaners",
  },
  ar: {
    heroTitle: "إعادة تعبئة تغيّر الروتين",
    heroSub: "تنظيف أذكى يبدأ من هنا",
    reviews: "+500 تقييم من عملائنا",
    rating: "4.85",
    intro: "نصمم منتجات تجعل التنظيف اليومي أسهل، أقوى، وبأقل هدر.",
    why: "لماذا EB Chemical؟",
    benefits: [
      { title: "تصميم قابل لإعادة الاستخدام", text: "هدر أقل بنفس الأداء.", image: "refill" },
      { title: "معايير أوضح", text: "رقابة جودة واضحة في كل منتج.", image: "why" },
      { title: "آمنة للمساحات اليومية", text: "تركيبات موثوقة للبيت والعمل.", image: "safe" },
      { title: "أداء موثوق", text: "تنظيف قوي بأثر أخف.", image: "performance" },
    ],
    impactTitle: "الأثر",
    impactText: "أرقام بسيطة. تقدّم واضح.",
    impactLine: "كل روتين يومي يصنع فرقًا",
    since: "منذ البداية",
    stats: [
      { image: "stat1", number: "+500", label: "طلب مُدار" },
      { image: "stat2", number: "+20", label: "منتج متاح" },
      { image: "stat3", number: "4", label: "أقسام رئيسية" },
    ],
    most: "المنتجات الأكثر طلبًا",
    products: [
      { image: "product1", tag: "عناية يومية", title: "منظف متعدد الاستخدام", meta: "ابتداءً من $9" },
      { image: "product2", tag: "عناية السيارة", title: "شامبو السيارة", meta: "ابتداءً من $10" },
      { image: "product3", tag: "عناية المنزل", title: "منظف الأقمشة", meta: "ابتداءً من $8" },
      { image: "product4", tag: "تبريد", title: "مياه رديتر", meta: "ابتداءً من $7" },
    ],
    ourProducts: "منتجاتنا",
    ourText: "أداء قوي وبدون هدر زائد.",
    accordions: [
      { title: "تركيبات هادفة", text: "تركيبات عملية للاستخدام اليومي." },
      { title: "جاهزة لإعادة التعبئة", text: "تقليل التغليف الزائد بالتصميم." },
      { title: "مصممة لتدوم", text: "متانة لروتين أذكى." },
    ],
    ctaTitle: "وداعًا للهدر. مرحبًا بتنظيف أذكى.",
    ctaText: "استكشف المنتجات القابلة لإعادة الاستخدام.",
    ctaButton: "اكتشف المنتجات",
    ctaTag: "منظفات",
  },
};

function Accordion({ items }) {
  const [active, setActive] = React.useState(0);
  return (
    <div className="sus-kin-accordion">
      {items.map((item, index) => (
        <article key={item.title} className={active === index ? "is-open" : ""}>
          <button type="button" onClick={() => setActive(active === index ? -1 : index)}>
            <span>{item.title}</span>
            <span>{active === index ? "−" : "+"}</span>
          </button>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function SustainabilityPage({ language = "en", onNavigate, websiteMedia = [] }) {
  const isArabic = language === "ar";
  const t = copy[isArabic ? "ar" : "en"];
  const img = React.useCallback(
    (key) => getWebsiteMediaImage(websiteMedia, `sustainability_${key}`, referenceImages[key]) || referenceImages[key],
    [websiteMedia]
  );

  return (
    <main className="sus-kin-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="sus-kin-hero">
        <img src={img("hero")} alt="" />
        <div className="sus-kin-hero-copy">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroSub}</p>
          <div className="sus-kin-review">
            <span>{t.reviews}</span>
            <strong>{t.rating}</strong>
          </div>
        </div>
      </section>

      <section className="sus-kin-intro">
        <p>{t.intro}</p>
      </section>

      <section className="sus-kin-why">
        <img src={img("why")} alt="" />
        <h2>{t.why}</h2>
      </section>

      <section className="sus-kin-benefits">
        {t.benefits.map((item, index) => (
          <article key={item.title} className={index % 2 ? "is-flipped" : ""}>
            <div className="sus-kin-benefit-image"><img src={img(item.image)} alt="" /></div>
            <div className="sus-kin-benefit-copy">
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="sus-kin-impact">
        <img className="sus-kin-impact-bg" src={img("impact")} alt="" />
        <div className="sus-kin-impact-head">
          <h2>{t.impactTitle}</h2>
          <p>{t.impactText}</p>
        </div>
        <div className="sus-kin-impact-body">
          <p>{t.impactLine}</p>
          <small>{t.since}</small>
          <div className="sus-kin-stats">
            {t.stats.map((stat) => (
              <article key={stat.label}>
                <img src={img(stat.image)} alt="" />
                <strong>{stat.number}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sus-kin-most">
        <h2>{t.most}</h2>
        <div className="sus-kin-product-row">
          {t.products.map((product) => (
            <article key={product.title}>
              <div><img src={img(product.image)} alt="" /></div>
              <span>{product.tag}</span>
              <h3>{product.title}</h3>
              <p>{product.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sus-kin-products-info">
        <div className="sus-kin-products-title">
          <h2>{t.ourProducts}</h2>
          <p>{t.ourText}</p>
        </div>
        <Accordion items={t.accordions} />
      </section>

      <section className="sus-kin-final">
        <div className="sus-kin-final-product">
          <img src={img("cta")} alt="" />
        </div>
        <div className="sus-kin-final-copy">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <button type="button" onClick={() => onNavigate?.("products")}>{t.ctaButton}</button>
          <span>{t.ctaTag}</span>
        </div>
      </section>
    </main>
  );
}

export default SustainabilityPage;
