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

function localized(en, ar, he) {
  if (language === "ar") return ar;
  if (language === "he") return he;
  return en;
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

  React.useEffect(() => {
    fetchDeliveryZones()
      .then(setDeliveryZones)
      .catch(() => setDeliveryZones([]));
  }, []);

  const deliveryPrice = selectedZone ? Number(selectedZone.delivery_price) : 0;
  const orderTotal = Number(total || 0) + deliveryPrice;

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
    setOrderError("");
    setIsSubmitting(true);

    try {
      const submittedForm = { ...form };
      const submittedItems = getMessageItems(cartItems, products, language);
      const submittedTotal = total;
      const order = await onCreateOrder({ ...submittedForm, delivery_zone_id: selectedZone ? selectedZone.id : "" });
      const whatsappUrl = buildWhatsAppOrderUrl({
        customer: { ...submittedForm, ...(order?.customer || {}) },
        items: order?.items?.length ? order.items : submittedItems,
        total: order?.total ?? submittedTotal,
      });

      setOrderPlaced(true);
      if (typeof window !== "undefined") {
        trackContact({ method: "whatsapp", url: whatsappUrl });
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setOrderError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPlaced = orderPlaced && lastOrder;
  const messageItems = isPlaced ? lastOrder.items : cartItems;
  const messageTotal = isPlaced ? lastOrder.total : orderTotal;
  const whatsappUrl = buildWhatsAppOrderUrl(isPlaced ? lastOrder : {
    customer: form,
    items: getMessageItems(messageItems, products, language),
    total: orderTotal,
    subtotal: total,
    delivery_price: deliveryPrice,
    delivery_city_name: selectedZone ? selectedZone.city_name : "",
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
                <option value="">{t("checkout.cityPlaceholder")}</option>
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
          <button className="primary-action large" disabled={isSubmitting || orderPlaced} type="submit">
            {isSubmitting ? t("common.temporaryContent") : t("checkout.placeOrder")}
          </button>
        </form>

        <aside className="summary-card">
          <h2>{t("cart.orderSummary")}</h2>
          {messageItems.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            const productName = product?.name?.[language] || item.productName || item.slug;

            return (
              <div className="summary-line" key={item.cartId || `${item.productId}-${item.selectedSize || item.size}`}>
                <span>
                  {productName} - {item.selectedSize || item.size} x{item.quantity}
                </span>
                <strong>
                  {(item.lineTotal ?? item.price * item.quantity)} {t("common.ils")}
                </strong>
              </div>
            );
          })}
          {deliveryPrice > 0 && (
            <div className="summary-row">
              <span>{localized("Delivery", "التوصيل", "משלוח")}{selectedZone ? ` (${selectedZone.city_name})` : ""}</span>
              <strong>{deliveryPrice.toFixed(2)} {t("common.ils")}</strong>
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
