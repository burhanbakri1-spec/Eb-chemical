import React from "react";
import ProductCard from "../components/ProductCard.jsx";
import { categories } from "../data/categories.js";

function ProductsPage({
  activeCategory,
  language,
  onAddToCart,
  onCategoryChange,
  onViewProduct,
  products,
  t,
}) {
  const visibleProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.categoryId === activeCategory);

  return (
    <section className="page-shell products-page">
      <div className="products-hero">
        <div>
          <p className="eyebrow">{t("products.eyebrow")}</p>
          <h1>{t("products.title")}</h1>
          <p>{t("products.subtitle")}</p>
        </div>
        <div className="products-hero-visual">
          <div className="scene-bottle scene-bottle-large"><span>EP</span></div>
          <div className="scene-bottle scene-bottle-spray"><span>EP</span></div>
        </div>
      </div>

      <div className="filter-bar" aria-label={t("products.eyebrow")}>
        <button
          className={activeCategory === "All" ? "filter-chip active" : "filter-chip"}
          onClick={() => onCategoryChange("All")}
          type="button"
        >
          {t("common.all")}
        </button>
        {categories.map((category) => (
          <button
            className={
              activeCategory === category.id ? "filter-chip active" : "filter-chip"
            }
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            type="button"
          >
            {category.name[language]}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {visibleProducts.map((product) => (
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
  );
}

export default ProductsPage;
