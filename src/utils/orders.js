import { apiRequest } from "./api.js";

function normalizeOrderResponse(response) {
  const order = response?.order || response?.data || response;
  if (order && typeof order === "object" && !Array.isArray(order)) {
    const id = order.id || order.orderId || order.order_id;
    if (id) return { ...order, id };
  }
  return null;
}

export async function getOrders(currentUser) {
  if (!currentUser) {
    return [];
  }

  return currentUser.role === "admin" ||
    currentUser.permissions?.includes("orders.view")
    ? apiRequest("/orders")
    : apiRequest("/orders/my-orders");
}

export async function createOrder({
  cartItems = [],
  customer,
  items,
  total,
  createdByEmployeeId,
  createdByEmployeeName,
  delivery_zone_id,
  delivery_price,
  delivery_city_name,
  pointsRedeemed = 0,
}) {
  const orderItems = (items || cartItems).map((item) => ({
    productId: item.productId,
    productName: item.productName || item.label || item.slug || "",
    slug: item.slug || item.productId,
    selectedSize: item.selectedSize || item.size,
    size: item.size || item.selectedSize,
    variantId: item.variantId || "",
    selectedColor: item.selectedColor || item.colorName || "",
    colorName: item.colorName || item.selectedColor || "",
    colorValue: item.colorValue || "",
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    lineTotal:
      item.lineTotal ?? Number(item.price || 0) * Number(item.quantity || 1),
  }));

  const response = await apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      customer,
      items: orderItems,
      subtotal: total,
      total,
      paymentMethod: "Cash on delivery",
      delivery_zone_id,
      delivery_price,
      delivery_city_name,
      pointsRedeemed,
      createdByEmployeeId,
      createdByEmployeeName,
    }),
  });
  const order = normalizeOrderResponse(response);
  if (!order) {
    throw new Error("Unable to confirm the saved order response.");
  }
  return order;
}

export async function updateOrderStatus(orderId, status) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function assignOrderEmployee(orderId, employeeId) {
  return apiRequest(`/orders/${orderId}/assign-employee`, {
    method: "PUT",
    body: JSON.stringify({ employeeId }),
  });
}

export async function deleteOrder(orderId) {
  return apiRequest(`/orders/${orderId}`, {
    method: "DELETE",
  });
}
