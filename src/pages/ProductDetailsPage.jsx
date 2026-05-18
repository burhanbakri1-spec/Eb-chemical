import React from "react";
import { categories } from "../data/categories.js";
import { placeholderImage } from "../data/products.js";
import ProductCard from "../components/ProductCard.jsx";

function ProductDetailsPage({
  language,
  onAddToCart,
  onNavigate,
  onViewProduct,
  product,
  products = [],
  t,
}) {
  const [selectedSize, setSelectedSize] = React.useState(product?.sizes[0]?.size || "");
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    setSelectedSize(product?.sizes[0]?.size || "");
    setQuantity(1);
  }, [product]);

  if (!product) {
    return (
      <section className="page-shell">
        <div className="empty-panel">
          <h1>{t("productDetails.notFoundTitle")}</h1>
          <p>{t("productDetails.notFoundText")}</p>
          <button className="primary-action" onClick={() => onNavigate("products")}>
            {t("common.backToProducts")}
          </button>
        </div>
      </section>
    );
  }

  const selectedOption =
    product.sizes.find((option) => option.size === selectedSize) || product.sizes[0];
  const category = categories.find((item) => item.id === product.categoryId);
  const relatedProducts = products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 3);
  const productDescription =
    product.longDescription?.[language] ||
    product.shortDescription?.[language] ||
    (language === "ar"
      ? "منتج من EP Chemical مصمم للاستخدام اليومي، يجمع بين الأداء العملي وسهولة الاستخدام للحصول على نتيجة نظيفة ومنعشة."
      : "An EP Chemical product designed for daily use, practical performance, and a clean, fresh result.");

  function handleAddSelectedToCart() {
    for (let count = 0; count < quantity; count += 1) {
      onAddToCart(product, selectedOption.size);
    }
  }

  return (
    <>
      <section className="product-detail-page">
        <div className="product-detail-media">
          {product.badge && <span className="product-badge detail-floating-badge">{product.badge[language]}</span>}
          <img
            alt={product.name[language]}
            onError={(event) => {
              event.currentTarget.src = product.fallbackImage || placeholderImage;
            }}
            src={product.image || placeholderImage}
          />
        </div>

        <div className="product-detail-copy">
          <button className="text-action" onClick={() => onNavigate("products")} type="button">
            {t("common.backToProducts")}
          </button>
          <p className="eyebrow">{category?.name[language]}</p>
          <h1>{product.name[language]}</h1>
          <p>{productDescription}</p>

          <div className="detail-price">
            {selectedOption.price} {t("common.ils")}
          </div>

          <div className="size-picker">
            <h2>{t("productDetails.chooseSize")}</h2>
            <div className="size-options">
              {product.sizes.map((option) => (
                <button
                  className={selectedSize === option.size ? "size-option active" : "size-option"}
                  key={option.size}
                  onClick={() => setSelectedSize(option.size)}
                  type="button"
                >
                  <span>{option.size}</span>
                  <strong>
                    {option.price} {t("common.ils")}
                  </strong>
                </button>
              ))}
            </div>
          </div>

          <div className="detail-buy-row">
            <div className="quantity-control detail-quantity">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((value) => value + 1)} type="button">+</button>
            </div>
            <button className="primary-action large" onClick={handleAddSelectedToCart} type="button">
              {t("productDetails.addToCart")}
            </button>
          </div>

          {product.usageNotes && (
            <div className="usage-note">
              <strong>{t("productDetails.usageNote")}</strong>
              <p>{product.usageNotes[language]}</p>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products storefront-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{category?.name[language]}</p>
              <h2>{t("productDetails.relatedProducts")}</h2>
            </div>
            <button className="text-action" onClick={() => onNavigate("products")} type="button">
              {t("common.backToProducts")}
            </button>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                language={language}
                onAddToCart={onAddToCart}
                onViewProduct={onViewProduct}
                product={relatedProduct}
                t={t}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default ProductDetailsPage;
