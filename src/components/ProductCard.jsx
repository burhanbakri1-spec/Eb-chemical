import React from "react";
import { categories } from "../data/categories.js";
import { resolveImageUrl, showNeutralImage } from "../utils/images.js";
import { getVisibleVariants } from "../utils/productVariants.js";

function ProductCard({ language, product, onAddToCart, onViewProduct, t }) {
  const visibleVariants = getVisibleVariants(product);
  const hasVariantModel = Array.isArray(product.variants) && product.variants.length > 0;
  const firstVariant = visibleVariants.find((variant) => Number(variant.stock ?? variant.stockQty ?? 1) > 0) || visibleVariants[0];
  const firstSize = firstVariant
    ? { size: firstVariant.size, price: Number(firstVariant.price || 0) }
    : hasVariantModel
      ? null
      : product.sizes?.[0] || null;
  const isAvailable = Boolean(firstSize) && (!firstVariant || Number(firstVariant.stock ?? firstVariant.stockQty ?? 1) > 0);
  const category = categories.find((item) => item.id === product.categoryId);
  const description =
    product.shortDescription?.[language] ||
    (language === "ar"
      ? "منتج عملي مصمم لتجربة تنظيف أسهل ونتيجة أفضل."
      : "A practical product designed for easier cleaning and a better result.");

  const mainImage = resolveImageUrl(product.image, product.fallbackImage);
  const hoverImage =
    product.hoverImage ||
    product.gallery?.[1] ||
    product.images?.[1] ||
    mainImage;
  const hasDistinctHover = hoverImage && hoverImage !== mainImage;

  return (
    <article className="product-card">
      <button
        className="product-image-button product-card-image"
        onClick={() => onViewProduct(product.slug)}
        type="button"
      >
        {product.badge && <span className="product-badge">{product.badge[language]}</span>}
        <img
          alt={product.name[language]}
          className="primary-image"
          loading="lazy"
          onError={(event) => {
            showNeutralImage(event);
          }}
          src={mainImage}
        />
        {hasDistinctHover && (
          <img
            aria-hidden="true"
            alt=""
            className="hover-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            src={hoverImage}
          />
        )}
      </button>

      <div className="product-card-body">
        <div className="product-meta-row">
          <span>{category?.name[language]}</span>
          <strong>{firstSize?.size || "Unavailable"}</strong>
        </div>
        <h3>{product.name[language]}</h3>
        <p>{description}</p>
        <div className="product-price-row">
          <span>{t("common.from")}</span>
          <strong>
            {firstSize?.price || 0} {t("common.ils")}
          </strong>
        </div>
      </div>

      <div className="product-card-footer">
        <button
          className="secondary-action"
          onClick={() => onViewProduct(product.slug)}
          type="button"
        >
          {t("common.details")}
        </button>
        <button
          className="primary-action"
          disabled={!isAvailable}
          onClick={() => onAddToCart(product, firstSize.size, firstVariant)}
          type="button"
        >
          {isAvailable ? t("common.add") : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
