export const WHATSAPP_NUMBER = "972599130765";

function formatValue(value, fallback = "Not provided") {
  const normalized = value == null ? "" : String(value).trim();
  return normalized || fallback;
}

function formatCustomerAddress(customer = {}) {
  return [customer.address, customer.city].filter(Boolean).join(", ");
}

function formatOrderItem(item, index) {
  const productName = item.productName || item.name || item.label || item.slug || item.productId || "Product";
  const variant = item.selectedSize || item.size || item.variant || "";
  const quantity = Number(item.quantity || 1);
  const price = Number(item.price || 0);
  const title = variant ? `${productName} - ${variant}` : productName;

  return [`${index + 1}. ${title}`, `   Qty: ${quantity}`, `   Price: ${price} ILS`].join("\n");
}

function formatOrderItemAr(item, index) {
  const productName = item.productName || item.name || item.label || item.slug || item.productId || "منتج";
  const variant = item.selectedSize || item.size || item.variant || "";
  const quantity = Number(item.quantity || 1);
  const price = Number(item.price || 0);
  const title = variant ? `${productName} - ${variant}` : productName;

  return [`${index + 1}. ${title}`, `   الكمية: ${quantity}`, `   السعر: ${price} شيكل`].join("\n");
}

export function buildWhatsAppOrderMessage({
  customer = {},
  items = [],
  total = 0,
  subtotal,
  delivery_price,
  delivery_city_name,
  language = "en",
} = {}) {
  const isAr = language === "ar";
  const productLines = items.length
    ? items.map((item, index) => (isAr ? formatOrderItemAr(item, index) : formatOrderItem(item, index))).join("\n\n")
    : (isAr ? "لا توجد منتجات" : "No products listed");
  const deliveryCity = delivery_city_name || customer.delivery_city_name || "";
  const deliveryPrice = delivery_price ?? customer.delivery_price ?? 0;
  const sub = subtotal ?? (total - Number(deliveryPrice));

  if (isAr) {
    const parts = [
      "طلب جديد من EB Chemical",
      "",
      "بيانات العميل:",
      `الاسم: ${formatValue(customer.name)}`,
      `رقم الجوال: ${formatValue(customer.phone)}`,
      `العنوان: ${formatValue(formatCustomerAddress(customer))}`,
      "",
      "تفاصيل الطلب:",
      "",
      productLines,
      "",
    ];
    if (deliveryCity) {
      parts.push(`المدينة: ${deliveryCity}`);
    }
    parts.push(`المجموع الفرعي: ${Number(sub).toFixed(2)} شيكل`);
    if (Number(deliveryPrice) > 0) {
      parts.push(`التوصيل: ${Number(deliveryPrice).toFixed(2)} شيكل`);
    } else {
      parts.push(`التوصيل: مجاني`);
    }
    parts.push(`الإجمالي: ${Number(total).toFixed(2)} شيكل`);
    parts.push("");
    parts.push(`الملاحظات: ${formatValue(customer.notes, "لا يوجد")}`);
    return parts.join("\n");
  }

  const parts = [
    "New EB Chemical Order",
    "",
    "Customer:",
    `Name: ${formatValue(customer.name)}`,
    `Phone: ${formatValue(customer.phone)}`,
    `Address: ${formatValue(formatCustomerAddress(customer))}`,
    "",
    "Order:",
    "",
    productLines,
    "",
  ];
  if (deliveryCity) {
    parts.push(`City: ${deliveryCity}`);
  }
  parts.push(`Subtotal: ${Number(sub).toFixed(2)} ILS`);
  if (Number(deliveryPrice) > 0) {
    parts.push(`Delivery: ${Number(deliveryPrice).toFixed(2)} ILS`);
  } else {
    parts.push(`Delivery: Free`);
  }
  parts.push(`Total: ${Number(total).toFixed(2)} ILS`);
  parts.push("");
  parts.push(`Notes: ${formatValue(customer.notes, "None")}`);
  return parts.join("\n");
}

export function buildWhatsAppOrderUrl(order) {
  const message = encodeURIComponent(buildWhatsAppOrderMessage(order));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
