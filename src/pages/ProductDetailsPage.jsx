import React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import { StorefrontEmptyState, StorefrontLoadingState } from "../components/StorefrontLoadingState.jsx";
import { categories } from "../data/categories.js";
import { neutralImage as placeholderImage, resolveImageUrl, showNeutralImage } from "../utils/images.js";
import { isVariantVisible } from "../utils/productVariants.js";
import { createDefaultProductSchema, productFieldLabel } from "../data/productSchema.js";

const productText = {
  en: {
    back: "Back to products",
    type: "Product type",
    size: "Size",
    use: "Choose use",
    purchase: "Purchase",
    oneTime: "One-time purchase",
    refillPlan: "Save with refill plan",
    visualOnly: "Visual option only. Checkout remains standard.",
    addToCart: "Add to cart",
    whatYouGet: "What you get",
    usageNote: "Usage note",
    reviews: "Reviews",
    ratingLine: "4.94 ★ | 66 reviews",
    reviewed: "Verified EB Chemical review",
    how: "How it works",
    impact: "Helps reduce single-use packaging with every refill",
    safe: "Safe to use on",
    surfaceNote: "Always test on a small hidden area first and follow the product instructions.",
    formulaTitle: "Purposeful ingredients",
    formulaText:
      "Every ingredient is chosen with care. Our formula is designed to remove limescale effectively while keeping the cleaning experience simple, practical, and surface-conscious.",
    ingredients: "All ingredients",
    related: "You may also like",
    faqTitle: "Frequently Asked Questions",
    faqText: "Do you have questions about this product? Here you’ll find the most frequently asked questions.",
    productInfo: "Product information",
    from: "From",
  },
  ar: {
    back: "العودة للمنتجات",
    type: "نوع المنتج",
    size: "الحجم",
    use: "اختر الاستخدام",
    purchase: "طريقة الشراء",
    oneTime: "شراء مرة واحدة",
    refillPlan: "وفّر مع خطة إعادة التعبئة",
    visualOnly: "خيار عرض فقط. الدفع يبقى بالنظام الحالي.",
    addToCart: "أضف إلى السلة",
    whatYouGet: "ماذا تحصل",
    usageNote: "ملاحظة الاستخدام",
    reviews: "التقييمات",
    ratingLine: "4.94 ★ | 66 تقييم",
    reviewed: "تقييم موثق من EB Chemical",
    how: "طريقة الاستخدام",
    impact: "يساعد على تقليل استخدام العبوات أحادية الاستخدام مع كل إعادة تعبئة",
    safe: "آمن للاستخدام على",
    surfaceNote: "جرّبه دائمًا على منطقة صغيرة غير ظاهرة أولًا واتبع تعليمات المنتج.",
    formulaTitle: "مكونات فعّالة",
    formulaText:
      "كل مكوّن مختار بعناية. صُممت تركيبتنا لإزالة التكلسات بفعالية مع الحفاظ على تجربة تنظيف سهلة وعملية ومناسبة للأسطح.",
    ingredients: "كل المكونات",
    related: "قد يعجبك أيضًا",
    faqTitle: "الأسئلة الشائعة",
    faqText: "هل لديك أسئلة حول هذا المنتج؟ هنا ستجد أكثر الأسئلة الشائعة.",
    productInfo: "معلومات المنتج",
    from: "ابتداءً من",
  },
  he: {
    back: "חזרה למוצרים",
    type: "סוג מוצר",
    size: "מידה",
    use: "בחר שימוש",
    purchase: "רכישה",
    oneTime: "רכישה חד פעמית",
    refillPlan: "חסוך עם תוכנית מילוי",
    visualOnly: "אפשרות ויזואלית בלבד. התשלום נשאר סטנדרטי.",
    addToCart: "הוסף לסל",
    whatYouGet: "מה אתה מקבל",
    usageNote: "הערת שימוש",
    reviews: "ביקורות",
    ratingLine: "4.94 ★ | 66 ביקורות",
    reviewed: "ביקורת מאומתת של EB Chemical",
    how: "איך זה עובד",
    impact: "עוזר להפחית אריזות חד פעמיות עם כל מילוי",
    safe: "בטוח לשימוש על",
    surfaceNote: "בדוק תמיד על אזור נסתר קטן תחילה ופעל לפי הוראות המוצר.",
    formulaTitle: "מרכיבים מוכווני מטרה",
    formulaText:
      "כל מרכיב נבחר בקפידה. הנוסחה שלנו נועדה להסיר אבנית ביעילות תוך שמירה על חוויית ניקוי פשוטה, מעשית ומודעת למשטחים.",
    ingredients: "כל המרכיבים",
    related: "אולי תאהב גם",
    faqTitle: "שאלות נפוצות",
    faqText: "יש לך שאלות על מוצר זה? כאן תמצא את השאלות הנפוצות ביותר.",
    productInfo: "מידע על המוצר",
    from: "החל מ",
  },
};

function localized(value, language, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;
  return value[language] || value.en || value.ar || fallback;
}

