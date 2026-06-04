import React from "react";
import { categories } from "../data/categories.js";
import { uploadImage, uploadImages } from "../utils/api.js";

const placeholderImage = "/images/products/product-placeholder.svg";

const emptyForm = {
  id: "",
  slug: "",
  nameEn: "",
  nameAr: "",
  categoryId: "home-cleaning",
  shortEn: "",
  shortAr: "",
  image: placeholderImage,
  hoverImage: "",
  galleryImages: [],
  variants: [],
  badgeEn: "Featured",
  badgeAr: "منتج مميز",
  stockStatus: "In stock",
};

function normalizeVariant(variant = {}, index = 0, product = {}) {
  return {
    id: variant.id || `${product.id || "product"}-variant-${index}`,
    color_name: variant.color_name || variant.colorName || "Default",
    color_value: variant.color_value || variant.colorValue || "",
    size: variant.size || product.sizes?.[0]?.size || "500ml",
    price: Number(variant.price ?? product.sizes?.[0]?.price ?? 0),
    stock: Math.max(0, Number(variant.stock ?? variant.stockQty ?? product.stockQty ?? 0)),
    image_url: variant.image_url || variant.imageUrl || variant.image || "",
    sort_order: Number(variant.sort_order ?? variant.sortOrder ?? index),
  };
}

function normalizeGalleryImages(product = {}) {
  product = product || {};
  const source = product.gallery_images || product.galleryImages || [];
  return source
    .map((entry, index) => ({
      id: typeof entry === "object" && entry?.id ? entry.id : `gallery-${index}`,
      image_url: typeof entry === "string" ? entry : entry?.image_url || entry?.image || entry?.url || "",
      sort_order: Number(typeof entry === "object" ? entry?.sort_order ?? entry?.sortOrder ?? index : index),
    }))
    .filter((entry) => entry.image_url);
}

function normalizeVariants(product = {}) {
  product = product || {};
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.map((variant, index) => normalizeVariant(variant, index, product));
  }

  return (product.sizes || []).map((sizeOption, index) =>
    normalizeVariant(
      {
        color_name: "Default",
        size: sizeOption.size,
        price: sizeOption.price,
        stock: product.stockQty ?? 24,
        image_url: product.image || "",
      },
      index,
      product,
    ),
  );
}

function createDefaultVariant(product = {}) {
  return normalizeVariant(
    {
      color_name: "Default",
      color_value: "#1db7d8",
      size: product.sizes?.[0]?.size || "500ml",
      price: product.sizes?.[0]?.price ?? 18,
      stock: product.stockQty ?? 24,
      image_url: product.image || "",
    },
    0,
    product,
  );
}

function sizesFromVariants(variants) {
  const bySize = new Map();
  variants.forEach((variant) => {
    if (!variant.size) return;
    const current = bySize.get(variant.size);
    if (!current || Number(variant.price) < Number(current.price)) {
      bySize.set(variant.size, { size: variant.size, price: Number(variant.price || 0) });
    }
  });
  return bySize.size ? Array.from(bySize.values()) : [{ size: "500ml", price: 18 }];
}

function createEmptyForm() {
  return {
    ...emptyForm,
    galleryImages: [],
    variants: [createDefaultVariant(emptyForm)],
  };
}

function productToForm(product) {
  if (!product) {
    return createEmptyForm();
  }

  return {
    id: product.id,
    slug: product.slug,
    nameEn: product.name.en,
    nameAr: product.name.ar,
    categoryId: product.categoryId,
    shortEn: product.shortDescription.en,
    shortAr: product.shortDescription.ar,
    image: product.image || placeholderImage,
    hoverImage: product.hoverImage || product.secondaryImage || "",
    galleryImages: normalizeGalleryImages(product),
    variants: normalizeVariants(product).length ? normalizeVariants(product) : [createDefaultVariant(product)],
    badgeEn: product.badge?.en || "Featured",
    badgeAr: product.badge?.ar || "منتج مميز",
    stockStatus: product.stockStatus || "In stock",
  };
}

