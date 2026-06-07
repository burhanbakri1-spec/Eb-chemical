import React from "react";
import { categories } from "../data/categories.js";
import { placeholderImage } from "../data/products.js";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";

function getLocalized(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

function getCategoryName(categoryId, language) {
  const category = categories.find((item) => item.id === categoryId);
  return getLocalized(category?.name, language);
}

function matchesMainFilter(product, activeCategory) {
  if (activeCategory === "All") return true;
  if (activeCategory === "accessories") {
    return !["home-cleaning", "bathroom-cleaning", "car-care"].includes(product.categoryId);
  }
  return product.categoryId === activeCategory;
}

function matchesSecondaryFilter(product, secondaryFilter, index) {
  if (!secondaryFilter) return true;

  const name = `${getLocalized(product.name, "en")} ${getLocalized(product.name, "ar")} ${product.slug || ""}`.toLowerCase();
  const sizeText = product.sizes?.map((size) => size.size).join(" ").toLowerCase() || "";

  if (secondaryFilter === "starter") {
    return index < 8 || product.featured || product.bestSeller || name.includes("kit");
  }

  if (secondaryFilter === "refills") {
    return sizeText.includes("5l") || sizeText.includes("18l") || name.includes("refill");
  }

  if (secondaryFilter === "set") {
    return product.offer || product.discount || product.bestSeller || name.includes("set");
  }

  return true;
}

function ShopProductCard({ language, onAddToCart, onViewProduct, product, t }) {
  const isArabic = language === "ar";
  const firstSize = product.sizes?.[0] || { size: "", price: 0 };
  const mainImage = product.image || product.fallbackImage || placeholderImage;
  const hoverImage =
    product.hoverImage ||
    product.secondaryImage ||
    product.gallery?.[1] ||
    product.images?.[1] ||
    mainImage;
  const hasHoverImage = hoverImage && hoverImage !== mainImage;
  const name = getLocalized(product.name, language);
  const description =
    getLocalized(product.shortDescription, language) ||
    (isArabic
      ? "حل عملي للعناية اليومية والتنظيف."
      : "A practical solution for daily cleaning and care.");
  const badge = getLocalized(product.badge, language);
  const rating = Number(product.rating || product.reviewRating || 5);
  const oldPrice = product.oldPrice || product.compareAtPrice || product.wasPrice;

  return (
    <article className="shop-product-card">
      <button
        className="shop-product-image-wrap"
        onClick={() => onViewProduct(product.slug)}
        type="button"
      >
        {badge && <span className="shop-product-badge">{badge}</span>}
        <img
          alt={name}
          className="shop-product-image-main"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = product.fallbackImage || placeholderImage;
          }}
          src={mainImage}
        />
        {hasHoverImage && (
          <img
            aria-hidden="true"
            alt=""
            className="shop-product-image-hover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            src={hoverImage}
          />
        )}
      </button>

      <div className="shop-product-info">
        <small>{getCategoryName(product.categoryId, language)}</small>
        <h2>{name}</h2>
        <p>{description}</p>
        <div className="shop-product-rating" aria-label={`${rating} stars`}>
          {"\u2605".repeat(Math.max(0, Math.min(5, Math.round(rating))))}
        </div>
        <div className="shop-product-price-row">
          <strong>
            {firstSize.price} {t("common.ils")}
          </strong>
          {oldPrice && (
            <del>
              {oldPrice} {t("common.ils")}
            </del>
          )}
        </div>
        <div className="shop-product-actions">
          <button className="secondary-action" onClick={() => onViewProduct(product.slug)} type="button">
            {isArabic ? "تفاصيل أكثر" : "Learn more"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductsPage({
  activeCategory,
  language,
  onAddToCart,
  onCategoryChange,
  onViewProduct,
  products,
  t,
  websiteMedia = [],
}) {
  const isArabic = language === "ar";
  const [secondaryFilter, setSecondaryFilter] = React.useState("");
  const heroFallbackImage =
    products.find((product) => product.categoryId === "home-cleaning")?.image ||
    products[0]?.image ||
    placeholderImage;
  const heroImage = getWebsiteMediaImage(websiteMedia, "products_hero_image", heroFallbackImage);
  const visibleProducts = products.filter((product, index) =>
    matchesMainFilter(product, activeCategory) &&
    matchesSecondaryFilter(product, secondaryFilter, index)
  );
  const mainFilters = [
    { id: "All", label: isArabic ? "كل المنتجات" : "All products" },
    { id: "home-cleaning", label: isArabic ? "منظفات المنزل" : "Home Cleaners" },
    { id: "bathroom-cleaning", label: isArabic ? "منظفات الحمام" : "Bathroom Cleaning" },
    { id: "car-care", label: isArabic ? "العناية بالسيارة" : "Car Care" },
    { id: "accessories", label: isArabic ? "الإكسسوارات" : "Accessories" },
  ];
  const secondaryFilters = [
    { id: "starter", label: isArabic ? "مجموعة بداية" : "Starter kit" },
    { id: "refills", label: isArabic ? "عبوات إعادة تعبئة" : "Refills" },
    { id: "set", label: isArabic ? "مجموعة" : "Set" },
  ];

  return (
    <section className="page-shell products-page shop-page">
      <div className="shop-hero-banner">
        <img
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = placeholderImage;
          }}
          src={heroImage}
        />
        <div>
          <p className="eyebrow">{t("products.eyebrow")}</p>
          <h1>{isArabic ? "نظام أفضل للعناية اليومية" : "A better system for everyday care"}</h1>
        </div>
      </div>

      <div className="shop-filter-panel" aria-label={t("products.eyebrow")}>
        <div className="shop-filter-row main">
          {mainFilters.map((filter) => (
            <button
              className={activeCategory === filter.id ? "shop-filter-chip active" : "shop-filter-chip"}
              key={filter.id}
              onClick={() => onCategoryChange(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="shop-filter-row secondary">
          {secondaryFilters.map((filter) => (
            <button
              className={secondaryFilter === filter.id ? "shop-filter-chip active" : "shop-filter-chip"}
              key={filter.id}
              onClick={() => setSecondaryFilter((current) => (current === filter.id ? "" : filter.id))}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-product-grid">
        {visibleProducts.map((product) => (
          <ShopProductCard
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
  );
}

export default ProductsPage;

