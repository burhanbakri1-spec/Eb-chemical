import React from "react";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

const aboutImages = {
  hero: "/images/products/multi-surface-cleaner.svg",
  banner: "/images/products/car-interior-cleaner.svg",
  cta: "/images/products/limescale-remover.svg",
};

function AboutPage({ language = "en", onNavigate, websiteMedia = [] }) {
  const isArabic = language === "ar";
  const images = {
    hero: getWebsiteMediaImage(websiteMedia, "about_hero", aboutImages.hero),
    banner: getWebsiteMediaImage(websiteMedia, "about_banner", aboutImages.banner),
    cta: getWebsiteMediaImage(websiteMedia, "about_cta", aboutImages.cta),
  };

  return (
    <main className="about-editorial-page">
      <section className="about-hero-section">
        <img alt="" aria-hidden="true" src={images.hero} />
        <div className="about-hero-copy">
          <span className="about-review-badge">{isArabic ? "EB Chemical" : "EB Chemical"}</span>
          <h1>{isArabic ? "نحن هنا لجعل التنظيف أسهل" : "We’re here to make cleaning simpler"}</h1>
          <p>
            {isArabic
              ? "منتجات تنظيف وعناية عملية للمنزل والسيارة والمساحات اليومية."
              : "Practical cleaning and care products for homes, cars, and everyday spaces."}
          </p>
        </div>
      </section>

      <section className="about-intro-section">
        <p>
          {isArabic
            ? "في EB Chemical، نطوّر منتجات تنظيف وعناية عملية للاستخدام اليومي، لتصبح العناية بالمنزل والسيارة أسهل وأنظف وأكثر فعالية."
            : "At EB Chemical, we create practical cleaning and care products for daily use, making home and car care easier, cleaner, and more effective."}
        </p>
      </section>

      <section className="about-image-banner">
        <img alt="" aria-hidden="true" src={images.banner} />
        <div>
          <h2>{isArabic ? "إعادة التفكير في التنظيف اليومي" : "Rethinking everyday cleaning"}</h2>
          <p>
            {isArabic
              ? "نطوّر منتجات للعناية بالمنزل والسيارة تناسب الروتين اليومي وتساعد العملاء في الحفاظ على مساحات نظيفة ومنعشة بجهد أقل."
              : "We design home and car care products that fit daily routines and help customers keep their spaces fresh with less effort."}
          </p>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="about-cta-image">
          <img alt="" aria-hidden="true" src={images.cta} />
        </div>
        <div className="about-cta-copy">
          <h2>{isArabic ? "انضم إلينا لجعل التنظيف أسهل" : "Join us in making cleaning simpler"}</h2>
          <p>
            {isArabic
              ? "منتجات عملية للعناية بالمنزل والسيارة، مصممة لتنظيف يومي أسهل وأكثر موثوقية."
              : "Practical home and car care products for easier, more reliable daily cleaning."}
          </p>
          <button className="primary-action large" onClick={() => onNavigate?.("products")} type="button">
            {isArabic ? "اكتشف المزيد" : "Discover more"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