function safeImage(image, fallback = placeholderImage) {
  return resolveImageUrl(image, fallback);
}

function normalizeProductVariants(product = {}) {
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.filter(isVariantVisible).map((variant, index) => ({
      id: variant.id || `${product.id || "product"}-variant-${index}`,
      colorName: (variant.color_name || variant.colorName || "Default").trim(),
      colorValue: variant.color_value || variant.colorValue || "",
      size: (variant.size || "500ml").trim(),
      price: Number(variant.price || 0),
      wholesalePrice: variant.wholesalePrice != null ? Number(variant.wholesalePrice) : (product.wholesalePrice != null ? Number(product.wholesalePrice) : undefined),
      stock: Math.max(0, Number(variant.stock ?? variant.stockQty ?? product.stockQty ?? 24)),
      image: variant.image_url || variant.imageUrl || variant.image || "",
      sortOrder: Number(variant.sort_order ?? variant.sortOrder ?? index),
      attributes: variant.attributes && typeof variant.attributes === "object" ? variant.attributes : {},
    }));
  }

  return (product.sizes || []).map((sizeOption, index) => ({
    id: `${product.id || "product"}-variant-${index}`,
    colorName: "Default",
    colorValue: "",
    size: (sizeOption.size || "500ml").trim(),
    price: Number(sizeOption.price || 0),
    wholesalePrice: sizeOption.wholesalePrice != null ? Number(sizeOption.wholesalePrice) : (product.wholesalePrice != null ? Number(product.wholesalePrice) : undefined),
    stock: Math.max(0, Number(product.stockQty ?? 24)),
    image: product.image || "",
    sortOrder: index,
  }));
}

function normalizeText(str) {
  return (str || "").toString().trim().toLowerCase();
}

function normalizeProductGallery(product = {}, selectedImage = "") {
  const source = product.gallery_images || product.galleryImages || [];
  const gallery = source
    .map((entry, index) => ({
      image: typeof entry === "string" ? entry : entry?.image_url || entry?.image || entry?.url || "",
      sortOrder: Number(typeof entry === "object" ? entry?.sort_order ?? entry?.sortOrder ?? index : index),
    }))
    .filter((entry) => entry.image)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((entry) => entry.image);

  return gallery.length ? gallery : [selectedImage || product.image || placeholderImage];
}

function getDetailSectionImage(detailImages = {}, ...keys) {
  for (const key of keys) {
    const value = detailImages?.[key];
    if (value) return value;
  }
  return "";
}

function ProductImage({ alt, className = "", src, ...imageProps }) {
  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      onError={(event) => {
        showNeutralImage(event);
      }}
      src={safeImage(src)}
      {...imageProps}
    />
  );
}

function SliderButton({ direction, onClick }) {
  const Icon = direction === "next" ? ChevronRight : ChevronLeft;
  return (
    <button className="detail-circle-button" onClick={onClick} type="button">
      <Icon size={22} />
    </button>
  );
}

function FloatingAddToCart({ disabled, language, onAdd, product, selectedLabel, txt }) {
  const isArabic = language === "ar";
  return (
    <aside className="product-detail-floating-cart" dir={language === "ar" || language === "he" ? "rtl" : "ltr"} aria-label={txt.addToCart}>
      <ProductImage alt={localized(product.name, language)} src={product.image} />
      <div>
        <strong>{localized(product.name, language)}</strong>
        <span>{selectedLabel}</span>
      </div>
      <button className="detail-accent-button" disabled={disabled} onClick={onAdd} type="button">
        {disabled ? "Unavailable" : txt.addToCart}
      </button>
    </aside>
  );
}

