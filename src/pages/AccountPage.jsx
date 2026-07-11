import React from "react";
import { neutralImage, resolveImageUrl, showNeutralImage } from "../utils/images.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { uploadAvatar } from "../utils/api.js";

function formatPrice(value, t) {
  return `${Number(value || 0).toLocaleString()} ${t("common.ils")}`;
}

function getLocalized(value, language, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || fallback;
}

function normalizePhone(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.startsWith("970")) return digits.slice(3);
  if (digits.startsWith("972")) return digits.slice(3);
  return digits.replace(/^0+/, "") || digits;
}

function AccountPage({ currentUser, language, onLogout, onNavigate, onSubmitReview, onAddToCart, onUpdateUser, orders, products, t }) {
  const [activeTab, setActiveTab] = React.useState("orders");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ name: "", email: "", phone: "", city: "", address: "" });
  const [editMessage, setEditMessage] = React.useState("");
  const [editMessageType, setEditMessageType] = React.useState("success");
  const [reviewForm, setReviewForm] = React.useState({
    type: "website",
    rating: 5,
    comment: "",
    orderId: "",
    productId: "",
    employeeId: "",
  });
  const [reviewMessage, setReviewMessage] = React.useState("");
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [avatarMessage, setAvatarMessage] = React.useState("");
  const [avatarMessageType, setAvatarMessageType] = React.useState("success");
  const [avatarVersion, setAvatarVersion] = React.useState(Date.now());

  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const copy = {
    orderHistory: localized("Order History", "سجل الطلبات", "היסטוריית הזמנות"),
    personalInfo: localized("Personal Information", "المعلومات الشخصية", "מידע אישי"),
    viewedProducts: localized("Recommended Products", "المنتجات المعروضة", "מוצרים שנצפו לאחרונה"),
    subscriptions: localized("Manage Subscriptions", "الاشتراكات", "נהל מינויים"),
    logout: localized("Logout", "تسجيل الخروج", "התנתק"),
    noOrders: localized("You haven't placed any orders yet.", "لم تقم بإنشاء أي طلبات بعد.", "עדיין לא ביצעת הזמנות."),
    startShopping: localized("Start shopping", "ابدأ التسوق", "התחל לקנות"),
    accountTitle: localized("My Account", "حسابي", "החשבון שלי"),
    ebPoints: localized("EB Points", "نقاط EB", "נקודות EB"),
    availablePoints: localized("Available points", "النقاط المتاحة", "נקודות זמינות"),
    earnedPoints: localized("Earned points", "النقاط المكتسبة", "נקודות שנצברו"),
    redeemedPoints: localized("Redeemed points", "النقاط المستخدمة", "נקודות שנוצלו"),
    orderPoints: localized("Points earned from this order", "النقاط المكتسبة من هذا الطلب", "נקודות שהרווחת מהזמנה זו"),
    addressTitle: localized("Default Address", "العنوان الافتراضي", "כתובת ברירת מחדל"),
    addressFallback: localized("No address added yet", "لم يتم إضافة عنوان بعد", "עדיין לא נוספה כתובת"),
    addAddress: localized("Add a new address", "إضافة عنوان جديد", "הוסף כתובת חדשה"),
    edit: localized("Edit", "تعديل", "ערוך"),
    delete: localized("Delete", "حذف", "מחק"),
    name: localized("Name", "الاسم", "שם"),
    email: localized("Email", "البريد الإلكتروني", "אימייל"),
    phone: localized("Phone", "رقم الجوال", "טלפון"),
    role: localized("Account type", "نوع الحساب", "סוג חשבון"),
    currentSubscriptions: localized("Current Subscriptions", "الاشتراكات الحالية", "מינויים נוכחיים"),
    noSubscriptions: localized("No active subscriptions yet.", "لا توجد اشتراكات نشطة حاليًا.", "אין מינויים פעילים עדיין."),
    discover: localized("Discover selected EB Chemical products", "اكتشف منتجات EB Chemical المختارة لك", "גלה מוצרי EB Chemical שנבחרו עבורך"),
    addToCart: t("common.add"),
    reviews: localized("Reviews", "التقييمات", "ביקורות"),
    writeReview: localized("Write a review", "اكتب تقييماً", "כתוב ביקורת"),
    reviewType: localized("Review type", "نوع التقييم", "סוג ביקורת"),
    productReview: localized("Product Review", "تقييم منتج", "ביקורת מוצר"),
    websiteReview: localized("Website Review", "تقييم الموقع", "ביקורת אתר"),
    orderReview: localized("Order Review", "تقييم الطلب", "ביקורת הזמנה"),
    employeeReview: localized("Employee Review", "تقييم الموظف", "ביקורת עובד"),
    relatedProduct: localized("Related product", "المنتج المرتبط", "מוצר קשור"),
    relatedOrder: localized("Related order", "الطلب المرتبط", "הזמנה קשורה"),
    relatedEmployee: localized("Employee", "الموظف", "עובד"),
    rating: localized("Rating", "التقييم", "דירוג"),
    reviewComment: localized("Review text", "نص التقييم", "טקסט הביקורת"),
    submitReview: localized("Submit review", "إرسال التقييم", "שלח ביקורת"),
    reviewSaved: localized("Review submitted and awaiting admin approval", "تم إرسال التقييم وهو بانتظار موافقة الإدارة", "הביקורת נשלחה ומחכה לאישור מנהל"),
    save: localized("Save", "حفظ", "שמור"),
    cancel: localized("Cancel", "إلغاء", "בטל"),
    profileUpdated: localized("Profile updated successfully", "تم تحديث الملف الشخصي بنجاح", "הפרופיל עודכן בהצלחה"),
    city: localized("City", "المدينة", "עיר"),
    address: localized("Address", "العنوان", "כתובת"),
    noEmployeeAssigned: localized("No employee assigned to this order", "لا يوجد موظف مرتبط بهذا الطلب", "אין עובד משויך להזמנה זו"),
  };

  if (!currentUser) {
    return (
      <section className="page-shell">
        <div className="empty-panel">
          <h1>{t("auth.myAccount")}</h1>
          <p>{t("auth.loginRequired")}</p>
          <button className="primary-action" onClick={() => onNavigate("login")}>
            {t("auth.login")}
          </button>
        </div>
      </section>
    );
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const userPhone = normalizePhone(currentUser.phone);
  const customerOrders = safeOrders.filter(
    (order) =>
      order.customerUserId === currentUser.id
      || order.customer_user_id === currentUser.id
      || (userPhone && order.customer?.phone && normalizePhone(order.customer.phone) === userPhone)
  );
  const reviewableOrders = customerOrders.filter((order) => order.status === "Completed");
  const availablePoints = Math.max(0, Number(currentUser.ebPoints || 0));
  const totalPointsEarned = Math.max(0, Number(currentUser.totalPointsEarned || 0));
  const totalPointsRedeemed = Math.max(0, Number(currentUser.totalPointsRedeemed || 0));
  const orderedProductIds = new Set(
    customerOrders.flatMap((o) => (o.items || []).map((item) => item.productId || item.product_id)),
  );
  const orderedProducts = safeProducts.filter((p) => orderedProductIds.has(p.id));
  const featuredProducts = safeProducts.slice(0, 4);

  function orderPointsDisplay(order) {
    const earned = Math.max(0, Number(order.pointsEarned || 0));
    if (earned > 0) return earned;
    if (!order.items || !order.items.length) return 0;
    const subtotal = order.items.reduce((sum, item) => sum + Math.max(0, Number(item.lineTotal || item.price * item.quantity || 0)), 0);
    const discount = Math.max(0, Number(order.discountFromPoints || 0));
    const paid = Math.max(0, subtotal - discount);
    return Math.floor(paid);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return "-";
      const locale = language === "ar" ? "ar" : language === "he" ? "he-IL" : "en-US";
      return date.toLocaleDateString(locale);
    } catch { return "-"; }
  }

  function renderOrderHistory() {
    return (
      <section className="account-main-card account-orders-view">
        {customerOrders.length === 0 ? (
          <div className="account-empty-orders">
            <h2>{copy.noOrders}</h2>
            <button className="primary-action" onClick={() => onNavigate("products")} type="button">
              {copy.startShopping}
            </button>
          </div>
        ) : (
          <div className="customer-order-list account-order-list-modern">
            {customerOrders.map((order) => (
              <article className="customer-order-card" key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <span>{formatDate(order.createdAt || order.created_at)}</span>
                </div>
                <StatusBadge status={order.status} t={t} />
                <p>
                  {(order.items || [])
                    .map((item) => {
                      const product = safeProducts.find((entry) => entry.id === item.productId || entry.id === item.product_id);
                      return `${getLocalized(product?.name, language, item.productName || item.slug)} ${item.size || item.selectedSize || ""} x${item.quantity ?? 1}`;
                    })
                    .join(", ")}
                </p>
                <strong>{formatPrice(order.total, t)}</strong>
                <small className="account-order-points">
                  {copy.orderPoints}: {orderPointsDisplay(order)}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function updateReviewField(event) {
    const { name, value } = event.target;
    setReviewForm((currentForm) => {
      const updated = { ...currentForm, [name]: name === "rating" ? Number(value) : value };
      if (name === "type") {
        updated.productId = "";
        updated.orderId = "";
        updated.employeeId = "";
      }
      return updated;
    });
  }

  const employeeForOrder = React.useMemo(() => {
    if (!reviewForm.orderId) return null;
    const order = customerOrders.find((o) => o.id === reviewForm.orderId);
    if (!order) return null;
    const empId = order.handledByEmployeeId || order.assignedToEmployeeId || "";
    const empName = order.createdByEmployeeName || order.createdBy?.name || "";
    return empId && empName ? { id: empId, name: empName } : null;
  }, [reviewForm.orderId, customerOrders]);

  async function submitReview(event) {
    event.preventDefault();
    if (submittingReview) return;
    if (reviewForm.type === "product" && !reviewForm.productId) return;
    if ((reviewForm.type === "order" || reviewForm.type === "employee") && !reviewForm.orderId) return;
    setSubmittingReview(true);
    setReviewMessage("");
    const review = {
      type: reviewForm.type,
      rating: reviewForm.rating,
      customerName: currentUser.name,
      comment: {
        en: reviewForm.comment,
        ar: reviewForm.comment,
      },
      isActive: true,
    };
    if (reviewForm.type === "product") {
      review.productId = reviewForm.productId;
    } else if (reviewForm.type === "order") {
      review.orderId = reviewForm.orderId;
    } else if (reviewForm.type === "employee") {
      review.orderId = reviewForm.orderId || "";
      review.employeeId = employeeForOrder?.id || "";
      review.employeeName = employeeForOrder?.name || "";
    }
    try {
      await onSubmitReview?.(review);
      setReviewMessage(copy.reviewSaved);
      setReviewForm({ type: "website", rating: 5, comment: "", orderId: "", productId: "", employeeId: "" });
    } catch {
      setReviewMessage(localized("Failed to submit review, try again", "فشل إرسال التقييم، حاول مرة أخرى", "נכשל בשליחת הביקורת, נסה שוב"));
    } finally {
      setSubmittingReview(false);
    }
  }

  function renderReviews() {
    const hasOrders = customerOrders.length > 0;
    return (
      <section className="account-main-card account-review-panel">
        <h2>{copy.writeReview}</h2>
        <form className="account-review-form" onSubmit={submitReview}>
          {reviewMessage && <div className="message-panel success">{reviewMessage}</div>}
          <label>
            {copy.reviewType}
            <select name="type" onChange={updateReviewField} value={reviewForm.type}>
              <option value="product">{copy.productReview}</option>
              <option value="website">{copy.websiteReview}</option>
              <option value="order">{copy.orderReview}</option>
              <option value="employee">{copy.employeeReview}</option>
            </select>
          </label>
          {reviewForm.type === "product" && (
            <label>
              {copy.relatedProduct}
              <select name="productId" onChange={updateReviewField} value={reviewForm.productId} required>
                <option value="">{localized("Select a product", "اختر منتج", "בחר מוצר")}</option>
                {orderedProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {getLocalized(product.name, language, product.slug)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {(reviewForm.type === "order" || reviewForm.type === "employee") && hasOrders && (
            <label>
              {copy.relatedOrder}
              <select name="orderId" onChange={updateReviewField} value={reviewForm.orderId} required>
                <option value="">{localized("Select an order", "اختر طلب", "בחר הזמנה")}</option>
                {customerOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id}
                  </option>
                ))}
              </select>
            </label>
          )}
          {reviewForm.type === "employee" && reviewForm.orderId && (
            <label>
              {copy.relatedEmployee}
              {employeeForOrder ? (
                <input disabled type="text" value={employeeForOrder.name} />
              ) : (
                <input disabled type="text" value={copy.noEmployeeAssigned} />
              )}
            </label>
          )}
          <label>
            {copy.rating}
            <select name="rating" onChange={updateReviewField} value={reviewForm.rating}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {"★".repeat(rating)}
                </option>
              ))}
            </select>
          </label>
          <label className="full-field">
            {copy.reviewComment}
            <textarea
              name="comment"
              onChange={updateReviewField}
              required
              value={reviewForm.comment}
            />
          </label>
          <button className="primary-action" disabled={submittingReview} type="submit">
            {submittingReview ? localized("Sending...", "جارٍ الإرسال...", "שולח...") : copy.submitReview}
          </button>
        </form>
      </section>
    );
  }

  function renderProducts() {
    return (
      <section className="account-products-view">
        <div className="account-section-head">
          <h2>{copy.viewedProducts}</h2>
          <p>{copy.discover}</p>
        </div>
        <div className="account-product-row">
          {safeProducts.slice(0, 4).map((product) => {
            const firstSize = product.sizes?.[0];
            const mainImage = resolveImageUrl(product.image, product.fallbackImage);
            return (
              <article className="account-product-card" key={product.id}>
                <button
                  className="account-product-image-wrap"
                  onClick={() => onNavigate("product", { slug: product.slug })}
                  type="button"
                >
                  <img
                    alt={getLocalized(product.name, language, product.slug)}
                    onError={showNeutralImage}
                    src={mainImage}
                  />
                </button>
                <strong>{getLocalized(product.name, language, product.slug)}</strong>
                <small>{getLocalized(product.shortDescription, language, "")}</small>
                <div className="account-product-card-footer">
                  {firstSize && <span>{t("common.from")} {formatPrice(firstSize.price, t)}</span>}
                  <button
                    className="add-to-cart-icon"
                    onClick={() => onAddToCart(product, firstSize?.size)}
                    title={copy.addToCart}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  function startEditing() {
    setEditForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      city: currentUser.city || "",
      address: currentUser.address || "",
    });
    setEditMessage("");
    setEditMessageType("success");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditMessage("");
    setEditMessageType("success");
  }

  function handleEditField(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!editForm.name || !editForm.email) return;
    setSaving(true);
    setEditMessage("");
    setEditMessageType("success");
    try {
      const updated = await onUpdateUser({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        city: editForm.city,
        address: editForm.address,
      });
      if (updated) {
        setEditMessageType("success");
        setEditMessage(localized("Profile updated successfully", "تم تحديث البيانات بنجاح", "הפרופיל עודכן בהצלחה"));
      }
      setIsEditing(false);
    } catch {
      setEditMessageType("error");
      setEditMessage(localized("Failed to update profile", "فشل تحديث الملف الشخصي", "נכשל בעדכון הפרופיל"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarMessage("");
    setAvatarMessageType("success");
    try {
      const result = await uploadAvatar(file);
      const avatarUrl = result.url || result.path || "";
      if (avatarUrl) {
        await onUpdateUser({ avatarUrl });
        setAvatarVersion(Date.now());
        setAvatarMessageType("success");
        setAvatarMessage(localized("Profile image updated", "تم تحديث صورة الحساب بنجاح", "תמונת הפרופיל עודכנה בהצלחה"));
      }
    } catch {
      setAvatarMessageType("error");
      setAvatarMessage(localized("Image upload failed, try again", "فشل رفع الصورة، حاول مرة أخرى", "העלאה נכשלה, נסה שוב"));
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  function renderPersonalInfo() {
    return (
      <section className="account-personal-view">
        <div className="account-main-card account-info-card">
          <div className="account-info-head">
            <h2>{copy.addressTitle}</h2>
            {!isEditing && (
              <div>
                <button onClick={startEditing} type="button">{copy.edit}</button>
              </div>
            )}
          </div>
          {editMessage && <div className={`message-panel ${editMessageType === "error" ? "error" : "success"}`}>{editMessage}</div>}
          {isEditing ? (
            <form className="account-profile-form" onSubmit={saveProfile}>
              <div className="account-profile-fields">
                <label><strong>{copy.name}</strong><input name="name" onChange={handleEditField} required type="text" value={editForm.name} /></label>
                <label><strong>{copy.email}</strong><input name="email" onChange={handleEditField} required type="email" value={editForm.email} /></label>
                <label><strong>{copy.phone}</strong><input name="phone" onChange={handleEditField} type="tel" value={editForm.phone} /></label>
                <label><strong>{copy.city}</strong><input name="city" onChange={handleEditField} type="text" value={editForm.city} /></label>
                <label className="full-field"><strong>{copy.address}</strong><input name="address" onChange={handleEditField} type="text" value={editForm.address} /></label>
              </div>
              <div className="account-profile-actions">
                <button className="primary-action" disabled={saving} type="submit">{saving ? localized("Saving...", "جارٍ الحفظ...", "שומר...") : copy.save}</button>
                <button className="secondary-action" disabled={saving} onClick={cancelEditing} type="button">{copy.cancel}</button>
              </div>
            </form>
          ) : (
            <>
              <p>{currentUser.city || currentUser.address || copy.addressFallback}</p>
              <hr />
              <div className="account-profile-fields">
                <span><strong>{copy.name}</strong>{currentUser.name}</span>
                <span><strong>{copy.email}</strong>{currentUser.email}</span>
                <span><strong>{copy.phone}</strong>{currentUser.phone || "—"}</span>
                <span><strong>{copy.role}</strong>{(currentUser.accountType === "trader" || currentUser.accountType === "wholesale") ? localized("Trader", "تاجر", "סוחר") : localized("Retail customer", "عميل عادي", "לקוח רגיל")}</span>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="account-dashboard-page">
      <div className="account-dashboard-grid">
        <aside className="account-side-column">
          <nav className="account-side-menu" aria-label={copy.accountTitle}>
            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
              type="button"
            >
              <span>▱</span>{copy.orderHistory}
            </button>
            <button
              className={activeTab === "info" ? "active" : ""}
              onClick={() => setActiveTab("info")}
              type="button"
            >
              <span>◎</span>{copy.personalInfo}
            </button>
            <button
              className={activeTab === "products" ? "active" : ""}
              onClick={() => setActiveTab("products")}
              type="button"
            >
              <span>↻</span>{copy.viewedProducts}
            </button>
            <button
              className={activeTab === "subscriptions" ? "active" : ""}
              onClick={() => setActiveTab("subscriptions")}
              type="button"
            >
              <span>⟳</span>{copy.subscriptions}
            </button>
            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
              type="button"
            >
              <span>★</span>{copy.reviews}
            </button>
            <button onClick={onLogout} type="button">
              <span>↪</span>{copy.logout}
            </button>
          </nav>

        </aside>

        <main className="account-center-column">
          {activeTab === "orders" && renderOrderHistory()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "info" && renderPersonalInfo()}
          {activeTab === "reviews" && renderReviews()}
          {activeTab === "subscriptions" && (
            <section className="account-main-card account-empty-orders">
              <h2>{copy.currentSubscriptions}</h2>
              <p>{copy.noSubscriptions}</p>
              <button className="primary-action" onClick={() => onNavigate("products")} type="button">
                {copy.startShopping}
              </button>
            </section>
          )}
        </main>

        <aside className="account-right-column">
          {avatarMessage && <div className={`message-panel ${avatarMessageType === "error" ? "error" : "success"}`} style={{ marginBottom: "0.5rem" }}>{avatarMessage}</div>}
          <article className="account-summary-card">
            <label className="account-avatar-upload">
              <img
                alt=""
                className="account-summary-image"
                onError={showNeutralImage}
                src={currentUser.avatarUrl ? `${currentUser.avatarUrl}${currentUser.avatarUrl.includes("?") ? "&" : "?"}v=${avatarVersion}` : neutralImage}
              />
              {avatarUploading ? (
                <span className="account-avatar-overlay">
                  {localized("Uploading...", "جاري الرفع...", "מעלה...")}
                </span>
              ) : (
                <span className="account-avatar-overlay">
                  {localized("Change", "تغيير", "שנה")}
                </span>
              )}
              <input accept="image/*" hidden type="file" onChange={handleAvatarUpload} />
            </label>
            <h2>{currentUser.name}</h2>
            <p className="account-summary-subtitle">{currentUser.email}</p>
            {(currentUser.accountType === "trader" || currentUser.accountType === "wholesale") && (
              <span className="account-trader-badge">
                {localized("Trader Account", "حساب تاجر", "חשבון סוחר")}
              </span>
            )}
          </article>
          <article className="account-points-card">
            <span>{copy.ebPoints}</span>
            <strong>{availablePoints.toLocaleString()}</strong>
            <small>{copy.availablePoints}</small>
            <div className="account-points-breakdown">
              <span>
                <b>{totalPointsEarned.toLocaleString()}</b>
                {copy.earnedPoints}
              </span>
              <span>
                <b>{totalPointsRedeemed.toLocaleString()}</b>
                {copy.redeemedPoints}
              </span>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default AccountPage;
