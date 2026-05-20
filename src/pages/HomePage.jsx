import React, { useRef } from "react";
import CategoryCard from "../components/CategoryCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import FloatingProductCollage from "../components/FloatingProductCollage.jsx";
import { brand } from "../data/brand.js";
import { categories } from "../data/categories.js";

function getLocalized(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

function getPromotedProducts(products) {
  const promoted = products.filter((product) => {
    const badgeText = `${getLocalized(product.badge, "en")} ${getLocalized(product.badge, "ar")}`.toLowerCase();
    return (
      product.featured ||
      product.offer ||
      product.bestSeller ||
      product.discount ||
      product.salesCount > 0 ||
      badgeText.includes("best") ||
      badgeText.includes("new") ||
      badgeText.includes("gloss") ||
      badgeText.includes("fresh") ||
      badgeText.includes("الأكثر")
    );
  });

  return (promoted.length ? promoted : products).slice(0, 6);
}

function FeaturedProductsCarousel({ language, onAddToCart, onViewProduct, products, t }) {
  const carouselRef = useRef(null);
  const promotedProducts = getPromotedProducts(products);
  const isArabic = language === "ar";

  function scrollCarousel(direction) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const card = carousel.querySelector(".featured-offer-card");
    const distance = card ? card.getBoundingClientRect().width + 18 : carousel.clientWidth * 0.8;
    carousel.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  }

  if (!promotedProducts.length) return null;

  return (
    <section className="featured-offers-section storefront-wide-section">
      <div className="featured-offers-heading">
        <div>
          <p className="eyebrow">{isArabic ? "منتجات مميزة" : "Featured products"}</p>
          <h2>{isArabic ? "عروض ومنتجات عليها طلب كبير" : "Offers and high-demand products"}</h2>
          <p>
            {isArabic
              ? "اكتشف المنتجات الأكثر طلبًا من EB Chemical للعناية والتنظيف، مختارة لتناسب الاستخدام اليومي بجودة عالية وتجربة عملية."
              : "Discover high-demand EB Chemical cleaning and care products selected for daily use, reliable quality, and a practical experience."}
          </p>
        </div>
        <div className="carousel-controls" aria-label={isArabic ? "التحكم بالمنتجات" : "Carousel controls"}>
          <button
            aria-label={isArabic ? "السابق" : "Previous"}
            className="carousel-arrow"
            onClick={() => scrollCarousel(isArabic ? 1 : -1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label={isArabic ? "التالي" : "Next"}
            className="carousel-arrow"
            onClick={() => scrollCarousel(isArabic ? -1 : 1)}
            type="button"
          >
            ›
          </button>
        </div>
      </div>

      <div className="featured-offers-track" ref={carouselRef}>
        {promotedProducts.map((product, index) => {
          const firstSize = product.sizes?.[0] || { size: "", price: 0 };
          const label =
            getLocalized(product.badge, language) ||
            [
              isArabic ? "الأكثر طلبًا" : "High demand",
              isArabic ? "عرض خاص" : "Special offer",
              isArabic ? "منتج مميز" : "Featured",
              isArabic ? "جديد" : "New",
              isArabic ? "مناسب للاستخدام اليومي" : "Made for daily use",
            ][index % 5];

          return (
            <article
              className="featured-offer-card"
              key={product.id}
              style={{ "--stagger": `${index * 70}ms` }}
            >
              <button
                className="featured-offer-link"
                onClick={() => onViewProduct(product.slug)}
                type="button"
              >
                <img
                  alt={getLocalized(product.name, language)}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = product.fallbackImage || "/images/products/product-placeholder.svg";
                  }}
                  src={product.image || product.fallbackImage || "/images/products/product-placeholder.svg"}
                />
                <span className="featured-offer-overlay" />
                <span className="featured-offer-copy">
                  <small>{label}</small>
                  <strong>{getLocalized(product.name, language)}</strong>
                  <em>{getLocalized(product.shortDescription, language)}</em>
                  <b>
                    {t("common.from")} {firstSize.price} {t("common.ils")}
                  </b>
                </span>
              </button>
              <button
                className="featured-offer-cta"
                onClick={() => onAddToCart(product, firstSize.size)}
                type="button"
              >
                {isArabic ? "تسوق الآن" : "Shop now"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorksSplit({ language, onNavigate }) {
  const isArabic = language === "ar";
  const steps = isArabic
    ? [
        {
          title: "اختر المنتج المناسب",
          text: "حدد المنتج حسب نوع الاستخدام: المنزل، السيارة، المعطرات، أو ماء الرديتر.",
        },
        {
          title: "استخدمه بطريقة عملية",
          text: "منتجات EB Chemical مصممة لتكون سهلة الاستخدام وتناسب الاستخدام اليومي.",
        },
        {
          title: "احصل على نتيجة أفضل",
          text: "استمتع بنظافة واضحة، رائحة منعشة، وتجربة عناية أكثر ترتيبًا.",
        },
      ]
    : [
        {
          title: "Choose the right product",
          text: "Select the product for your use case: home, car care, fragrances, or radiator water.",
        },
        {
          title: "Use it with ease",
          text: "EB Chemical products are designed to be practical, clear, and suitable for daily use.",
        },
        {
          title: "Get a better result",
          text: "Enjoy visible cleanliness, a fresh scent, and a more organized care routine.",
        },
      ];

  return (
    <section className="how-works-split storefront-wide-section">
      <div className="how-works-image" aria-hidden="true">
        <div className="how-works-bottle how-works-bottle-main" />
        <div className="how-works-bottle how-works-bottle-small" />
      </div>
      <div className="how-works-panel">
        <p className="eyebrow">{isArabic ? "طريقة الاستخدام" : "How it works"}</p>
        <h2>{isArabic ? "تنظيف أسهل بخطوات بسيطة" : "Easier cleaning in simple steps"}</h2>
        <div className="how-works-steps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
        <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
          {isArabic ? "ابدأ التسوق" : "Start shopping"}
        </button>
      </div>
    </section>
  );
}

function HomePage({
  homepageOffers = [],
  language,
  onAddToCart,
  onCategorySelect,
  onNavigate,
  onViewProduct,
  products,
  reviews = [],
  t,
}) {
  const bestSellers = products
    .filter((product) =>
      ["Best Seller", "New", "Gloss Finish"].includes(product.badge.en)
    )
    .slice(0, 4);
  const featuredProducts = products.slice(8, 11);
  const heroImages = [products[0], products[1]].filter(Boolean);
  const activeOffers = homepageOffers
    .filter((offer) => offer.isActive !== false)
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
  const siteReviews = reviews.filter(
    (review) =>
      (review.type === "store" || review.type === "site" || !review.employeeId) &&
      review.isActive !== false &&
      review.isApproved !== false &&
      (review.status || "approved") === "approved",
  );

  function handleOfferClick(offer) {
    if (offer.ctaLink === "car-care" || offer.ctaLink === "home-cleaning") {
      onCategorySelect(offer.ctaLink);
      return;
    }
    onNavigate(offer.ctaLink || "products");
  }

  return (
    <div className="storefront-home">
      <section className="hero-section hero-editorial">
        <div className="hero-panel hero-panel-copy hero-copy-panel">
          <p className="eyebrow">{brand.name}</p>
          <h1>{t("home.heroHeadline")}</h1>
          <p>{t("home.heroSubheadline")}</p>
          <div className="hero-actions">
            <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
              {t("home.shopProducts")}
            </button>
            <button
              className="secondary-action large"
              onClick={() => document.getElementById("categories")?.scrollIntoView()}
              type="button"
            >
              {t("home.exploreCategories")}
            </button>
          </div>
        </div>

        <div className="hero-panel hero-panel-visual" aria-label={brand.name}>
          <div className="hero-image-duo hero-visuals">
            {heroImages.map((product, index) => (
              <button
                className="hero-image-panel hero-visual-panel"
                key={product.id}
                onClick={() => onViewProduct(product.slug)}
                type="button"
              >
                <img
                  alt={product.name?.[language] || product.name?.en}
                  src={product.image || product.fallbackImage || "/images/products/product-placeholder.svg"}
                  onError={(event) => {
                    event.currentTarget.src = "/images/products/product-placeholder.svg";
                  }}
                />
                <span>{index === 0 ? t("home.bestEyebrow") : t("home.highlightEyebrow")}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeOffers.length > 0 && (
        <section className="homepage-offers-section storefront-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{t("homeContent.eyebrow")}</p>
              <h2>{t("homeContent.title")}</h2>
            </div>
          </div>
          <div className="homepage-offers-grid">
            {activeOffers.map((offer) => (
              <article className="homepage-offer-card" key={offer.id}>
                <img
                  alt={getLocalized(offer.title, language)}
                  src={offer.image || "/images/products/product-placeholder.svg"}
                  onError={(event) => {
                    event.currentTarget.src = "/images/products/product-placeholder.svg";
                  }}
                />
                <div>
                  <h3>{getLocalized(offer.title, language)}</h3>
                  <p>{getLocalized(offer.description, language)}</p>
                  <button className="text-action" onClick={() => handleOfferClick(offer)} type="button">
                    {getLocalized(offer.ctaText, language) || t("home.shopProducts")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="category-feature-section storefront-section" id="categories">
        <div className="section-heading">
          <p className="eyebrow">{t("home.categoryEyebrow")}</p>
          <h2>{t("home.categoryTitle")}</h2>
        </div>
        <div className="category-grid feature-grid">
          {categories.map((category) => (
            <CategoryCard
              category={category}
              key={category.id}
              language={language}
              onSelect={onCategorySelect}
              productCount={
                products.filter((product) => product.categoryId === category.id).length
              }
              t={t}
            />
          ))}
        </div>
      </section>

      <FeaturedProductsCarousel
        language={language}
        onAddToCart={onAddToCart}
        onViewProduct={onViewProduct}
        products={products}
        t={t}
      />

      <section className="section-block storefront-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">{t("home.bestEyebrow")}</p>
            <h2>{t("home.bestTitle")}</h2>
          </div>
          <button
            className="text-action"
            onClick={() => onNavigate("products")}
            type="button"
          >
            {t("home.viewAll")}
          </button>
        </div>
        <div className="product-grid">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              language={language}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              product={product}
              t={t}
            />
          ))}
        </div>
      </section>

      <section className="collection-highlight storefront-section">
        <div className="collection-copy">
          <p className="eyebrow">{t("home.highlightEyebrow")}</p>
          <h2>{t("home.highlightTitle")}</h2>
          <p>{t("home.highlightText")}</p>
          <button
            className="primary-action large"
            onClick={() => onCategorySelect("car-care")}
            type="button"
          >
            {t("home.highlightCta")}
          </button>
        </div>
        <div className="mini-product-row">
          {featuredProducts.map((product) => (
            <button
              className="mini-product"
              key={product.id}
              onClick={() => onViewProduct(product.slug)}
              type="button"
            >
              <span>{product.badge[language]}</span>
              <strong>{product.name[language]}</strong>
            </button>
          ))}
        </div>
      </section>

      <HowItWorksSplit language={language} onNavigate={onNavigate} />

      <FloatingProductCollage
        language={language}
        products={products}
        onViewProduct={onViewProduct}
      />

      {siteReviews.length > 0 && (
        <section className="reviews-section storefront-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{t("reviews.storeReview")}</p>
              <h2>{t("reviews.title")}</h2>
              <p>{t("reviews.subtitle")}</p>
            </div>
          </div>
          <div className="reviews-track">
            {siteReviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-stars" aria-label={`${review.rating} stars`}>
                  {"★".repeat(Number(review.rating || 0))}
                </div>
                <p>{getLocalized(review.comment, language)}</p>
                <div>
                  <strong>{review.customerName}</strong>
                  {review.relatedProductName && <span>{review.relatedProductName}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="why-section storefront-section">
        <div>
          <p className="eyebrow">{t("home.whyEyebrow")}</p>
          <h2>{t("home.whyTitle")}</h2>
        </div>
        <div className="why-grid">
          {t("home.whyItems").map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="newsletter-band storefront-section">
        <div>
          <p className="eyebrow">{t("nav.social")}</p>
          <h2>{t("home.socialTitle")}</h2>
          <p>{t("home.socialText")}</p>
        </div>
        <button className="primary-action large" onClick={() => onNavigate("social")} type="button">
          {t("home.socialCta")}
        </button>
      </section>
    </div>
  );
}

export default HomePage;
