import React, { useRef } from "react";
import { StorefrontEmptyState, StorefrontLoadingState } from "../components/StorefrontLoadingState.jsx";
import { brand } from "../data/brand.js";
import { categories } from "../data/categories.js";
import { getWebsiteMediaImage } from "../data/websiteMedia.js";
import { neutralImage, resolveImageUrl, showNeutralImage } from "../utils/images.js";
import { isVariantVisible } from "../utils/productVariants.js";

const INSTAGRAM_URL = "https://www.instagram.com/eb_chemical";

function getLocalized(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

function getPromotedProducts(products) {
  const promoted = products.filter((product) => {
    const badgeText = `${getLocalized(product.badge, "en")} ${getLocalized(product.badge, "ar")}`.toLowerCase();
    return (
      product.featured ||
      product.offer ||
      product.bestSeller ||
      product.discount ||
      product.salesCount > 0 ||
      badgeText.includes("best") ||
      badgeText.includes("new") ||
      badgeText.includes("gloss") ||
      badgeText.includes("fresh") ||
      badgeText.includes("الأكثر")
    );
  });

  const seen = new Set();
  return [...promoted, ...products]
    .filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    })
    .slice(0, 10);
}

function isIsolatedProductImage(src = "") {
  return /\.svg(?:\?|$)/i.test(src) || src.includes("/images/products/");
}

function normalizeHomeProductVariants(product = {}) {
  if (!Array.isArray(product?.variants) || !product.variants.length) return [];

  return product.variants.filter(isVariantVisible).map((variant, index) => ({
    id: variant.id || `${product.id || product.slug || "product"}-variant-${index}`,
    colorName: (variant.color_name || variant.colorName || "Default").trim(),
    colorValue: variant.color_value || variant.colorValue || "",
    size: (variant.size || product.sizes?.[0]?.size || "500ml").trim(),
    price: Number(variant.price || product.sizes?.[0]?.price || 0),
    stock: Math.max(0, Number(variant.stock ?? variant.stockQty ?? product.stockQty ?? 24)),
    image: variant.image_url || variant.imageUrl || variant.image || "",
    sortOrder: Number(variant.sort_order ?? variant.sortOrder ?? index),
  }));
}

function normalizeText(str) {
  return (str || "").toString().trim().toLowerCase();
}

