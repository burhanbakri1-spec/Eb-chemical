import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { placeholderImage } from "../data/products.js";

function getLocalized(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

function pickProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const scored = products.map((product) => {
    let score = 0;
    if (product.offer || product.discount) score += 100;
    if (product.bestSeller) score += 60;
    if (product.featured || product.isFeatured) score += 40;
    if (typeof product.salesCount === "number") score += Math.min(product.salesCount, 30);
    const badge = `${getLocalized(product.badge, "en")} ${getLocalized(product.badge, "ar")}`.toLowerCase();
    if (badge.includes("best") || badge.includes("الأكثر")) score += 30;
    if (badge.includes("offer") || badge.includes("عرض")) score += 25;
    if (badge.includes("new") || badge.includes("جديد")) score += 15;
    if (badge.includes("gloss") || badge.includes("fresh")) score += 10;
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const seenCategory = new Set();
  const out = [];
  for (const { product } of scored) {
    if (out.length >= 4) break;
    const key = product.categoryId || product.id;
    if (seenCategory.has(key) && out.length < 3) continue;
    seenCategory.add(key);
    out.push(product);
  }
  let i = 0;
  while (out.length < 4 && i < scored.length) {
    if (!out.includes(scored[i].product)) out.push(scored[i].product);
    i++;
  }
  while (out.length < 4 && products.length) {
    out.push(products[out.length % products.length]);
  }
  return out.slice(0, 4);
}

const CARD_CONFIG = [
  { rotate: -7, top: "6%",  left: "4%",  width: "26%", parallax: -90, mouseX: -22, mouseY: -14, z: 2 },
  { rotate:  4, top: "0%",  left: "32%", width: "30%", parallax:  60, mouseX:  14, mouseY:  22, z: 3 },
  { rotate: -3, top: "18%", left: "60%", width: "24%", parallax: -50, mouseX: -16, mouseY:  18, z: 2 },
  { rotate:  8, top: "44%", left: "26%", width: "22%", parallax:  80, mouseX:  20, mouseY: -18, z: 1 },
];

function FloatingProductCollage({ language, products, onViewProduct }) {
  const isArabic = language === "ar";
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const picks = useMemo(() => pickProducts(products), [products]);

  function handleMouseMove(e) {
    if (reduceMotion || isMobile) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouse({ x, y });
  }

  function handleMouseLeave() {
    setMouse({ x: 0, y: 0 });
  }

  const labels = isArabic
    ? ["الأكثر طلبًا", "عرض خاص", "منتج مميز", "جديد"]
    : ["Best Seller", "Special Offer", "Featured", "New"];

  if (picks.length === 0) return null;

  return (
    <section
      className="floating-collage-section"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="floating-collage-heading">
        <p className="eyebrow">{isArabic ? "مختارات EP Chemical" : "EP Chemical picks"}</p>
        <h2>
          {isArabic ? "منتجات مميزة من EP Chemical" : "Featured EP Chemical Products"}
        </h2>
        <p>
          {isArabic
            ? "اكتشف المنتجات الأكثر طلبًا والعروض المختارة لتجربة تنظيف وعناية أفضل."
            : "Explore our best-selling and selected offer products for a better cleaning and care experience."}
        </p>
      </div>

      <div className={`floating-collage-stage ${isMobile ? "is-mobile" : ""}`}>
        {picks.map((product, index) => (
          <CollageCard
            key={product.id || index}
            product={product}
            label={labels[index]}
            language={language}
            config={CARD_CONFIG[index]}
            scrollYProgress={scrollYProgress}
            mouse={mouse}
            reduceMotion={reduceMotion}
            isMobile={isMobile}
            onViewProduct={onViewProduct}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function CollageCard({
  product, label, language, config, scrollYProgress, mouse, reduceMotion, isMobile, onViewProduct, index,
}) {
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || isMobile ? [0, 0] : [0, config.parallax]
  );

  const image =
    product.image ||
    product.hoverImage ||
    product.gallery?.[0] ||
    product.images?.[0] ||
    placeholderImage;

  const name = getLocalized(product.name, language) || product.slug || "";

  const mx = reduceMotion || isMobile ? 0 : mouse.x * config.mouseX;
  const my = reduceMotion || isMobile ? 0 : mouse.y * config.mouseY;

  return (
    <motion.button
      type="button"
      className="collage-card"
      onClick={() => product.slug && onViewProduct?.(product.slug)}
      style={{
        y,
        zIndex: config.z,
        ...(isMobile
          ? {}
          : {
              top: config.top,
              left: config.left,
              width: config.width,
            }),
      }}
      initial={{ opacity: 0, y: 40, rotate: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, rotate: config.rotate, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? {} : { scale: 1.04, rotate: config.rotate * 0.4, y: -8 }}
    >
      <motion.div
        className="collage-card-inner"
        style={{ x: mx, y: my }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
      >
        <span className="collage-card-label">{label}</span>
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = placeholderImage; }}
        />
        <span className="collage-card-name">{name}</span>
      </motion.div>
    </motion.button>
  );
}

export default FloatingProductCollage;