function AdminProductForm({ editingProduct, language, onCancel, onSave, t }) {
  const [form, setForm] = React.useState(() => productToForm(editingProduct));
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadingField, setUploadingField] = React.useState("");
  const [uploadError, setUploadError] = React.useState("");
  const [uploadingVariantIndex, setUploadingVariantIndex] = React.useState(-1);

  React.useEffect(() => {
    setForm(productToForm(editingProduct));
    setUploadError("");
  }, [editingProduct]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleImageUpload(fieldName, event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError("");
    setUploadingField(fieldName);

    try {
      const result = await uploadImage(file);
      setForm((currentForm) => ({
        ...currentForm,
        [fieldName]: result.url || result.path || currentForm[fieldName],
      }));
    } catch (error) {
      setUploadError(error.message || "Image upload failed.");
    } finally {
      setUploadingField("");
    }
  }

  async function handleGalleryUpload(event) {
    const files = event.target.files;
    event.target.value = "";

    if (!files?.length) {
      return;
    }

    setUploadError("");
    setUploadingField("galleryImages");

    try {
      const uploaded = await uploadImages(files);
      setForm((currentForm) => {
        const currentImages = currentForm.galleryImages || [];
        const nextImages = uploaded
          .map((item, index) => ({
            id: `gallery-${Date.now()}-${index}`,
            image_url: item.url || item.path,
            sort_order: currentImages.length + index,
          }))
          .filter((item) => item.image_url);
        return {
          ...currentForm,
          galleryImages: [...currentImages, ...nextImages],
        };
      });
    } catch (error) {
      setUploadError(error.message || "Images upload failed.");
    } finally {
      setUploadingField("");
    }
  }

  function removeGalleryImage(index) {
    setForm((currentForm) => ({
      ...currentForm,
      galleryImages: (currentForm.galleryImages || [])
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, sortIndex) => ({ ...image, sort_order: sortIndex })),
    }));
  }

  function addVariant() {
    setForm((currentForm) => ({
      ...currentForm,
      variants: [
        ...(currentForm.variants || []),
        normalizeVariant(
          {
            color_name: "",
            color_value: "#1db7d8",
            size: "",
            price: 0,
            stock: 0,
            image_url: currentForm.image || "",
          },
          currentForm.variants?.length || 0,
          currentForm,
        ),
      ],
    }));
  }

  function updateVariant(index, field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      variants: (currentForm.variants || []).map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  }

  function removeVariant(index) {
    setForm((currentForm) => ({
      ...currentForm,
      variants: (currentForm.variants || []).filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  async function handleVariantImageUpload(index, event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError("");
    setUploadingVariantIndex(index);

    try {
      const result = await uploadImage(file);
      updateVariant(index, "image_url", result.url || result.path || "");
    } catch (error) {
      setUploadError(error.message || "Variant image upload failed.");
    } finally {
      setUploadingVariantIndex(-1);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    const slug =
      form.slug.trim() ||
      form.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const variants = (form.variants || [])
      .filter((variant) => variant.color_name && variant.size)
      .map((variant, index) => ({
        ...normalizeVariant(variant, index, form),
        id: variant.id || `${form.id || slug}-variant-${index}`,
        price: Number(variant.price || 0),
        stock: Math.max(0, Number(variant.stock || 0)),
        sort_order: index,
      }));
    const galleryImages = (form.galleryImages || []).map((image, index) => ({
      id: image.id || `gallery-${index}`,
      image_url: image.image_url,
      sort_order: index,
    }));

    const result = await onSave({
      id: form.id || `product-${Date.now()}`,
      slug,
      name: {
        en: form.nameEn,
        ar: form.nameAr,
      },
      categoryId: form.categoryId,
      shortDescription: {
        en: form.shortEn,
        ar: form.shortAr,
      },
      longDescription: {
        en: form.shortEn,
        ar: form.shortAr,
      },
      image: form.image || placeholderImage,
      hoverImage: form.hoverImage || "",
      fallbackImage: placeholderImage,
      variants,
      sizes: sizesFromVariants(variants),
      gallery_images: galleryImages,
      galleryImages: galleryImages.map((image) => image.image_url),
      badge: {
        en: form.badgeEn,
        ar: form.badgeAr,
      },
      stockStatus: form.stockStatus,
      usageNotes: {
        en: "Product managed from the admin dashboard.",
        ar: "منتج يتم إدارته من لوحة التحكم.",
      },
    });
    setIsSaving(false);

    if (result?.ok && !editingProduct) {
      setForm(createEmptyForm());
    }
  }

  function renderImageField(fieldName, labelKey, uploadLabelKey, previewLabelKey) {
    const isUploading = uploadingField === fieldName;

    return (
      <label>
        {t(labelKey)}
        <span className="image-upload-row">
          <input name={fieldName} onChange={handleChange} value={form[fieldName]} />
          <span className="upload-button-shell">
            <input
              accept="image/*"
              aria-label={t(uploadLabelKey)}
              onChange={(event) => handleImageUpload(fieldName, event)}
              type="file"
            />
            <span>{isUploading ? t("admin.uploading") : t("admin.uploadImage")}</span>
          </span>
        </span>
        {form[fieldName] && (
          <img
            alt={t(previewLabelKey)}
            className="admin-image-preview"
            src={form[fieldName]}
            onError={(event) => {
              event.currentTarget.src = placeholderImage;
            }}
          />
        )}
      </label>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>{editingProduct ? t("admin.editProduct") : t("admin.addProduct")}</h3>
      <label>
        {t("admin.productNameEn")}
        <input name="nameEn" onChange={handleChange} required value={form.nameEn} />
      </label>
      <label>
        {t("admin.productNameAr")}
        <input name="nameAr" onChange={handleChange} required value={form.nameAr} />
      </label>
      <label>
        {t("admin.category")}
        <select name="categoryId" onChange={handleChange} value={form.categoryId}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name[language]}
            </option>
          ))}
        </select>
      </label>
      {renderImageField(
        "image",
        "admin.imagePath",
        "admin.uploadMainImage",
        "admin.mainImagePreview",
      )}
      {renderImageField(
        "hoverImage",
        "admin.secondImagePath",
        "admin.uploadHoverImage",
        "admin.hoverImagePreview",
      )}
      <div className="full-field admin-gallery-editor">
        <div className="admin-inline-heading">
          <strong>{language === "ar" ? "صور المعرض العمودي" : "Vertical Gallery Images"}</strong>
          <label className="upload-button-shell">
            <input
              accept="image/*"
              aria-label={language === "ar" ? "رفع صور المعرض" : "Upload gallery images"}
              multiple
              onChange={handleGalleryUpload}
              type="file"
            />
            <span>
              {uploadingField === "galleryImages"
                ? t("admin.uploading")
                : language === "ar"
                  ? "رفع صور المعرض"
                  : "Upload Gallery Images"}
            </span>
          </label>
        </div>
        <div className="admin-gallery-preview-grid">
          {(form.galleryImages || []).map((image, index) => (
            <figure className="admin-gallery-preview" key={`${image.image_url}-${index}`}>
              <img alt="" src={image.image_url} />
              <button onClick={() => removeGalleryImage(index)} type="button">
                {language === "ar" ? "حذف" : "Remove"}
              </button>
            </figure>
          ))}
        </div>
      </div>
      {uploadError && <div className="message-panel error full-field">{uploadError}</div>}
      <label>
        {t("admin.shortDescriptionEn")}
        <textarea name="shortEn" onChange={handleChange} required value={form.shortEn} />
      </label>
      <label>
        {t("admin.shortDescriptionAr")}
        <textarea name="shortAr" onChange={handleChange} required value={form.shortAr} />
      </label>
      <div className="full-field admin-variants-editor">
        <div className="admin-inline-heading">
          <strong>{language === "ar" ? "ألوان وأحجام المنتج" : "Product Variants"}</strong>
          <button className="secondary-action compact-action" onClick={addVariant} type="button">
            {language === "ar" ? "إضافة خيار" : "Add Variant"}
          </button>
        </div>
        <div className="admin-variant-grid">
          {(form.variants || []).map((variant, index) => (
            <div className="admin-variant-row" key={variant.id || index}>
              <label>
                {language === "ar" ? "اسم اللون" : "Color name"}
                <input
                  required
                  value={variant.color_name}
                  onChange={(event) => updateVariant(index, "color_name", event.target.value)}
                />
              </label>
              <label>
                {language === "ar" ? "قيمة اللون" : "Color value"}
                <input
                  value={variant.color_value}
                  onChange={(event) => updateVariant(index, "color_value", event.target.value)}
                />
              </label>
              <label>
                {language === "ar" ? "الحجم" : "Size"}
                <input
                  required
                  value={variant.size}
                  onChange={(event) => updateVariant(index, "size", event.target.value)}
                />
              </label>
              <label>
                {language === "ar" ? "السعر" : "Price"}
                <input
                  min="0"
                  required
                  type="number"
                  value={variant.price}
                  onChange={(event) => updateVariant(index, "price", event.target.value)}
                />
              </label>
              <label>
                {language === "ar" ? "المخزون" : "Stock"}
                <input
                  min="0"
                  required
                  type="number"
                  value={variant.stock}
                  onChange={(event) => updateVariant(index, "stock", event.target.value)}
                />
              </label>
              <label>
                {language === "ar" ? "صورة الخيار" : "Variant image"}
                <span className="image-upload-row">
                  <input
                    value={variant.image_url}
                    onChange={(event) => updateVariant(index, "image_url", event.target.value)}
                  />
                  <span className="upload-button-shell">
                    <input
                      accept="image/*"
                      aria-label={language === "ar" ? "رفع صورة الخيار" : "Upload variant image"}
                      onChange={(event) => handleVariantImageUpload(index, event)}
                      type="file"
                    />
                    <span>
                      {uploadingVariantIndex === index
                        ? t("admin.uploading")
                        : language === "ar"
                          ? "رفع"
                          : "Upload"}
                    </span>
                  </span>
                </span>
                {variant.image_url && (
                  <img
                    alt=""
                    className="admin-image-preview small-preview"
                    src={variant.image_url}
                    onError={(event) => {
                      event.currentTarget.src = placeholderImage;
                    }}
                  />
                )}
              </label>
              <button className="text-action danger" onClick={() => removeVariant(index)} type="button">
                {language === "ar" ? "حذف" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <label>
        {t("admin.badge")}
        <input name="badgeEn" onChange={handleChange} value={form.badgeEn} />
      </label>
      <label>
        {t("admin.badgeAr")}
        <input name="badgeAr" onChange={handleChange} value={form.badgeAr} />
      </label>
      <label>
        {t("admin.stockStatus")}
        <input name="stockStatus" onChange={handleChange} value={form.stockStatus} />
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={isSaving || Boolean(uploadingField)} type="submit">
          {isSaving ? t("common.temporaryContent") : t("admin.save")}
        </button>
        <button className="secondary-action" onClick={onCancel} type="button">
          {t("admin.cancel")}
        </button>
      </div>
    </form>
  );
}

export default AdminProductForm;