function HomeCommunityGallery({ galleryImages = [], language }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const images = galleryImages.filter(Boolean).slice(0, 4);

  if (!images.length) return null;

  return (
    <section className="home-community-section" aria-labelledby="home-community-title">
      <div className="home-community-inner">
        <div className="home-community-heading">
          <h2 id="home-community-title">{localized("Welcome to our community", "مرحبًا بك في مجتمعنا", "ברוכים הבאים לקהילה שלנו")}</h2>
          <p>{localized("So nice to have you here - tag us @ebchemical", "كم يسعدنا وجودك معنا - أشرنا لنا @ebchemical", "כיף שאתם כאן - תייגו אותנו @ebchemical")}</p>
        </div>

        <div className="home-community-gallery" aria-label="EB Chemical community gallery">
          {images.map((image, index) => (
            <a
              aria-label="EB Chemical on Instagram"
              className={`home-community-card home-community-card-${index + 1}`}
              href={INSTAGRAM_URL}
              key={`${image}-${index}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt="EB Chemical community"
                loading="lazy"
                onError={(event) => {
                  showNeutralImage(event);
                }}
                src={image}
              />
              <span className="home-community-card-meta">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <rect height="18" rx="5" width="18" x="3" y="3" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1.4" />
                </svg>
                <span>@eb_chemical</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShowcaseSlider({ language, onViewProduct, products, title, variant = "primary" }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const trackRef = useRef(null);
  const isArabic = language === "ar";
  const [progress, setProgress] = React.useState(0);
  const badgeLabels = localized(
    ["Limited Edition", "Subscribe & Save 50%", "Best seller", "New arrival"],
    ["إصدار محدود", "عرض خاص", "الأكثر مبيعًا", "جديد"],
    ["מהדורה מוגבלת", "הירשם וחסוך 50%", "רב מכר", "חדש"],
  );

  function updateProgress() {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const currentScroll = Math.abs(track.scrollLeft);
    setProgress(maxScroll > 0 ? Math.min(1, Math.max(0, currentScroll / maxScroll)) : 1);
  }

  function scrollSlider(direction) {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector(".home-product-slide-card");
    const distance = card ? card.getBoundingClientRect().width + 18 : track.clientWidth * 0.85;
    track.scrollBy({
      left: (isArabic ? -direction : direction) * distance,
      behavior: "smooth",
    });
  }

  if (!products.length) return null;

  return (
    <section className={`home-product-showcase home-product-showcase-${variant} storefront-wide-section`}>
      <div className="home-product-showcase-head">
        <h2>{title}</h2>
        <div className="home-product-slider-controls" aria-label={localized("Product slider controls", "التحكم بالمنتجات", "בקרות גלריית מוצרים")}>
          <button
            aria-label={localized("Previous", "السابق", "הקודם")}
            onClick={() => scrollSlider(-1)}
            type="button"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            aria-label={localized("Next", "التالي", "הבא")}
            onClick={() => scrollSlider(1)}
            type="button"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div className="home-product-slider-track" onScroll={updateProgress} ref={trackRef}>
        {products.map((product, index) => {
          const firstSize = product.sizes?.[0] || { size: "", price: 0 };
          const category = categories.find((item) => item.id === product.categoryId);
          const mainImage = resolveImageUrl(product.image, product.fallbackImage);
          const hoverImage =
            product.hoverImage ||
            product.secondaryImage ||
            product.gallery?.[1] ||
            product.images?.[1] ||
            mainImage;
          const hasHoverImage = hoverImage && hoverImage !== mainImage;
          const label = getLocalized(product.badge, language) || badgeLabels[index % badgeLabels.length];
          const details =
            getLocalized(product.shortDescription, language) ||
            getLocalized(category?.name, language) ||
            localized("A practical daily-care solution.", "حل عملي للعناية اليومية.", "פתרון מעשי לטיפול יומיומי.");

          return (
            <article
              className="home-product-slide-card"
              key={product.id}
              style={{ "--stagger": `${index * 70}ms` }}
            >
              <button
                className="home-product-image-wrap"
                onClick={() => onViewProduct(product.slug)}
                type="button"
              >
                <span className="home-product-badge">{label}</span>
                <img
                  className={`home-product-image-main ${
                    isIsolatedProductImage(mainImage) ? "home-product-image-isolated" : "home-product-image-scene"
                  }`}
                  alt={getLocalized(product.name, language)}
                  loading="lazy"
                  onError={(event) => {
                    showNeutralImage(event);
                  }}
                  src={mainImage}
                />
                {hasHoverImage && (
                  <img
                    aria-hidden="true"
                    alt=""
                    className={`home-product-image-hover ${
                      isIsolatedProductImage(hoverImage) ? "home-product-image-isolated" : "home-product-image-scene"
                    }`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    src={hoverImage}
                  />
                )}
              </button>
              <button className="home-product-slide-copy" onClick={() => onViewProduct(product.slug)} type="button">
                <strong>{getLocalized(product.name, language)}</strong>
                <span>{details}</span>
                <b>
                  {localized("From", "من", "מ")} {firstSize.price} {localized("ILS", "شيكل", "ש\"ח")}
                </b>
              </button>
            </article>
          );
        })}
      </div>

      <div className="home-product-slider-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(progress, 0.18)})` }} />
      </div>
    </section>
  );
}

function HowItWorksSplit({ image, language, onNavigate }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const isArabic = language === "ar";
  const steps = localized(
    [
      { title: "Choose the right product", text: "Select the product for your use case: home, car care, fragrances, or radiator water." },
      { title: "Use it with ease", text: "EB Chemical products are designed to be practical, clear, and suitable for daily use." },
      { title: "Get a better result", text: "Enjoy visible cleanliness, a fresh scent, and a more organized care routine." },
    ],
    [
      { title: "اختر المنتج المناسب", text: "حدد المنتج حسب نوع الاستخدام: المنزل، السيارة، المعطرات، أو ماء الرديتر." },
      { title: "استخدمه بطريقة عملية", text: "منتجات EB Chemical مصممة لتكون سهلة الاستخدام وتناسب الاستخدام اليومي." },
      { title: "احصل على نتيجة أفضل", text: "استمتع بنظافة واضحة، رائحة منعشة، وتجربة عناية أكثر ترتيبًا." },
    ],
    [
      { title: "בחר את המוצר המתאים", text: "בחר את המוצר לפי סוג השימוש: בית, רכב, ניחוחות או מי רדיאטור." },
      { title: "השתמש בקלות", text: "מוצרי EB Chemical מעוצבים להיות פרקטיים, ברורים ומתאימים לשימוש יומיומי." },
      { title: "קבל תוצאה טובה יותר", text: "תהנה מניקיון גלוי, ריח רענן ושגרת טיפול מאורגנת יותר." },
    ],
  );

  return (
    <section className="how-it-works-section storefront-wide-section">
      <div className="how-it-works-inner">
        {/* Single background image covering the entire section */}
        {image && (
          <img
            alt=""
            className="how-it-works-bg"
            src={image}
            loading="lazy"
          />
        )}

        {/* Glass panel on the right - like Kinfill's frosted glass card */}
        {image && (
          <div className="how-it-works-glass-panel" aria-hidden="true" />
        )}

        {/* Left-side gradient for steps readability */}
        <div className="how-it-works-overlay" aria-hidden="true" />

        {/* Content overlaid on background */}
        <div className="how-it-works-grid">
          {/* Steps - left side */}
          <div className="how-it-works-steps">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Title + button - right side */}
          <div className="how-it-works-card">
            <p className="eyebrow">{localized("How it works", "طريقة الاستخدام", "איך זה עובד")}</p>
            <h2>{localized("Easier cleaning in simple steps", "تنظيف أسهل بخطوات بسيطة", "ניקוי קל יותר בצעדים פשוטים")}</h2>
            <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
              {localized("Start shopping", "ابدأ التسوق", "התחל לקנות")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const fallbackSystemCards = [
  {
    key: "home",
    image: neutralImage,
    label: { en: "Home care", ar: "العناية بالمنزل", he: "טיפוח בית" },
    title: { en: "Daily cleaning made easier", ar: "تنظيف يومي أسهل", he: "ניקוי יומיומי קל יותר" },
  },
  {
    key: "car",
    image: neutralImage,
    label: { en: "Car care", ar: "العناية بالسيارة", he: "טיפוח רכב" },
    title: { en: "Fresh finish for every ride", ar: "لمسة نظيفة لكل رحلة", he: "גימור רענן לכל נסיעה" },
  },
  {
    key: "kitchen",
    image: neutralImage,
    label: { en: "Kitchen", ar: "المطبخ", he: "מטבח" },
    title: { en: "Cuts grease with less effort", ar: "إزالة الدهون بجهد أقل", he: "מסיר שומן בפחות מאמץ" },
  },
  {
    key: "bathroom",
    image: neutralImage,
    label: { en: "Bathroom", ar: "الحمام", he: "אמבטיה" },
    title: { en: "Shine for sinks and tiles", ar: "لمعان للأحواض والبلاط", he: "ברק לכיורים ואריחים" },
  },
  {
    key: "laundry",
    image: neutralImage,
    label: { en: "Laundry", ar: "الغسيل", he: "כביסה" },
    title: { en: "Care for fabrics every day", ar: "عناية يومية بالأقمشة", he: "טיפול יומיומי בבדים" },
  },
];

function CleaningSystemShowcase({ categoryCards = [], language }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const isArabic = language === "ar";
  const trackRef = useRef(null);
  const words = localized(
    ["home care", "car care", "kitchen", "bathroom", "laundry"],
    ["العناية بالمنزل", "العناية بالسيارة", "المطبخ", "الحمام", "الغسيل"],
    ["טיפוח בית", "טיפוח רכב", "מטבח", "אמבטיה", "כביסה"],
  );
  const [wordIndex, setWordIndex] = React.useState(0);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % words.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [words.length]);

  function scrollCards(direction) {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector(".cleaning-system-card");
    const distance = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    track.scrollBy({
      left: (isArabic ? -direction : direction) * distance,
      behavior: "smooth",
    });
  }

  return (
    <section className="cleaning-system-section storefront-wide-section">
      <div className="cleaning-system-heading-row">
        <h2 className="cleaning-system-title">
          <span className="system-title-fixed">
            {localized("A cleaning system for", "نظام تنظيف لـ", "מערכת ניקוי עבור")}
          </span>
          <span className="system-word-window" aria-live="polite">
            <span className="system-word" key={words[wordIndex]}>
              {words[wordIndex]}
            </span>
          </span>
        </h2>
        <div className="cleaning-system-controls" aria-label={localized("Card controls", "التحكم بالبطاقات", "בקרות כרטיסים")}>
          <button
            aria-label={localized("Previous", "السابق", "הקודם")}
            onClick={() => scrollCards(-1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label={localized("Next", "التالي", "הבא")}
            onClick={() => scrollCards(1)}
            type="button"
          >
            ›
          </button>
        </div>
      </div>

      <div className="cleaning-system-track" ref={trackRef}>
        {categoryCards.map((card) => (
          <article className="cleaning-system-card" key={card.key}>
            <img
              alt={card.title[language]}
              loading="lazy"
              src={card.image}
            />
            <div className="cleaning-system-card-copy">
              <small>{card.label[language]}</small>
              <strong>{card.title[language]}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PurchaseExperienceShowcase({ language, onAddToCart, onViewProduct, product }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const isArabic = language === "ar";
  const fallbackSizes = [
    { size: "500ml", price: 15 },
    { size: "1L", price: 25 },
    { size: "5L", price: 85 },
  ];
  const hasVariantModel = Array.isArray(product?.variants) && product.variants.length > 0;
  const productVariants = React.useMemo(() => normalizeHomeProductVariants(product), [product]);
  const visibleVariantSizes = React.useMemo(
    () => Array.from(new Map(productVariants.map((variant) => [variant.size, { size: variant.size, price: variant.price }])).values()),
    [productVariants]
  );
  const options = (hasVariantModel
    ? visibleVariantSizes
    : product?.sizes?.length
      ? product.sizes
      : fallbackSizes
  ).slice(0, 3);
  const colorOptions = React.useMemo(() => {
    const colorMap = new Map();
    productVariants
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((variant) => {
        const key = normalizeText(variant.colorName || "Default");
        if (!colorMap.has(key)) colorMap.set(key, variant);
      });
    return Array.from(colorMap.values());
  }, [productVariants]);
  const [selectedSize, setSelectedSize] = React.useState(options[0]?.size || "500ml");
  const [selectedColor, setSelectedColor] = React.useState(colorOptions[0]?.colorName || "Default");
  const [purchaseType, setPurchaseType] = React.useState("once");

  React.useEffect(() => {
    setSelectedSize(options[0]?.size || "");
  }, [product?.id, options[0]?.size]);

  React.useEffect(() => {
    setSelectedColor((currentColor) =>
      colorOptions.some((option) => normalizeText(option.colorName) === normalizeText(currentColor))
        ? currentColor
        : colorOptions[0]?.colorName || "Default"
    );
  }, [colorOptions]);

  const selectedOption = options.find((option) => option.size === selectedSize) || options[0];
  const selectedColorOption =
    colorOptions.find((option) => normalizeText(option.colorName) === normalizeText(selectedColor)) || colorOptions[0] || null;
  const selectedVariantForCart =
    productVariants.find((variant) => normalizeText(variant.colorName) === normalizeText(selectedColor) && normalizeText(variant.size) === normalizeText(selectedSize)) || null;
  const selectedSizeVariant = productVariants.find((variant) => normalizeText(variant.size) === normalizeText(selectedSize)) || null;
  const selectedColorImage = selectedColorOption?.image || "";
  const image =
    selectedVariantForCart?.image ||
    selectedSizeVariant?.image ||
    selectedColorImage ||
    product?.hoverImage ||
    product?.secondaryImage ||
    product?.images?.[1] ||
    product?.galleryImages?.[1] ||
    resolveImageUrl(product?.image);
  const name =
    getLocalized(product?.name, language) ||
    localized("Every Surface Cleaner", "منظف متعدد الاستخدامات", "חומר ניקוי רב משטחים");
  const description =
    getLocalized(product?.shortDescription, language) ||
    localized("A practical cleaner for daily home and car care.", "منظف عملي للعناية اليومية بالمنزل والسيارة.", "חומר ניקוי מעשי לטיפול יומיומי בבית וברכב.");
  const sellingPoints = localized(
    ["Multi-surface use", "Fresh clean scent", "Easy daily care"],
    ["مناسب لعدة أسطح", "رائحة نظيفة ومنعشة", "عناية يومية سهلة"],
    ["שימוש רב משטחים", "ריח נקי ורענן", "טיפול יומיומי קל"],
  );

  function handleAddToCart() {
    if (product && onAddToCart) {
      if (hasVariantModel && !selectedVariantForCart) return;
      onAddToCart(product, selectedOption?.size || product.sizes?.[0]?.size, selectedVariantForCart);
      return;
    }
    if (product?.slug) onViewProduct(product.slug);
  }

  return (
    <section className="purchase-showcase-section storefront-wide-section">
      <div className="purchase-showcase-copy">
        <div className="product-detail-info-panel home-product-info-preview">
          <div className="pi-section-header">
            <p className="pi-eyebrow">{localized("Purchase experience", "تجربة شراء سهلة", "חוויית קנייה")}</p>
            <h2>{name}</h2>
            <p className="pi-desc">{description}</p>
          </div>

          {colorOptions.length > 0 && (
            <div className="pi-color-field">
              <p className="pi-label">{localized("Color", "\u0627\u0644\u0644\u0648\u0646", "\u05e6\u05d1\u05e2")}</p>
              <div className="pi-color-card">
                <img
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  onError={(event) => {
                    showNeutralImage(event);
                  }}
                  src={image}
                />
                <div>
                  <p>{localized("Choose your Color", "\u0627\u062e\u062a\u0631 \u0627\u0644\u0644\u0648\u0646", "\u05d1\u05d7\u05e8 \u05d0\u05ea \u05d4\u05e6\u05d1\u05e2 \u05e9\u05dc\u05da")}</p>
                  <div className="pi-color-swatches" role="radiogroup" aria-label={localized("Color", "\u0627\u0644\u0644\u0648\u0646", "\u05e6\u05d1\u05e2")}>
                    {colorOptions.map((option) => (
                      <button
                        aria-checked={selectedColor === option.colorName}
                        aria-label={option.colorName}
                        className={selectedColor === option.colorName ? "pi-color-swatch active" : "pi-color-swatch"}
                        key={option.colorName}
                        onClick={() => setSelectedColor(option.colorName)}
                        role="radio"
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

          <div className="pi-card-field">
            <p className="pi-label">{localized("Options", "الأحجام", "אפשרויות")}</p>
            <div className="pi-card-grid two-col">
              {options.map((option) => (
                <button
                  className={option.size === selectedSize ? "pi-card active" : "pi-card"}
                  key={option.size}
                  onClick={() => setSelectedSize(option.size)}
                  type="button"
                >
                  <span className="pi-card-value">{option.size}</span>
                  <span className="pi-card-sublabel">
                    {option.price} {localized("ILS", "شيكل", "ש\"ח")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pi-segmented">
            <button
              className={purchaseType === "once" ? "pi-segment active" : "pi-segment"}
              onClick={() => setPurchaseType("once")}
              type="button"
            >
              {localized("One-time purchase", "شراء مرة واحدة", "רכישה חד פעמית")}
            </button>
            <button
              className={purchaseType === "bundle" ? "pi-segment active" : "pi-segment"}
              onClick={() => setPurchaseType("bundle")}
              type="button"
            >
              {localized("Save with bundle", "وفّر مع العرض", "חסכו עם מארז")}
            </button>
          </div>

          <div className="pi-cta-bar">
            <span className="pi-price">
              {selectedOption?.price || 0} {localized("ILS", "شيكل", "ש\"ח")}
            </span>
            {hasVariantModel && !selectedVariantForCart && <span role="status">{localized("Unavailable", "غير متوفر", "לא זמין")}</span>}
            <button className="pi-add-btn" disabled={hasVariantModel && !selectedVariantForCart} onClick={handleAddToCart} type="button">
              {localized("Add to cart", "أضف إلى السلة", "הוסף לסל")}
            </button>
          </div>

          <ul className="pi-feature-list">
            {sellingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="purchase-showcase-image" aria-label={name}>
        <img
          alt={name}
          loading="lazy"
          onError={(event) => {
            showNeutralImage(event);
          }}
          src={image}
        />
      </div>
    </section>
  );
}

function WidePromoBanner({ language, onNavigate, image }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const isArabic = language === "ar";

  return (
    <section className="home-feature-banner-section wide-promo-banner storefront-wide-section">
      <img
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={(event) => {
          showNeutralImage(event);
        }}
        src={resolveImageUrl(image)}
      />
      <div className="wide-promo-copy">
        <h2>{localized("Fresh care for every space", "عناية منعشة لكل مساحة", "טיפוח רענן לכל חלל")}</h2>
        <p>{localized("Powerful cleaning solutions for your home and car.", "حلول تنظيف فعّالة للمنزل والسيارة.", "פתרונות ניקוי חזקים לבית ולרכב שלך.")}</p>
        <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
          {localized("Shop now", "تسوق الآن", "קנה עכשיו")}
        </button>
      </div>
    </section>
  );
}

function SplitCategoryBanner({ language, onCategorySelect, products, websiteMedia }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  const isArabic = language === "ar";
  const panels = [
    {
      id: "home-cleaning",
      title: localized("Home Care", "العناية بالمنزل", "טיפוח בית"),
      image:
        getWebsiteMediaImage(
          websiteMedia,
          "homepage_split_home",
          resolveImageUrl(products.find((product) => product.categoryId === "home-cleaning")?.image),
        ),
    },
    {
      id: "car-care",
      title: localized("Car Care", "العناية بالسيارة", "טיפוח רכב"),
      image:
        getWebsiteMediaImage(
          websiteMedia,
          "homepage_split_car",
          resolveImageUrl(products.find((product) => product.categoryId === "car-care")?.image),
        ),
    },
  ];

  return (
    <section className="home-category-cards-section split-category-banner storefront-wide-section">
      {panels.map((panel) => (
        <button
          className="split-category-panel"
          key={panel.id}
          onClick={() => onCategorySelect(panel.id)}
          type="button"
        >
          <img
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={(event) => {
              showNeutralImage(event);
            }}
            src={panel.image}
          />
          <span>
            <strong>{panel.title}</strong>
            <em>{localized("Discover", "اكتشف", "גלה")}</em>
          </span>
        </button>
      ))}
    </section>
  );
}

function HomePage({
  homeContentError = "",
  homepageCategoryCards = [],
  homepageOffers = [],
  isLoading = false,
  language,
  onAddToCart,
  onCategorySelect,
  onNavigate,
  onViewProduct,
  products,
  productsError = "",
  reviews = [],
  t,
  websiteMedia = [],
  websiteMediaError = "",
}) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }

  if (isLoading) {
    return <StorefrontLoadingState label="Loading homepage content" />;
  }

  if (productsError && !products.length) {
    return (
      <StorefrontEmptyState
        message={localized("Please refresh the page and try again.", "يرجى تحديث الصفحة والمحاولة مرة أخرى.", "אנא רענן את הדף ונסה שוב.")}
        title={localized("We couldn't load the latest products", "تعذر تحميل المنتجات", "לא הצלחנו לטעון את המוצרים העדכניים")}
      />
    );
  }

  const isArabic = language === "ar";
  const starterProducts = getPromotedProducts(products);
  const essentialsProducts =
    products
      .filter((product) => ["home-cleaning", "car-care"].includes(product.categoryId))
      .slice(0, 10) || products.slice(0, 10);
  const showcaseProduct =
    products.find((product) => product.categoryId === "home-cleaning") ||
    products[0];
  const activeOffers = homepageOffers
    .filter((offer) => offer.isActive !== false)
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
  const promoImage = getWebsiteMediaImage(
    websiteMedia,
    "homepage_promo_banner",
    activeOffers[0]?.image ||
      products.find((product) => product.categoryId === "car-care")?.image ||
      products[0]?.image,
  );
  const mediaCategoryCards = homepageCategoryCards.map((card) => ({
    ...card,
    image: getWebsiteMediaImage(websiteMedia, `homepage_category_${card.key}`, card.image),
  }));
  const heroLeftImage = getWebsiteMediaImage(
    websiteMedia,
    "homepage_hero_left",
    neutralImage,
  );
  const heroRightImage = getWebsiteMediaImage(
    websiteMedia,
    "homepage_hero_right",
    neutralImage,
  );
  const howItWorksImage = getWebsiteMediaImage(
    websiteMedia,
    "homepage_how_it_works_image",
    neutralImage,
  );
  const communityGalleryImages = [
    getWebsiteMediaImage(websiteMedia, "homepage_community_gallery_1", neutralImage),
    getWebsiteMediaImage(websiteMedia, "homepage_community_gallery_2", neutralImage),
    getWebsiteMediaImage(websiteMedia, "homepage_community_gallery_3", neutralImage),
    getWebsiteMediaImage(websiteMedia, "homepage_community_gallery_4", neutralImage),
    getWebsiteMediaImage(websiteMedia, "homepage_community_gallery_5", neutralImage),
  ];
  const siteReviews = reviews.filter(
    (review) =>
      (review.type === "store" || review.type === "site" || !review.employeeId) &&
      review.isActive !== false &&
      review.isApproved !== false &&
      (review.status || "approved") === "approved",
  );

  const avgRating = siteReviews.length
    ? (siteReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / siteReviews.length).toFixed(2)
    : "0.00";
  const reviewCount = siteReviews.length;

  return (
    <div className="storefront-home">
      {(homeContentError || websiteMediaError) && (
        <p className="storefront-content-notice" role="status">
          {localized(
            "Some page content could not load, but available products are up to date.",
            "تعذر تحميل بعض محتوى الصفحة، لكن المنتجات المتاحة محدثة.",
            "תוכן מסוים לא נטען, אך המוצרים הזמינים מעודכנים.",
          )}
        </p>
      )}
      <section className="hero-section hero-editorial" data-header-theme="light">
        <div className="hero-bg">
          <img src={heroLeftImage} alt={brand.name} className="hero-bg-image" />
        </div>
        <div className="hero-content">
          <p className="eyebrow">{brand.name}</p>
          <h1>{t("home.heroHeadline")}</h1>
          <p>{t("home.heroSubheadline")}</p>
          <div className="hero-actions">
            <button className="primary-action large" onClick={() => onNavigate("products")} type="button">
              {t("home.shopProducts")}
            </button>
            <button className="secondary-action large" onClick={() => onNavigate("products")} type="button">
              {t("home.exploreCategories")}
            </button>
          </div>
        </div>
      </section>

      <CleaningSystemShowcase categoryCards={mediaCategoryCards} language={language} />

      <ProductShowcaseSlider
        language={language}
        onViewProduct={onViewProduct}
        products={starterProducts}
        title={localized("Cleaning starter kits", "مجموعات التنظيف الأساسية", "ערכות התחלה לניקוי")}
        variant="starter"
      />

      <ProductShowcaseSlider
        language={language}
        onViewProduct={onViewProduct}
        products={essentialsProducts.length ? essentialsProducts : products.slice(0, 10)}
        title={localized("Home & car care essentials", "أساسيات العناية بالمنزل والسيارة", "מוצרי טיפוח חיוניים לבית ולרכב")}
        variant="essentials"
      />

      <HowItWorksSplit image={howItWorksImage} language={language} onNavigate={onNavigate} />

      {siteReviews.length > 0 && (
        <section className="reviews-section storefront-section">
          <div className="reviews-heading">
            <h2>{t("reviews.title")}</h2>
            <div className="reviews-summary">
              <span className="reviews-summary-number">{avgRating}</span>
              <span className="reviews-summary-stars" aria-label={`${avgRating} ${localized("out of 5 stars", "من 5 نجوم", "מתוך 5 כוכבים")}`}>
                {"★★★★★"}
              </span>
              <span className="reviews-summary-count">| {reviewCount} {localized("reviews", "تقييم", "ביקורות")}</span>
            </div>
          </div>
          <div className="reviews-track">
            {siteReviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-stars" aria-label={`${review.rating} stars`}>
                  {"\u2605".repeat(Number(review.rating || 0))}
                </div>
                <p>{getLocalized(review.comment, language)}</p>
                <div>
                  <strong>{review.customerName}</strong>
                  {review.relatedProductName && <span>{review.relatedProductName}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <PurchaseExperienceShowcase
        language={language}
        onAddToCart={onAddToCart}
        onViewProduct={onViewProduct}
        product={showcaseProduct}
      />

      <WidePromoBanner
        image={promoImage}
        language={language}
        onNavigate={onNavigate}
      />

      <SplitCategoryBanner
        language={language}
        onCategorySelect={onCategorySelect}
        products={products}
        websiteMedia={websiteMedia}
      />

      {false && siteReviews.length > 0 && (
        <section className="reviews-section storefront-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{t("reviews.storeReview")}</p>
              <h2>{t("reviews.title")}</h2>
              <p>{t("reviews.subtitle")}</p>
            </div>
          </div>
          <div className="reviews-track">
            {siteReviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-stars" aria-label={`${review.rating} stars`}>
                  {"★".repeat(Number(review.rating || 0))}
                </div>
                <p>{getLocalized(review.comment, language)}</p>
                <div>
                  <strong>{review.customerName}</strong>
                  {review.relatedProductName && <span>{review.relatedProductName}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <HomeCommunityGallery galleryImages={communityGalleryImages} language={language} />

      <section className="newsletter-band storefront-section">
        <div>
          <p className="eyebrow">{t("nav.social")}</p>
          <h2>{t("home.socialTitle")}</h2>
          <p>{t("home.socialText")}</p>
        </div>
        <button className="primary-action large" onClick={() => onNavigate("follow-us")} type="button">
          {t("home.socialCta")}
        </button>
      </section>
    </div>
  );
}

export default HomePage;
