import { Router } from "express";
import { persistStore, productCatalog } from "../data/store.js";

const router = Router();

function normalizeGalleryImages(product) {
  const source = product.gallery_images || product.galleryImages || [];
  return source
    .map((entry, index) => {
      const imageUrl = typeof entry === "string" ? entry : entry?.image_url || entry?.image || entry?.url;
      if (!imageUrl) return null;
      return {
        id: typeof entry === "object" && entry?.id ? entry.id : `gallery-${index}-${Date.now()}`,
        image_url: imageUrl,
        sort_order: Number(typeof entry === "object" ? entry?.sort_order ?? entry?.sortOrder ?? index : index),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeVariants(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length) {
    return variants
      .map((variant, index) => ({
        id: variant.id || `${product.id || "product"}-variant-${index}-${Date.now()}`,
        color_name: variant.color_name || variant.colorName || "Default",
        color_value: variant.color_value || variant.colorValue || variant.colorHex || "",
        size: variant.size || "500ml",
        price: Number(variant.price || 0),
        stock: Math.max(0, Number(variant.stock ?? variant.stockQty ?? product.stockQty ?? 0)),
        image_url: variant.image_url || variant.imageUrl || variant.image || "",
        sort_order: Number(variant.sort_order ?? variant.sortOrder ?? index),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  return (product.sizes || []).map((sizeOption, index) => ({
    id: `${product.id || "product"}-variant-${index}`,
    color_name: "Default",
    color_value: "",
    size: sizeOption.size || "500ml",
    price: Number(sizeOption.price || 0),
    stock: Math.max(0, Number(product.stockQty ?? 24)),
    image_url: product.image || "",
    sort_order: index,
  }));
}

function sizesFromVariants(variants, fallbackSizes = []) {
  const bySize = new Map();
  variants.forEach((variant) => {
    const current = bySize.get(variant.size);
    if (!current || Number(variant.price) < Number(current.price)) {
      bySize.set(variant.size, { size: variant.size, price: Number(variant.price || 0) });
    }
  });
  return bySize.size ? Array.from(bySize.values()) : fallbackSizes;
}

function normalizeProduct(product) {
  const image = product.image || "/images/products/product-placeholder.svg";
  const hoverImage =
    product.hoverImage ||
    product.secondaryImage ||
    product.gallery?.[1] ||
    "";

  const galleryImages = normalizeGalleryImages(product);
  const variants = normalizeVariants({ ...product, image });

  return {
    ...product,
    image,
    hoverImage,
    variants,
    sizes: sizesFromVariants(variants, product.sizes || []),
    gallery_images: galleryImages,
    galleryImages: galleryImages.map((entry) => entry.image_url),
    fallbackImage: product.fallbackImage || "/images/products/product-placeholder.svg",
  };
}

router.get("/", (_req, res) => {
  res.json(productCatalog.map(normalizeProduct));
});

router.post("/", async (req, res) => {
  const product = normalizeProduct({
    ...req.body,
    id: req.body.id || `product-${Date.now()}`,
    slug: req.body.slug || `product-${Date.now()}`,
  });
  productCatalog.unshift(product);
  await persistStore();
  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const index = productCatalog.findIndex((product) => product.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }
  productCatalog[index] = normalizeProduct({
    ...productCatalog[index],
    ...req.body,
    id: req.params.id,
  });
  await persistStore();
  return res.json(productCatalog[index]);
});

router.delete("/:id", async (req, res) => {
  const index = productCatalog.findIndex((product) => product.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }
  productCatalog.splice(index, 1);
  await persistStore();
  return res.status(204).end();
});

export default router;
