export function isVariantVisible(variant = {}) {
  return (
    variant.isVisible !== false &&
    variant.is_visible !== false &&
    variant.hiddenFromStorefront !== true
  );
}

export function getVisibleVariants(product = {}) {
  return Array.isArray(product.variants) ? product.variants.filter(isVariantVisible) : [];
}

export function findCartItemVariant(product, item) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;

  if (item?.variantId) {
    return variants.find((variant) => variant.id === item.variantId) || null;
  }

  return (
    variants.find((variant) => {
      const sameSize =
        String(variant.size || "") === String(item?.selectedSize || item?.size || "");
      const selectedColor = item?.colorName || item?.selectedColor || "";
      const variantColor = variant.color_name || variant.colorName || "";
      return sameSize && (!selectedColor || selectedColor === variantColor);
    }) || null
  );
}
