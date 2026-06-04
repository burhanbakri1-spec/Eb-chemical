const SUPABASE_REST_TIMEOUT_MS = 15000;

function supabaseUrl() {
  return process.env.SUPABASE_URL?.replace(/\/+$/, "") || "";
}

function serviceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && serviceRoleKey());
}

export function isSupabaseStorageConfigured() {
  return Boolean(isSupabaseConfigured() && process.env.SUPABASE_BUCKET);
}

function encodeStoragePath(storagePath) {
  return storagePath.split("/").map(encodeURIComponent).join("/");
}

async function supabaseFetch(pathname, options = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_REST_TIMEOUT_MS);
  const headers = {
    apikey: serviceRoleKey(),
    Authorization: `Bearer ${serviceRoleKey()}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${supabaseUrl()}${pathname}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const detail = body?.message || body?.error || text || response.statusText;
      throw new Error(`Supabase request failed (${response.status}): ${detail}`);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function selectAll(table, query = "select=*") {
  return supabaseFetch(`/rest/v1/${table}?${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}

async function upsertRows(table, rows) {
  if (!rows.length) return;
  await supabaseFetch(`/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
}

async function deleteRow(table, id) {
  await supabaseFetch(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

async function deleteMissingRows(table, currentIds) {
  const existing = await selectAll(table, "select=id");
  const keep = new Set(currentIds);
  const staleIds = existing.map((row) => row.id).filter((id) => !keep.has(id));
  for (const id of staleIds) {
    await deleteRow(table, id);
  }
}

function rowDate(value) {
  return value || new Date().toISOString();
}

function productRow(product) {
  const firstVariant = Array.isArray(product.variants) ? product.variants[0] : null;
  return {
    id: product.id,
    slug: product.slug || product.id,
    name: typeof product.name === "object" ? product.name?.en || product.id : product.name || product.id,
    name_ar: typeof product.name === "object" ? product.name?.ar || "" : product.nameAr || product.name_ar || "",
    category: typeof product.category === "object" ? product.category?.en || "" : product.category || "",
    category_ar: typeof product.category === "object" ? product.category?.ar || "" : product.categoryAr || product.category_ar || "",
    brand: product.brand || "EB Chemical",
    image_url: product.image || "",
    hover_image_url: product.hoverImage || product.secondaryImage || "",
    price: Number(firstVariant?.price || product.price || product.sizes?.[0]?.price || 0),
    stock_qty: Number(firstVariant?.stock ?? product.stockQty ?? 0),
    is_active: product.isActive !== false,
    is_featured: Boolean(product.isFeatured || product.featured),
    data: product,
    created_at: rowDate(product.createdAt),
    updated_at: rowDate(product.updatedAt),
  };
}

function variantRows(product) {
  return (product.variants || []).map((variant, index) => ({
    id: variant.id || `${product.id}-variant-${index}`,
    product_id: product.id,
    color_name: variant.color_name || variant.colorName || "Default",
    color_value: variant.color_value || variant.colorValue || "",
    size: variant.size || "500ml",
    price: Number(variant.price || 0),
    stock: Number(variant.stock ?? 0),
    image_url: variant.image_url || variant.imageUrl || "",
    sort_order: Number(variant.sort_order ?? variant.sortOrder ?? index),
    data: variant,
    created_at: rowDate(variant.createdAt),
    updated_at: rowDate(variant.updatedAt),
  }));
}

function galleryRows(product) {
  const source = product.gallery_images || product.galleryImages || [];
  return source
    .map((entry, index) => {
      const imageUrl = typeof entry === "string" ? entry : entry?.image_url || entry?.image || entry?.url;
      if (!imageUrl) return null;
      return {
        id: typeof entry === "object" && entry?.id ? entry.id : `${product.id}-gallery-${index}`,
        product_id: product.id,
        image_url: imageUrl,
        sort_order: Number(typeof entry === "object" ? entry?.sort_order ?? entry?.sortOrder ?? index : index),
        data: typeof entry === "object" ? entry : { image_url: imageUrl },
        created_at: rowDate(typeof entry === "object" ? entry.createdAt : null),
        updated_at: rowDate(typeof entry === "object" ? entry.updatedAt : null),
      };
    })
    .filter(Boolean);
}

function userRow(user) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    password: user.password || "",
    role: user.role || "customer",
    department: user.department || "",
    permissions: user.permissions || [],
    eb_points: Number(user.ebPoints || 0),
    total_points_earned: Number(user.totalPointsEarned || 0),
    total_points_redeemed: Number(user.totalPointsRedeemed || 0),
    is_active: user.isActive !== false,
    data: user,
    created_at: rowDate(user.createdAt),
    updated_at: rowDate(user.updatedAt),
  };
}

function orderRow(order) {
  return {
    id: order.id,
    customer_user_id: order.customerUserId || null,
    customer: order.customer || {},
    subtotal: Number(order.subtotal || 0),
    total: Number(order.total || 0),
    points_earned: Number(order.pointsEarned || 0),
    points_redeemed: Number(order.pointsRedeemed || 0),
    discount_from_points: Number(order.discountFromPoints || 0),
    payment_method: order.paymentMethod || "",
    status: order.status || "Pending",
    handled_by_employee_id: order.handledByEmployeeId || "",
    assigned_to_employee_id: order.assignedToEmployeeId || "",
    created_by_employee_id: order.createdByEmployeeId || "",
    created_by_employee_name: order.createdByEmployeeName || "",
    data: order,
    created_at: rowDate(order.createdAt),
    updated_at: rowDate(order.updatedAt),
  };
}

function orderItemRows(order) {
  return (order.items || []).map((item, index) => ({
    id: item.id || `${order.id}-item-${index}`,
    order_id: order.id,
    product_id: item.productId || item.id || "",
    product_name: item.productName || item.name || "",
    variant_id: item.variantId || "",
    color_name: item.colorName || item.selectedColor || "",
    color_value: item.colorValue || "",
    size: item.selectedSize || item.size || "",
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    line_total: Number(item.lineTotal || Number(item.price || 0) * Number(item.quantity || 1)),
    data: item,
    created_at: rowDate(item.createdAt),
    updated_at: rowDate(item.updatedAt),
  }));
}

function mergeUser(row) {
  return {
    ...(row.data || {}),
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    role: row.role,
    department: row.department,
    permissions: row.permissions || [],
    ebPoints: Number(row.eb_points || 0),
    totalPointsEarned: Number(row.total_points_earned || 0),
    totalPointsRedeemed: Number(row.total_points_redeemed || 0),
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mergeProduct(row, variants, galleryImages) {
  const productVariants = variants
    .filter((variant) => variant.product_id === row.id)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((variant) => ({
      ...(variant.data || {}),
      id: variant.id,
      color_name: variant.color_name,
      color_value: variant.color_value,
      size: variant.size,
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
      image_url: variant.image_url || "",
      sort_order: Number(variant.sort_order || 0),
    }));
  const productGallery = galleryImages
    .filter((entry) => entry.product_id === row.id)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((entry) => ({
      ...(entry.data || {}),
      id: entry.id,
      image_url: entry.image_url,
      sort_order: Number(entry.sort_order || 0),
    }));

  return {
    ...(row.data || {}),
    id: row.id,
    slug: row.slug,
    image: row.image_url || row.data?.image || "",
    hoverImage: row.hover_image_url || row.data?.hoverImage || "",
    variants: productVariants,
    gallery_images: productGallery,
    galleryImages: productGallery.map((entry) => entry.image_url),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mergeOrder(row, orderItems) {
  const items = orderItems
    .filter((item) => item.order_id === row.id)
    .map((item) => ({
      ...(item.data || {}),
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      colorName: item.color_name,
      colorValue: item.color_value,
      selectedSize: item.size,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      lineTotal: Number(item.line_total || 0),
    }));

  return {
    ...(row.data || {}),
    id: row.id,
    customerUserId: row.customer_user_id,
    customer: row.customer || {},
    items,
    subtotal: Number(row.subtotal || 0),
    total: Number(row.total || 0),
    pointsEarned: Number(row.points_earned || 0),
    pointsRedeemed: Number(row.points_redeemed || 0),
    discountFromPoints: Number(row.discount_from_points || 0),
    paymentMethod: row.payment_method,
    status: row.status,
    handledByEmployeeId: row.handled_by_employee_id,
    assignedToEmployeeId: row.assigned_to_employee_id,
    createdByEmployeeId: row.created_by_employee_id,
    createdByEmployeeName: row.created_by_employee_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadStoreFromSupabase() {
  const [
    users,
    products,
    variants,
    galleryImages,
    orders,
    orderItems,
    carts,
    offers,
    categoryCards,
    reviews,
    workSessions,
  ] = await Promise.all([
    selectAll("users", "select=*"),
    selectAll("products", "select=*"),
    selectAll("product_variants", "select=*"),
    selectAll("product_gallery_images", "select=*"),
    selectAll("orders", "select=*"),
    selectAll("order_items", "select=*"),
    selectAll("carts", "select=*"),
    selectAll("homepage_offers", "select=*"),
    selectAll("homepage_category_cards", "select=*"),
    selectAll("reviews", "select=*"),
    selectAll("work_sessions", "select=*"),
  ]);

  const hasRows = [
    users,
    products,
    variants,
    galleryImages,
    orders,
    orderItems,
    carts,
    offers,
    categoryCards,
    reviews,
    workSessions,
  ].some((rows) => rows.length);

  return {
    isEmpty: !hasRows,
    store: {
      version: 1,
      savedAt: new Date().toISOString(),
      users: users.map(mergeUser),
      products: products.map((product) => mergeProduct(product, variants, galleryImages)),
      orders: orders.map((order) => mergeOrder(order, orderItems)),
      carts: Object.fromEntries(carts.map((cart) => [cart.user_id, cart.items || []])),
      offers: offers.map((offer) => offer.data || offer),
      categoryCards: categoryCards.map((card) => card.data || card),
      reviews: reviews.map((review) => review.data || review),
      workSessions: workSessions.map((session) => session.data || session),
    },
  };
}

export async function saveStoreToSupabase(store, options = {}) {
  const pruneMissing = options.pruneMissing !== false;
  const products = store.products || [];
  const orders = store.orders || [];
  const users = store.users || [];
  const offers = store.offers || [];
  const categoryCards = store.categoryCards || [];
  const reviews = store.reviews || [];
  const workSessions = store.workSessions || [];
  const carts = Object.entries(store.carts || {});

  const productRows = products.map(productRow);
  const productVariantRows = products.flatMap(variantRows);
  const productGalleryRows = products.flatMap(galleryRows);
  const orderRows = orders.map(orderRow);
  const itemRows = orders.flatMap(orderItemRows);
  const userRows = users.map(userRow);
  const offerRows = offers.map((offer, index) => ({
    id: offer.id,
    display_order: Number(offer.displayOrder || index + 1),
    is_active: offer.isActive !== false,
    data: offer,
    created_at: rowDate(offer.createdAt),
    updated_at: rowDate(offer.updatedAt),
  }));
  const cardRows = categoryCards.map((card, index) => ({
    id: card.key || card.id || `card-${index}`,
    card_key: card.key || card.id || `card-${index}`,
    display_order: Number(card.displayOrder || index + 1),
    is_active: card.isActive !== false,
    data: card,
    created_at: rowDate(card.createdAt),
    updated_at: rowDate(card.updatedAt),
  }));
  const reviewRows = reviews.map((review) => ({
    id: review.id,
    type: review.type || "store",
    rating: Number(review.rating || 5),
    status: review.status || "approved",
    is_active: review.isActive !== false,
    data: review,
    created_at: rowDate(review.createdAt),
    updated_at: rowDate(review.updatedAt),
  }));
  const workSessionRows = workSessions.map((session) => ({
    id: session.id,
    employee_id: session.employeeId,
    date: session.date,
    login_time: session.loginTime,
    logout_time: session.logoutTime,
    data: session,
    created_at: rowDate(session.createdAt),
    updated_at: rowDate(session.updatedAt),
  }));
  const cartRows = carts.map(([userId, items]) => ({
    id: userId,
    user_id: userId,
    items,
    updated_at: new Date().toISOString(),
  }));

  await upsertRows("users", userRows);
  await upsertRows("products", productRows);
  await upsertRows("product_variants", productVariantRows);
  await upsertRows("product_gallery_images", productGalleryRows);
  await upsertRows("orders", orderRows);
  await upsertRows("order_items", itemRows);
  await upsertRows("carts", cartRows);
  await upsertRows("homepage_offers", offerRows);
  await upsertRows("homepage_category_cards", cardRows);
  await upsertRows("reviews", reviewRows);
  await upsertRows("work_sessions", workSessionRows);

  if (pruneMissing) {
    await deleteMissingRows("users", userRows.map((row) => row.id));
    await deleteMissingRows("products", productRows.map((row) => row.id));
    await deleteMissingRows("product_variants", productVariantRows.map((row) => row.id));
    await deleteMissingRows("product_gallery_images", productGalleryRows.map((row) => row.id));
    await deleteMissingRows("orders", orderRows.map((row) => row.id));
    await deleteMissingRows("order_items", itemRows.map((row) => row.id));
    await deleteMissingRows("carts", cartRows.map((row) => row.id));
    await deleteMissingRows("homepage_offers", offerRows.map((row) => row.id));
    await deleteMissingRows("homepage_category_cards", cardRows.map((row) => row.id));
    await deleteMissingRows("reviews", reviewRows.map((row) => row.id));
    await deleteMissingRows("work_sessions", workSessionRows.map((row) => row.id));
  }
}

export async function uploadImageToSupabaseStorage({ filename, contentType, data }) {
  if (!isSupabaseStorageConfigured()) {
    throw new Error("Supabase Storage is not configured.");
  }

  const bucket = process.env.SUPABASE_BUCKET;
  const storagePath = `uploads/${new Date().toISOString().slice(0, 10)}/${filename}`;
  const encodedPath = encodeStoragePath(storagePath);
  await supabaseFetch(`/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: data,
  });

  const publicUrl = `${supabaseUrl()}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
  return {
    path: publicUrl,
    url: publicUrl,
    storagePath,
  };
}
