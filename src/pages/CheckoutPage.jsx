import React from "react";
import { trackContact } from "../utils/metaPixel.js";
import { buildWhatsAppOrderUrl } from "../utils/whatsapp.js";
import { fetchDeliveryZones } from "../utils/deliveryZonesApi.js";

const initialCheckoutForm = {
  name: "",
  phone: "",
  city: "",
  address: "",
  notes: "",
};

function getMessageItems(items, products, language) {
  return items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    const productName = product?.name?.[language] || item.productName || item.slug || item.productId;

    return {
      ...item,
      productName,
      selectedSize: item.selectedSize || item.size,
      lineTotal: item.lineTotal ?? Number(item.price || 0) * Number(item.quantity || 1),
    };
  });
}

function CheckoutPage({
  cartItems,
  checkoutMessage,
  currentUser,
  lastOrder,
  language,
  onCreateOrder,
  onNavigate,
  products,
  t,
  total,
}) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const [form, setForm] = React.useState(() => ({
    ...initialCheckoutForm,
    name: currentUser?.role === "customer" ? currentUser.name : "",
    phone: currentUser?.role === "customer" ? currentUser.phone : "",
    city: currentUser?.role === "customer" ? currentUser.city || "" : "",
    address: currentUser?.role === "customer" ? currentUser.address || "" : "",
  }));
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [orderError, setOrderError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deliveryZones, setDeliveryZones] = React.useState([]);
  const [selectedZone, setSelectedZone] = React.useState(null);
  const [pointsToRedeem, setPointsToRedeem] = React.useState(0);

  React.useEffect(() => {
    fetchDeliveryZones()
      .then(setDeliveryZones)
      .catch(() => setDeliveryZones([]));
  }, []);

  function effectiveItemPrice(item) {
    const isTrader = currentUser?.accountType === "trader" || currentUser?.accountType === "wholesale";
    if (!isTrader) return Number(item.price || 0);
    const product = products.find((p) => p.id === item.productId || p.slug === item.slug);
    if (!product) return Number(item.price || 0);
    if (Array.isArray(product.variants)) {
      const variant = product.variants.find((v) =>
        v.id === item.variantId || v.size === (item.selectedSize || item.size),
      );
      if (variant?.wholesalePrice != null && Number(variant.wholesalePrice) > 0) return Number(variant.wholesalePrice);
    }
    if (product.wholesalePrice != null && Number(product.wholesalePrice) > 0) return Number(product.wholesalePrice);
    return Number(item.price || 0);
  }

  const rawDelivery = selectedZone ? Number(selectedZone.delivery_price) : 0;
  const freeDeliveryThreshold = 500;
  const productSubtotal = Number(total || 0);
  const isFreeDelivery = productSubtotal >= freeDeliveryThreshold;
  const deliveryPrice = isFreeDelivery ? 0 : rawDelivery;
  const availablePoints = currentUser?.role === "customer" ? Math.max(0, Math.floor(Number(currentUser.ebPoints || 0))) : 0;
  const maxRedeemablePoints = Math.min(
    Math.floor(availablePoints / 100) * 100,
    Math.floor(Math.max(0, Number(total || 0)) / 5) * 100,
  );
  const redemptionOptions = Array.from(
    { length: Math.floor(maxRedeemablePoints / 100) + 1 },
    (_, index) => index * 100,
  );
  const pointsDiscount = pointsToRedeem / 20;
  const orderTotal = Math.max(0, productSubtotal - pointsDiscount) + deliveryPrice;

  React.useEffect(() => {
    if (pointsToRedeem > maxRedeemablePoints) setPointsToRedeem(maxRedeemablePoints);
  }, [maxRedeemablePoints, pointsToRedeem]);

  React.useEffect(() => {
    if (currentUser?.role === "customer") {
      setForm((currentForm) => ({
        ...currentForm,
        name: currentForm.name || currentUser.name,
        phone: currentForm.phone || currentUser.phone,
        city: currentForm.city || currentUser.city || "",
        address: currentForm.address || currentUser.address || "",
      }));
    }
  }, [currentUser]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleCityChange(event) {
    const zoneId = event.target.value;
    const zone = zoneId ? deliveryZones.find((z) => z.id === zoneId) : null;
    setSelectedZone(zone);
    setForm((currentForm) => ({
      ...currentForm,
      city: zone ? zone.city_name : "",
      delivery_zone_id: zone ? zone.id : "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || orderPlaced) return;
    setOrderError("");
    setIsSubmitting(true);

    try {
      const submittedForm = { ...form };
      const submittedItems = getMessageItems(cartItems, products, language);
      const submittedTotal = total;
      const order = await onCreateOrder({
        ...submittedForm,
        delivery_zone_id: selectedZone ? selectedZone.id : "",
        pointsRedeemed: pointsToRedeem,
      });

      setOrderPlaced(true);
      setOrderError("");

      try {
        const whatsappUrl = buildWhatsAppOrderUrl({
          customer: { ...submittedForm, ...(order?.customer || {}) },
          items: order?.items?.length ? order.items : submittedItems,
          total: order?.total ?? submittedTotal,
          language: language,
        });
        if (typeof window !== "undefined") {
          trackContact({ method: "whatsapp", url: whatsappUrl });
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }
      } catch (postError) {
        console.warn("Post-order action skipped:", postError);
      }
    } catch (error) {
      if (!orderPlaced) {
        setOrderError(error?.message || localized(
          "Unable to create order. Please try again.",
          "تعذر إنشاء الطلب. يرجى المحاولة مرة أخرى.",
          "לא ניתן ליצור הזמנה. נסה שוב.",
        ));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPlaced = orderPlaced && lastOrder;
  const messageItems = isPlaced ? lastOrder.items : cartItems;
  const messageTotal = isPlaced ? lastOrder.total : orderTotal;
  const whatsappUrl = buildWhatsAppOrderUrl({
    ...(isPlaced ? lastOrder : {
      customer: form,
      items: getMessageItems(messageItems, products, language),
      total: orderTotal,
      subtotal: total,
      delivery_price: deliveryPrice,
      delivery_city_name: selectedZone ? selectedZone.city_name : "",
    }),
    language,
  });

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <section className="page-shell">
        <div className="empty-panel">
          <h1>{t("checkout.noProductsTitle")}</h1>
          <p>{t("checkout.noProductsText")}</p>
          <button className="primary-action" onClick={() => onNavigate("products")}>
            {t("cart.browseProducts")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell checkout-page">
      <div className="page-heading">
        <p className="eyebrow">{t("checkout.eyebrow")}</p>
        <h1>{t("checkout.title")}</h1>
        <p>{t("checkout.subtitle")}</p>
      </div>

      {(orderPlaced || checkoutMessage) && (
        <div className="success-panel">
          {checkoutMessage || t("checkout.success")}
          {lastOrder && <div>
            <span>{localized("Points earned", "النقاط المكتسبة", "נקודות שנצברו")}: {Number(lastOrder.pointsEarned || 0)}</span>
            {lastOrder.pointsRedeemed > 0 && <span> · {localized("Points redeemed", "النقاط المستخدمة", "נקודות שנפדו")}: {Number(lastOrder.pointsRedeemed)}</span>}
            {lastOrder.discountFromPoints > 0 && <span> · {localized("Discount", "الخصم", "הנחה")}: {Number(lastOrder.discountFromPoints).toFixed(2)} {t("common.ils")}</span>}
          </div>}
        </div>
      )}
      {orderError && <div className="message-panel error">{orderError}</div>}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            {t("checkout.name")}
            <input
              name="name"
              onChange={handleInputChange}
              placeholder={t("checkout.namePlaceholder")}
              required
              type="text"
              value={form.name}
            />
          </label>
          <label>
            {t("checkout.phone")}
            <input
              name="phone"
              onChange={handleInputChange}
              placeholder={t("checkout.phonePlaceholder")}
              required
              type="tel"
              value={form.phone}
            />
          </label>
          <label>
            {t("checkout.city")}
            {deliveryZones.length > 0 ? (
              <select
                name="delivery_zone_id"
                onChange={handleCityChange}
                required
                value={selectedZone ? selectedZone.id : ""}
              >
                <option disabled value="">{t("checkout.cityPlaceholder")}</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.city_name}{zone.region ? ` (${zone.region})` : ""} &mdash; {Number(zone.delivery_price).toFixed(2)} &#x20AA;
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="city"
                onChange={handleInputChange}
                placeholder={t("checkout.cityPlaceholder")}
                required
                type="text"
                value={form.city}
              />
            )}
          </label>
          <label>
            {t("checkout.address")}
            <input
              name="address"
              onChange={handleInputChange}
              placeholder={t("checkout.addressPlaceholder")}
              required
              type="text"
              value={form.address}
            />
          </label>
          <label className="full-field">
            {t("checkout.notes")}
            <textarea
              name="notes"
              onChange={handleInputChange}
              placeholder={t("checkout.notesPlaceholder")}
              rows="5"
              value={form.notes}
            />
          </label>
          {currentUser?.role === "customer" && (
            <label className="full-field">
              {localized("Redeem EB Points", "استخدام نقاط EB", "מימוש נקודות EB")}
              <select value={pointsToRedeem} onChange={(event) => setPointsToRedeem(Number(event.target.value))}>
                {redemptionOptions.map((points) => (
                  <option key={points} value={points}>
                    {points === 0
                      ? localized(`Available: ${availablePoints} points — no discount`, `المتاح: ${availablePoints} نقطة — بدون خصم`, `זמין: ${availablePoints} נקודות — ללא הנחה`)
                      : `${points} ${localized("points", "نقطة", "נקודות")} = ${(points / 20).toFixed(2)} ${t("common.ils")}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="primary-action large" disabled={isSubmitting || orderPlaced} type="submit">
            {isSubmitting ? t("common.temporaryContent") : t("checkout.placeOrder")}
          </button>
        </form>

        <aside className="summary-card">
          <h2>{t("cart.orderSummary")}</h2>
          {messageItems.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            const productName = product?.name?.[language] || item.productName || item.slug;
            const displayPrice = effectiveItemPrice(item);
            const displayLineTotal = item.lineTotal ?? displayPrice * item.quantity;

            return (
              <div className="summary-line" key={item.cartId || `${item.productId}-${item.selectedSize || item.size}`}>
                <span>
                  {productName} - {item.selectedSize || item.size} x{item.quantity}
                </span>
                <strong>
                  {displayLineTotal} {t("common.ils")}
                </strong>
              </div>
            );
          })}
          {(deliveryPrice > 0 || isFreeDelivery) && (
            <div className="summary-row">
              <span>{localized("Delivery", "التوصيل", "משלוח")}{selectedZone ? ` (${selectedZone.city_name})` : ""}</span>
              <strong>{isFreeDelivery ? localized("Free", "مجاني", "חינם") : `${deliveryPrice.toFixed(2)} ${t("common.ils")}`}</strong>
            </div>
          )}
          {pointsDiscount > 0 && (
            <div className="summary-row">
              <span>{localized("EB Points discount", "خصم نقاط EB", "הנחת נקודות EB")}</span>
              <strong>-{pointsDiscount.toFixed(2)} {t("common.ils")}</strong>
            </div>
          )}
          <div className="summary-row total-row">
            <span>{t("common.total")}</span>
            <strong>
              {deliveryPrice > 0 ? orderTotal.toFixed(2) : messageTotal} {t("common.ils")}
            </strong>
          </div>
          <a
            className="whatsapp-action"
            href={whatsappUrl}
            onClick={() => trackContact({ method: "whatsapp", url: whatsappUrl })}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("checkout.sendWhatsApp")}
          </a>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