function AccordionList({ items, language }) {
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <div className="detail-accordion-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article className={isOpen ? "detail-accordion-item open" : "detail-accordion-item"} key={`${localized(item.title || item.question, language)}-${index}`}>
            <button onClick={() => setOpenIndex(isOpen ? -1 : index)} type="button">
              <span>{localized(item.title || item.question, language)}</span>
              {isOpen ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            <div className="detail-accordion-content">
              <p>{localized(item.text || item.answer, language)}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProductDetailsPage({
  currentUser,
  isLoading = false,
  language,
  loadError = "",
  onAddToCart,
  onNavigate,
  onViewProduct,
  product,
  productSchema = createDefaultProductSchema(),
  products = [],
  t,
}) {
  const txt = productText[language] || productText.en;
  const productVariants = React.useMemo(() => normalizeProductVariants(product), [product]);
  const [selectedSize, setSelectedSize] = React.useState(productVariants[0]?.size || "");
  const [selectedColor, setSelectedColor] = React.useState(productVariants[0]?.colorName || "Default");
  const [selectedVariantId, setSelectedVariantId] = React.useState(productVariants[0]?.id || "");
  const [quantity, setQuantity] = React.useState(1);
  const [selectedType, setSelectedType] = React.useState(product?.detailOptions?.productTypes?.[0]?.id || "standard");
  const [selectedUse, setSelectedUse] = React.useState(product?.detailOptions?.uses?.[0]?.id || "default");
  const [purchaseType, setPurchaseType] = React.useState("one-time");
  const [activeStep, setActiveStep] = React.useState(0);
  const [activeSurface, setActiveSurface] = React.useState(0);
  const [activeStatement, setActiveStatement] = React.useState(0);
  const [dragStart, setDragStart] = React.useState(null);
  const [parallax, setParallax] = React.useState(0);
  const [openAccordionIndex, setOpenAccordionIndex] = React.useState(null);
  const reviewsRef = React.useRef(null);
  const relatedRef = React.useRef(null);
  const impactRef = React.useRef(null);
  const galleryScrollRef = React.useRef(null);

  React.useEffect(() => {
    const nextVariants = normalizeProductVariants(product);
    setSelectedColor(nextVariants[0]?.colorName || "Default");
    setSelectedSize(nextVariants[0]?.size || "");
    setSelectedVariantId(nextVariants[0]?.id || "");
    setQuantity(1);
    setSelectedType(product?.detailOptions?.productTypes?.[0]?.id || "standard");
    setSelectedUse(product?.detailOptions?.uses?.[0]?.id || "default");
    setPurchaseType("one-time");
    setActiveStep(0);
    setActiveSurface(0);
    setActiveStatement(0);
  }, [product]);

  React.useEffect(() => {
    if (getStatements().length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveStatement((index) => (index + 1) % getStatements().length);
    }, 4000);
    return () => window.clearInterval(timer);
  });

  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || window.innerWidth <= 768) {
      setParallax(0);
      return;
    }
    function handleScroll() {
      const section = impactRef.current;
      if (!section) {
        setParallax(0);
        return;
      }
      const rect = section.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const progress = (viewportCenter - rect.top) / Math.max(rect.height, 1);
      setParallax(Math.max(-1, Math.min(1, progress * 2 - 1)));
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const availableForColor = productVariants.filter((variant) => normalizeText(variant.colorName) === normalizeText(selectedColor));
    if (availableForColor.length && !availableForColor.some((variant) => normalizeText(variant.size) === normalizeText(selectedSize))) {
      setSelectedSize(availableForColor[0].size);
    }
  }, [productVariants, selectedColor, selectedSize]);

  if (isLoading) {
    return <StorefrontLoadingState label="Loading product details" />;
  }

  if (loadError && !product) {
    return (
      <StorefrontEmptyState
        message={language === "ar" ? "يرجى تحديث الصفحة والمحاولة مرة أخرى." : language === "he" ? "אנא רענן את הדף ונסה שוב." : "Please refresh the page and try again."}
        title={language === "ar" ? "تعذر تحميل المنتج" : language === "he" ? "לא הצלחנו לטעון מוצר זה" : "We couldn't load this product"}
      />
    );
  }

  if (!product) {
    return (
      <section className="page-shell">
        <div className="empty-panel">
          <h1>{t("productDetails.notFoundTitle")}</h1>
          <p>{t("productDetails.notFoundText")}</p>
          <button className="primary-action" onClick={() => onNavigate("products")}>
            {t("common.backToProducts")}
          </button>
        </div>
      </section>
    );
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const colorOptions = Array.from(new Map(productVariants.map((variant) => [normalizeText(variant.colorName), variant])).values());
  const sizeOptions = productVariants.filter((variant) => normalizeText(variant.colorName) === normalizeText(selectedColor));
  const selectedVariant =
    productVariants.find((variant) => variant.id === selectedVariantId) ||
    sizeOptions.find((variant) => normalizeText(variant.size) === normalizeText(selectedSize)) ||
    sizeOptions[0] ||
    productVariants[0];
  const isTrader = currentUser?.accountType === "trader" || currentUser?.accountType === "wholesale";
  const wholesalePrice = isTrader
    ? (selectedVariant?.wholesalePrice != null && Number(selectedVariant.wholesalePrice) > 0
        ? Number(selectedVariant.wholesalePrice)
        : (product?.wholesalePrice != null && Number(product.wholesalePrice) > 0
            ? Number(product.wholesalePrice)
            : null))
    : null;
  const selectedOption = selectedVariant
    ? { size: selectedVariant.size, price: selectedVariant.price, wholesalePrice }
    : { size: "", price: 0, wholesalePrice: null };
  const typeOptions = product.detailOptions?.productTypes || [
    { id: "standard", label: { en: "Standard bottle", ar: "العبوة الأساسية" }, image: product.image },
  ];
  const selectedTypeOption = typeOptions.find((item) => item.id === selectedType) || typeOptions[0];
  const useOptions = product.detailOptions?.uses || [
    { id: "daily", label: { en: "Daily use", ar: "استخدام يومي" } },
  ];
  const selectedUseOption = useOptions.find((item) => item.id === selectedUse) || useOptions[0];
  const selectedColorImage = sizeOptions.find((variant) => variant.image)?.image;
  const detailImages = {
    ...(product?.detail_section_images || {}),
    ...(product?.detailSectionImages || {}),
  };
  const detailMainImage =
    product?.detailMainImage ||
    product?.detail_main_image ||
    getDetailSectionImage(detailImages, "mainImage", "main_image");
  const practicalBannerImage = getDetailSectionImage(
    detailImages,
    "practicalBanner",
    "practical_banner",
    "bannerStatements",
    "banner_statements",
    "statementBanner",
    "statement_banner"
  );
  const ingredientsImage = getDetailSectionImage(
    detailImages,
    "ingredients",
    "ingredientsImage",
    "ingredients_image"
  );
  const faqImage = getDetailSectionImage(detailImages, "faq", "faqImage", "faq_image");
  const getHowItWorksImage = (stepNumber) =>
    getDetailSectionImage(
      detailImages,
      `howItWorks${stepNumber}`,
      `how_it_works_${stepNumber}`,
      `how_it_works${stepNumber}`,
      "howItWorks",
      "how_it_works"
    );
  const selectedImage =
    detailMainImage ||
    selectedVariant?.image ||
    selectedColorImage ||
    selectedTypeOption?.image ||
    product.image ||
    product.hoverImage ||
    placeholderImage;
  const productName = localized(product.name, language, product.slug);
  const description = localized(
    product.longDescription,
    language,
    localized(product.shortDescription, language, "")
  );
  const features = localized(product.features, language, []);
  const uniqueGallery = [
    selectedImage,
    selectedVariant?.image,
    selectedColorImage,
    product.image,
    ...normalizeProductGallery(product, selectedImage),
  ].filter((image, index, images) => image && images.indexOf(image) === index);
  const staticGalleryImage = uniqueGallery[0] || selectedImage || product.image || placeholderImage;
  const reviews = product.reviews || getFallbackReviews();
  const steps = product.usageSteps || getFallbackSteps();
  const safeSurfaces = product.safeSurfaces || getFallbackSurfaces();
  const statements = getStatements();
  const faqItems = product.faq || getFallbackFaq();
  const productInfo = product.productInfo || getFallbackInfo();
  const relatedProducts = getRelatedProducts();
  const floatingLabel = selectedVariant
    ? `${selectedColor !== "Default" ? `${selectedColor} / ` : ""}${selectedOption.size}`
    : "Unavailable";
  const enabledVariantAttributes = productSchema.variantAttributes.filter((field) => field.enabled !== false && field.storefrontVisible !== false);
  const hasVariantAttribute = (key) => enabledVariantAttributes.some((field) => field.key === key);
  const customVariantAttributes = enabledVariantAttributes.filter((field) => !["color_name", "color_value", "size"].includes(field.key));
  const showcaseVisible = (key) => productSchema.showcaseSections.some((section) => section.key === key && section.enabled !== false && section.storefrontVisible !== false);
  const storefrontMediaVisible = (key) => productSchema.mediaFields.some((field) => field.key === key && field.enabled !== false && field.storefrontVisible === true);
  const fieldValue = (field) => {
    const directValues = {
      shortDescription: localized(product.shortDescription, language),
      shortDescriptionAr: localized(product.shortDescription, language),
      fullDescription: localized(product.longDescription, language),
      fullDescriptionAr: localized(product.longDescription, language),
    };
    if (Object.prototype.hasOwnProperty.call(directValues, field.key)) return directValues[field.key];
    const value = product[field.key] ?? product.customFields?.[field.key];
    return value && typeof value === "object" && !Array.isArray(value) ? localized(value, language) : value;
  };
  const displaySchemaValue = (field, value) => {
    const optionLabel = (entry) => field.options?.find((option) => option.value === entry)?.label?.[language]
      || field.options?.find((option) => option.value === entry)?.label?.en
      || entry;
    if (Array.isArray(value)) return value.map(optionLabel).join(", ");
    if (["select", "multi_select"].includes(field.type)) return optionLabel(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };
  const storefrontFields = productSchema.fields
    .filter((field) => field.enabled !== false && field.storefrontVisible === true)
    .filter((field) => !["nameEn", "nameAr", "brand", "label", "labelAr", "shortDescriptionAr", "fullDescriptionAr"].includes(field.key))
    .map((field) => ({ field, value: fieldValue(field) }))
    .filter(({ value }) => Array.isArray(value) ? value.length : value !== null && value !== undefined && value !== "" && value !== false);
  const builtInMediaKeys = new Set(["image", "hoverImage", "videoUrl", "galleryImages", "detailStatements", "dsiHowItWorks1", "dsiHowItWorks2", "dsiHowItWorks3", "dsiImpact1", "dsiImpact2", "dsiSafeToUse", "dsiPracticalBanner", "dsiIngredients", "dsiFaq"]);
  const storefrontDetails = [
    ...storefrontFields,
    ...productSchema.mediaFields
      .filter((field) => field.enabled !== false && field.storefrontVisible === true && !builtInMediaKeys.has(field.key))
      .map((field) => ({ field, value: product.customMedia?.[field.key] }))
      .filter(({ value }) => value !== null && value !== undefined && value !== ""),
  ];
  const dynamicShowcaseSections = productSchema.showcaseSections
    .filter((section) => section.enabled !== false && section.storefrontVisible !== false && section.fields?.length)
    .map((section) => ({
      ...section,
      values: section.fields
        .filter((field) => field.enabled !== false && field.storefrontVisible !== false)
        .map((field) => ({ field, value: product.customShowcase?.[section.key]?.[field.key] }))
        .filter(({ value }) => Array.isArray(value) ? value.length : value !== null && value !== undefined && value !== "" && value !== false),
    }))
    .filter((section) => section.values.length);

  function getStatements() {
    const customStatements = product.detailStatements || product.detail_statements;
    if (customStatements?.length) {
      return customStatements.map((s) => (typeof s === "string" ? s : localized(s, language)));
    }
    return localized(product?.statements, language, [
      language === "ar"
        ? "منتج عملي مصمم لتنظيف فعّال وسهولة استخدام يومية."
        : language === "he"
          ? "מוצר מעשי המיועד לניקוי יעיל וקלות שימוש יומיומית."
          : "A practical product designed for effective cleaning and everyday ease of use.",
    ]);
  }

  function getRelatedProducts() {
    const sameCategory = products.filter((item) => item.categoryId === product.categoryId && item.id !== product.id);
    const rest = products.filter((item) => item.categoryId !== product.categoryId && item.id !== product.id);
    return [...sameCategory, ...rest].slice(0, 8);
  }

  function getFallbackReviews() {
    return [
      {
        rating: 5,
        title: { en: "Great product", ar: "منتج ممتاز" },
        text: {
          en: "Easy to use and leaves the surface clean with a fresh finish.",
          ar: "سهل الاستخدام ويترك السطح نظيفًا بلمسة منعشة.",
        },
        customerName: { en: "EB Customer", ar: "عميل EB" },
      },
    ];
  }

  function getFallbackSteps() {
    return [
      { title: { en: "Apply the product", ar: "ضع المنتج" }, image: product.hoverImage || product.image },
      { title: { en: "Wipe the surface", ar: "امسح السطح" }, image: product.image },
      { title: { en: "Enjoy a clean result", ar: "استمتع بنتيجة نظيفة" }, image: product.hoverImage || product.image },
    ];
  }

  function getFallbackSurfaces() {
    return [
      {
        id: "general",
        label: { en: "Suitable surfaces", ar: "الأسطح المناسبة" },
        tags: { en: ["Washable surfaces", "Tiles", "Metal"], ar: ["الأسطح القابلة للغسل", "البلاط", "المعادن"] },
      },
    ];
  }

  function getFallbackFaq() {
    return [
      {
        question: { en: "How do I use this product?", ar: "كيف أستخدم هذا المنتج؟" },
        answer: {
          en: "Follow the product instructions, test on a hidden area first, then rinse or wipe as recommended.",
          ar: "اتبع تعليمات المنتج، جرّبه على منطقة مخفية أولًا، ثم اشطف أو امسح حسب التوصية.",
        },
      },
    ];
  }

  function getFallbackInfo() {
    return [
      {
        title: { en: "Usage instructions", ar: "طريقة الاستخدام" },
        text: {
          en: "Apply as directed and test on a small hidden area first.",
          ar: "استخدمه حسب التعليمات وجرّبه على منطقة صغيرة غير ظاهرة أولًا.",
        },
      },
    ];
  }

  function handleAddSelectedToCart() {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      return;
    }

    const effectiveVariant = {
      ...selectedVariant,
      price: selectedOption.wholesalePrice ?? selectedVariant.price,
    };

    for (let count = 0; count < quantity; count += 1) {
      onAddToCart(product, selectedOption.size, effectiveVariant);
    }
  }

  function scrollTrack(ref, direction) {
    const track = ref.current;
    if (!track) return;
    const amount = track.clientWidth * 0.82;
    track.scrollBy({ left: direction * amount * (language === "ar" || language === "he" ? -1 : 1), behavior: "smooth" });
  }

  function handleStatementDragEnd(clientX) {
    if (dragStart === null) return;
    const delta = clientX - dragStart;
    if (Math.abs(delta) > 48) {
      setActiveStatement((current) =>
        delta > 0
          ? (current - 1 + statements.length) % statements.length
          : (current + 1) % statements.length
      );
    }
    setDragStart(null);
  }

  return (
    <main className="product-detail-redesign">
      <section className="detail-kinfill-hero">
        <div className="detail-kinfill-media">
          {product.badge && <span className="detail-subscribe-badge">{localized(product.badge, language)}</span>}
          <div className="detail-kinfill-main-column">
            <div className="detail-kinfill-main-sticky">
              <img
                className="current-product-image"
                alt={productName}
                decoding="async"
                fetchPriority="high"
                loading="eager"
                src={safeImage(selectedImage)}
                onError={showNeutralImage}
              />
            </div>
          </div>

          <div className="detail-kinfill-gallery-column" ref={galleryScrollRef}>
            {uniqueGallery.slice(1).map((image, index) => (
              <picture className="detail-kinfill-gallery-picture" key={image || index}>
                <img
                  className="detail-kinfill-gallery-image"
                  alt={`${productName} ${index + 2}`}
                  decoding="async"
                  loading="lazy"
                  src={safeImage(image)}
                  onError={showNeutralImage}
                />
              </picture>
            ))}
          </div>
        </div>

        <aside className="detail-purchase-panel product-detail-info-panel">
          <div className="pi-section-header">
            <button className="pi-back" onClick={() => onNavigate("products")} type="button">
              {txt.back}
            </button>
            {product.badge && <span className="pi-badge">{localized(product.badge, language)}</span>}
            <p className="pi-eyebrow">{localized(category?.name, language)}</p>
            <h1>{productName}</h1>
            <p className="pi-desc">{description}</p>
            <div className="pi-rating">
              <span>★★★★★</span>
              <span>{txt.ratingLine}</span>
            </div>
          </div>

          {typeOptions.length > 0 && (
            <div className="pi-card-field">
              <p className="pi-label">{txt.type}</p>
              <div className="pi-card-grid two-col">
                {typeOptions.map((option) => (
                  <button
                    className={selectedType === option.id ? "pi-card active" : "pi-card"}
                    key={option.id}
                    onClick={() => setSelectedType(option.id)}
                    type="button"
                  >
                    <ProductImage alt={localized(option.label, language)} src={option.image || product.image} />
                    <span>{localized(option.label, language)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pi-segmented">
            <button
              className={purchaseType === "one-time" ? "pi-segment active" : "pi-segment"}
              onClick={() => setPurchaseType("one-time")}
              type="button"
            >
              {txt.oneTime}
            </button>
            <button
              className={purchaseType === "refill" ? "pi-segment active" : "pi-segment"}
              onClick={() => setPurchaseType("refill")}
              type="button"
            >
              {txt.refillPlan}
            </button>
          </div>

          {hasVariantAttribute("color_name") && colorOptions.length > 1 && (
            <div className="pi-color-field">
              <p className="pi-label">{language === "ar" ? "اللون" : language === "he" ? "צבע" : "Color"}</p>
              <div className="pi-color-card">
                <ProductImage alt="" src={selectedImage} />
                <div>
                  <p>{language === "ar" ? "اختر اللون" : language === "he" ? "בחר את הצבע שלך" : "Choose your Color"}</p>
                  <div className="pi-color-swatches">
                    {colorOptions.map((option) => (
                      <button
                        className={selectedColor === option.colorName ? "pi-color-swatch active" : "pi-color-swatch"}
                        key={option.colorName}
                        onClick={() => { setSelectedColor(option.colorName); setSelectedSize(option.size); setSelectedVariantId(option.id); }}
                        style={{ background: option.colorValue || "#1db7d8" }}
                        title={option.colorName}
                        type="button"
                      />
                    ))}
                  </div>
                  <span className="pi-color-name">{selectedColor}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pi-pill-grid">
            {hasVariantAttribute("size") && <div>
              <p className="pi-label">{txt.size}</p>
              <div className="pi-pill-row">
                {sizeOptions.map((option) => (
                  <button
                    className={selectedSize === option.size ? "pi-pill active" : "pi-pill"}
                    disabled={option.stock <= 0}
                    key={option.size}
                    onClick={() => { setSelectedSize(option.size); setSelectedVariantId(option.id); }}
                    type="button"
                  >
                    {option.size}
                    {option.stock <= 0 ? ` ${language === "ar" ? "(غير متوفر)" : language === "he" ? "(אזל)" : "(Out)"}` : ""}
                  </button>
                ))}
              </div>
            </div>}
            <div>
              <p className="pi-label">{txt.use}</p>
              <div className="pi-pill-row">
                {useOptions.map((option) => (
                  <button
                    className={selectedUse === option.id ? "pi-pill active" : "pi-pill"}
                    key={option.id}
                    onClick={() => setSelectedUse(option.id)}
                    type="button"
                  >
                    {localized(option.label, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {customVariantAttributes.map((field) => {
            const options = Array.from(new Map(productVariants.map((variant) => [variant.attributes?.[field.key], variant])).values()).filter((variant) => variant.attributes?.[field.key] !== undefined && variant.attributes?.[field.key] !== "");
            if (!options.length) return null;
            return (
              <div className="pi-pill-grid" key={field.key}>
                <div>
                  <p className="pi-label">{productFieldLabel(field, language)}</p>
                  <div className="pi-pill-row">{options.map((variant) => <button className={selectedVariant?.id === variant.id ? "pi-pill active" : "pi-pill"} key={variant.id} onClick={() => { setSelectedVariantId(variant.id); setSelectedColor(variant.colorName); setSelectedSize(variant.size); }} type="button">{String(variant.attributes[field.key])}</button>)}</div>
                </div>
              </div>
            );
          })}

          <div className="pi-cta-bar">
            <div className="pi-price">
              {selectedOption.wholesalePrice ? (
                <><del>{selectedOption.price} {t("common.ils")}</del> {selectedOption.wholesalePrice} {t("common.ils")}</>
              ) : (
                <>{selectedOption.price} {t("common.ils")}</>
              )}
            </div>
            <div className="pi-qty-row">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((value) => value + 1)} type="button">+</button>
            </div>
            <button className="pi-add-btn" disabled={!selectedVariant || selectedVariant.stock <= 0} onClick={handleAddSelectedToCart} type="button">
              <ShoppingBag size={18} />
              {selectedVariant ? txt.addToCart : "Unavailable"}
            </button>
          </div>

          <div className="pi-accordion">
            {features.length > 0 && (
              <div className={openAccordionIndex === 0 ? "pi-accordion-item open" : "pi-accordion-item"}>
                <button className="pi-accordion-trigger" onClick={() => setOpenAccordionIndex(openAccordionIndex === 0 ? null : 0)} type="button">
                  <span>{txt.whatYouGet}</span>
                  <span className="pi-accordion-icon">+</span>
                </button>
                <div className="pi-accordion-body">
                  <div className="pi-accordion-inner">
                    <ul className="pi-feature-list">
                      {features.slice(0, 5).map((feature) => (
                        <li key={feature}><CheckCircle2 size={15} /> {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {product.usageNotes && (
              <div className={openAccordionIndex === 1 ? "pi-accordion-item open" : "pi-accordion-item"}>
                <button className="pi-accordion-trigger" onClick={() => setOpenAccordionIndex(openAccordionIndex === 1 ? null : 1)} type="button">
                  <span>{txt.usageNote}</span>
                  <span className="pi-accordion-icon">+</span>
                </button>
                <div className="pi-accordion-body">
                  <div className="pi-accordion-inner">
                    <p>{localized(product.usageNotes, language)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="detail-reviews-section">
        <div className="detail-section-title center">
          <h2>{txt.reviews}</h2>
          <p>{txt.ratingLine}</p>
        </div>
        <div className="detail-slider-shell">
          <SliderButton direction="prev" onClick={() => scrollTrack(reviewsRef, -1)} />
          <div className="detail-reviews-track" ref={reviewsRef}>
            {reviews.map((review, index) => (
              <article className="detail-review-card" key={`${localized(review.title, language)}-${index}`}>
                <div className="detail-stars">{Array.from({ length: review.rating || 5 }).map((_, star) => <Star fill="currentColor" key={star} size={18} />)}</div>
                <h3>{localized(review.title, language)}</h3>
                <p>{localized(review.text, language)}</p>
                <strong>{localized(review.customerName, language)} <CheckCircle2 size={16} /></strong>
                <span>{txt.reviewed}</span>
              </article>
            ))}
          </div>
          <SliderButton direction="next" onClick={() => scrollTrack(reviewsRef, 1)} />
        </div>
      </section>

      {showcaseVisible("how_it_works") && <section className="detail-how-section">
        <div className="detail-how-copy">
          <h2>{txt.how}</h2>
          <div className="detail-step-line">
            <span>{activeStep + 1}</span>
            <strong>{localized(steps[activeStep]?.title, language)}</strong>
          </div>
          <button className="detail-next-step" onClick={() => setActiveStep((activeStep + 1) % steps.length)} type="button">
            {language === "ar" ? <ChevronLeft size={34} /> : language === "he" ? <ChevronLeft size={34} /> : <ChevronRight size={34} />}
          </button>
          <div className="detail-step-thumbs">
            {steps.map((step, index) => (
              <button className={activeStep === index ? "active" : ""} key={`${localized(step.title, language)}-${index}`} onClick={() => setActiveStep(index)} type="button">
                <ProductImage alt={localized(step.title, language)} src={getHowItWorksImage(index + 1) || step.image || product.image || placeholderImage} />
              </button>
            ))}
          </div>
        </div>
        <figure className="detail-how-image">
          <ProductImage alt={localized(steps[activeStep]?.title, language)} src={getHowItWorksImage(activeStep + 1) || steps[activeStep]?.image || product.image || placeholderImage} />
        </figure>
      </section>}

      {showcaseVisible("impact") && <section className="detail-impact-section" ref={impactRef}>
        <h2>{txt.impact}</h2>
        <div className="detail-impact-images">
          <ProductImage
            alt={productName}
            className="impact-left"
            src={detailImages.impact1 || detailImages.impact || product.image}
            style={{ transform: `translateY(${parallax * 40}px) rotate(-6deg)` }}
          />
          <ProductImage
            alt={productName}
            className="impact-right"
            src={detailImages.impact2 || detailImages.impact || product.hoverImage || product.image}
            style={{ transform: `translateY(${parallax * -40}px) rotate(6deg)` }}
          />
        </div>
      </section>}

      {showcaseVisible("safe_to_use") && <section className="detail-safe-section">
        <figure>
          <ProductImage alt={productName} src={detailImages.safeToUse || product.hoverImage || product.image} />
        </figure>
        <div className="detail-safe-copy">
          <h2>{txt.safe}</h2>
          <div className="detail-surface-tabs">
            {safeSurfaces.map((surface, index) => (
              <button className={activeSurface === index ? "active" : ""} key={surface.id || index} onClick={() => setActiveSurface(index)} type="button">
                {localized(surface.label, language)}
              </button>
            ))}
          </div>
          <div className="detail-surface-tags">
            {localized(safeSurfaces[activeSurface]?.tags, language, []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p className="detail-safety-note">
            {localized(safeSurfaces[activeSurface]?.note, language, txt.surfaceNote)}
          </p>
        </div>
      </section>}

      {storefrontMediaVisible("detailStatements") && <section
        className="detail-statement-carousel"
        onMouseDown={(event) => setDragStart(event.clientX)}
        onMouseUp={(event) => handleStatementDragEnd(event.clientX)}
        onTouchEnd={(event) => handleStatementDragEnd(event.changedTouches[0]?.clientX || 0)}
        onTouchStart={(event) => setDragStart(event.touches[0]?.clientX || 0)}
      >
        <ProductImage alt={productName} src={practicalBannerImage || product.hoverImage || product.image || placeholderImage} />
        <div className="detail-statement-track" style={{ transform: `translateX(${language === "ar" || language === "he" ? activeStatement * 100 : activeStatement * -100}%)` }}>
          {statements.map((statement, index) => (
            <h2 key={`${statement}-${index}`}>{statement}</h2>
          ))}
        </div>
        <div className="detail-statement-dots">
          {statements.map((statement, index) => (
            <button aria-label={statement} className={activeStatement === index ? "active" : ""} key={`${statement}-dot`} onClick={() => setActiveStatement(index)} type="button" />
          ))}
        </div>
      </section>}

      {showcaseVisible("ingredients") && <section className="detail-formula-section">
        <div>
          <h2>{txt.formulaTitle}</h2>
          <p>{txt.formulaText}</p>
          <button className="detail-light-button" type="button">{txt.ingredients}</button>
        </div>
        <figure>
          <ProductImage alt={productName} src={ingredientsImage || product.image || placeholderImage} />
        </figure>
      </section>}

      {dynamicShowcaseSections.map((section) => (
        <section className="detail-schema-showcase-section" key={section.key}>
          <h2>{section.title?.[language] || section.title?.en || section.key}</h2>
          <dl className="detail-schema-fields">
            {section.values.map(({ field, value }) => <div key={field.key}><dt>{productFieldLabel(field, language)}</dt><dd>{field.type === "image_url" ? <ProductImage alt={productFieldLabel(field, language)} src={value} /> : displaySchemaValue(field, value)}</dd></div>)}
          </dl>
        </section>
      ))}

      {relatedProducts.length > 0 && (
        <section className="detail-related-section">
          <div className="detail-section-title split">
            <h2>{txt.related}</h2>
            <div>
              <SliderButton direction="prev" onClick={() => scrollTrack(relatedRef, -1)} />
              <SliderButton direction="next" onClick={() => scrollTrack(relatedRef, 1)} />
            </div>
          </div>
          <div className="detail-related-track" ref={relatedRef}>
            {relatedProducts.map((item) => {
              const mainImage = item.image || placeholderImage;
              const hoverImage = item.hoverImage || item.secondaryImage || item.galleryImages?.[1] || mainImage;
              return (
                <article className="detail-related-card" key={item.id}>
                  <button className="detail-related-image" onClick={() => onViewProduct(item.slug)} type="button">
                    {item.badge && <span>{localized(item.badge, language)}</span>}
                    <ProductImage alt={localized(item.name, language)} className="related-main" src={mainImage} />
                    <ProductImage alt="" className="related-hover" src={hoverImage} />
                  </button>
                  <button className="detail-related-name" onClick={() => onViewProduct(item.slug)} type="button">
                    {localized(item.name, language)}
                  </button>
                  <p>{localized(item.shortDescription, language)}</p>
                  <strong>{txt.from} {item.sizes?.[0]?.price} {t("common.ils")}</strong>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {showcaseVisible("faq") && <section className="detail-faq-section">
        <figure>
          <ProductImage alt={productName} src={faqImage || product.hoverImage || product.image || placeholderImage} />
        </figure>
        <div>
          <h2>{txt.faqTitle}</h2>
          <p>{txt.faqText}</p>
          <AccordionList items={faqItems} language={language} />
          <h3>{txt.productInfo}</h3>
          <AccordionList items={productInfo} language={language} />
        </div>
      </section>}

      {storefrontDetails.length > 0 && (
        <section className="detail-schema-fields-section">
          <div className="detail-section-title center"><h2>{txt.productInfo}</h2></div>
          <dl className="detail-schema-fields">
            {storefrontDetails.map(({ field, value }) => (
              <div key={field.key}>
                <dt>{productFieldLabel(field, language)}</dt>
                <dd>{field.type === "image_url" ? <ProductImage alt={productFieldLabel(field, language)} src={value} /> : displaySchemaValue(field, value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <FloatingAddToCart disabled={!selectedVariant || selectedVariant.stock <= 0} language={language} onAdd={handleAddSelectedToCart} product={product} selectedLabel={floatingLabel} txt={txt} />
    </main>
  );
}

export default ProductDetailsPage;
