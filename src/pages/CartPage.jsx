import React from "react";
import QuantityControl from "../components/QuantityControl.jsx";
import { placeholderImage } from "../data/products.js";

function CartPage({
  cartItems,
  currentUser,
  language,
  onAddToCart,
  onNavigate,
  onRemoveItem,
  onUpdateQuantity,
  onViewProduct,
  products,
  t,
  total,
}) {
  const isArabic = language === "ar";
  const currency = t("common.ils");
  const shippingGoal = 120;
  const shippingProgress = Math.min(100, Math.round((total / shippingGoal) * 100));
  const remainingForShipping = Math.max(0, shippingGoal - total);

  function getProduct(item) {
    return products.find((product) => product.id === item.productId);
  }

  const cartProductIds = new Set(cartItems.map((item) => item.productId));
  const recommendedProducts = products
    .filter((product) => !cartProductIds.has(product.id))
    .slice(0, 4);
  const urgentProducts = products
    .filter((product) => !cartProductIds.has(product.id))
    .slice(4, 6);

  function getLocalized(value, fallback = "") {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    return value[language] || value.en || value.ar || fallback;
  }

  function getProductPrice(product) {
    return product?.sizes?.[0]?.price || 0;
  }

  function addRecommended(product) {
    if (!product?.sizes?.length) return;
    onAddToCart?.(product, product.sizes[0].size);
  }

  function handleCheckout() {
    if (!currentUser) {
      onNavigate("login");
      return;
    }

    onNavigate("checkout");
  }

  if (cartItems.length === 0) {
    return (
      <section className="cart-empty-hero">
        <div className="cart-empty-overlay">
          <h1>{isArabic ? "سلتك فارغة حاليًا" : "There is nothing in your cart"}</h1>
          <div className="cart-empty-actions">
            <button className="light-action" onClick={() => onNavigate("products")} type="button">
              {isArabic ? "متابعة التسوق" : "Continue Shopping"}
            </button>
            {!currentUser && (
              <button className="outline-light-action" onClick={() => onNavigate("login")} type="button">
                {isArabic ? "تسجيل الدخول إلى حسابك" : "Login to your account"}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-kinfill-page">
      <div className="cart-kinfill-grid">
        <div className="cart-main-column">
          <header className="cart-title-row">
            <h1>{isArabic ? "سلة التسوق" : "Your Cart"}</h1>
            <button className="cart-empty-button" onClick={() => cartItems.forEach((item) => onRemoveItem(item.cartId))} type="button">
              {isArabic ? "إفراغ السلة" : "Empty cart"}
            </button>
          </header>

          {urgentProducts.length > 0 && (
            <section className="cart-upsell-strip" aria-label={isArabic ? "اقتراحات سريعة" : "Quick suggestions"}>
              <div className="cart-upsell-heading">
                <strong>{isArabic ? "لا تفوّت هذه المنتجات" : "Grab it before it's gone"}</strong>
                <span>{isArabic ? "منتجات مختارة عليها طلب مرتفع" : "Our seasonal scent is almost sold out!"}</span>
              </div>
              <div className="cart-upsell-inline">
                {urgentProducts.map((product) => (
                  <article className="cart-mini-offer" key={product.id}>
                    <button className="mini-offer-image" onClick={() => onViewProduct?.(product.slug)} type="button">
                      <img
                        alt={getLocalized(product.name)}
                        onError={(event) => {
                          event.currentTarget.src = product.fallbackImage || placeholderImage;
                        }}
                        src={product.image || placeholderImage}
                      />
                    </button>
                    <div>
                      <h3>{getLocalized(product.name)}</h3>
                      <p>
                        {getProductPrice(product)} {currency}
                      </p>
                      <button className="mini-add-button" onClick={() => addRecommended(product)} type="button">
                        {isArabic ? "أضف للسلة" : "Add to cart"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="cart-items-panel">
            {cartItems.map((item) => {
              const product = getProduct(item);
              const productName = getLocalized(product?.name, item.productName || item.slug);
              const productBadge = getLocalized(product?.badge, isArabic ? "منتج مميز" : "Featured");
              const lineTotal = item.price * item.quantity;

              return (
                <article className="cart-line-item" key={item.cartId}>
                  <button className="cart-line-image" onClick={() => onViewProduct?.(item.slug)} type="button">
                    <img
                      alt={productName}
                      onError={(event) => {
                        event.currentTarget.src = item.fallbackImage || placeholderImage;
                      }}
                      src={item.image || placeholderImage}
                    />
                  </button>

                  <div className="cart-line-info">
                    <span className="cart-line-badge">{productBadge}</span>
                    <h2>{productName}</h2>
                    <p>
                      {isArabic ? "الحجم" : "Size"}: {item.size}
                    </p>
                    <div className="cart-line-actions">
                      <QuantityControl
                        onDecrease={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                        onIncrease={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                        quantity={item.quantity}
                      />
                      <button
                        className="cart-remove-button"
                        onClick={() => onRemoveItem(item.cartId)}
                        type="button"
                      >
                        {isArabic ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  </div>

                  <strong className="cart-line-price">
                    {lineTotal} {currency}
                  </strong>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="cart-side-column">
          <section className="cart-summary-panel">
            <div className="shipping-progress-card">
              <div className="shipping-progress-copy">
                <strong>
                  {remainingForShipping === 0
                    ? isArabic
                      ? "تهانينا! حصلت على شحن مجاني"
                      : "Congratulations! You've unlocked free shipping!"
                    : isArabic
                      ? `أضف ${remainingForShipping} ${currency} للحصول على شحن مجاني`
                      : `Add ${remainingForShipping} ${currency} to unlock free shipping`}
                </strong>
                <button type="button">{isArabic ? "معلومات الشحن" : "Shipping information"}</button>
              </div>
              <div className="shipping-progress-track">
                <span style={{ width: `${shippingProgress}%` }} />
              </div>
            </div>

            {!currentUser && <div className="message-panel soft">{t("auth.loginRequiredToBuy")}</div>}

            <div className="cart-summary-total">
              <span>{isArabic ? "الإجمالي المستحق اليوم" : "Total (due today)"}</span>
              <strong>
                {total} {currency}
              </strong>
            </div>
            <button className="checkout-wide-button" onClick={handleCheckout} type="button">
              {currentUser ? (isArabic ? "إتمام الطلب" : "Proceed to Checkout") : t("auth.login")}
            </button>
          </section>

          {recommendedProducts.length > 0 && (
            <section className="cart-recommendations">
              <h2>{isArabic ? "قد يعجبك أيضًا" : "You might also like"}</h2>
              <div className="cart-recommendation-grid">
                {recommendedProducts.map((product) => (
                  <article className="cart-recommendation-card" key={product.id}>
                    <button className="recommendation-image" onClick={() => onViewProduct?.(product.slug)} type="button">
                      <span>{getLocalized(product.badge, isArabic ? "منتج مميز" : "Featured")}</span>
                      <img
                        alt={getLocalized(product.name)}
                        onError={(event) => {
                          event.currentTarget.src = product.fallbackImage || placeholderImage;
                        }}
                        src={product.image || placeholderImage}
                      />
                    </button>
                    <div className="recommendation-copy">
                      <h3>{getLocalized(product.name)}</h3>
                      <p>
                        {getProductPrice(product)} {currency}
                      </p>
                      <button onClick={() => addRecommended(product)} type="button">
                        {isArabic ? "أضف للسلة" : "Add to cart"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
