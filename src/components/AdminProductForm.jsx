import React from "react";
import { categories } from "../data/categories.js";

const emptyForm = {
  id: "",
  slug: "",
  nameEn: "",
  nameAr: "",
  categoryId: "home-cleaning",
  shortEn: "",
  shortAr: "",
  image: "/images/products/product-placeholder.svg",
  sizes: "500ml:18, 5L:55, 18L:145",
  badgeEn: "Featured",
  badgeAr: "منتج مميز",
  stockStatus: "In stock",
};

function sizesToText(sizes = []) {
  return sizes.map((item) => `${item.size}:${item.price}`).join(", ");
}

function parseSizes(value) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [size, price] = entry.split(":");
      return {
        size: size?.trim() || "500ml",
        price: Number(price || 0),
      };
    })
    .filter((entry) => entry.size && !Number.isNaN(entry.price));
}

function productToForm(product) {
  if (!product) {
    return emptyForm;
  }

  return {
    id: product.id,
    slug: product.slug,
    nameEn: product.name.en,
    nameAr: product.name.ar,
    categoryId: product.categoryId,
    shortEn: product.shortDescription.en,
    shortAr: product.shortDescription.ar,
    image: product.image,
    sizes: sizesToText(product.sizes),
    badgeEn: product.badge?.en || "Featured",
    badgeAr: product.badge?.ar || "منتج مميز",
    stockStatus: product.stockStatus || "In stock",
  };
}

function AdminProductForm({ editingProduct, language, onCancel, onSave, t }) {
  const [form, setForm] = React.useState(() => productToForm(editingProduct));
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(productToForm(editingProduct));
  }, [editingProduct]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
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
      image: form.image || "/images/products/product-placeholder.svg",
      fallbackImage: "/images/products/product-placeholder.svg",
      sizes: parseSizes(form.sizes),
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
      setForm(emptyForm);
    }
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
      <label>
        {t("admin.imagePath")}
        <input name="image" onChange={handleChange} value={form.image} />
      </label>
      <label>
        {t("admin.shortDescriptionEn")}
        <textarea name="shortEn" onChange={handleChange} required value={form.shortEn} />
      </label>
      <label>
        {t("admin.shortDescriptionAr")}
        <textarea name="shortAr" onChange={handleChange} required value={form.shortAr} />
      </label>
      <label>
        {t("admin.sizesPrices")}
        <input name="sizes" onChange={handleChange} required value={form.sizes} />
      </label>
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
        <button className="primary-action" disabled={isSaving} type="submit">
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
