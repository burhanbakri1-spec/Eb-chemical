export const websiteTextGroups = Object.freeze([
  { key: "homepage", label: { en: "Homepage", ar: "الصفحة الرئيسية", he: "דף הבית" } },
  { key: "products", label: { en: "Products", ar: "المنتجات", he: "מוצרים" } },
  { key: "about", label: { en: "About", ar: "من نحن", he: "אודות" } },
  { key: "how_it_works", label: { en: "How It Works", ar: "كيف يعمل", he: "איך זה עובד" } },
  { key: "sustainability", label: { en: "Sustainability", ar: "الاستدامة", he: "קיימות" } },
  { key: "cleanups", label: { en: "Cleanups", ar: "حملات التنظيف", he: "ניקיונות" } },
  { key: "cart", label: { en: "Cart", ar: "السلة", he: "סל קניות" } },
  { key: "checkout", label: { en: "Checkout", ar: "إتمام الطلب", he: "תשלום" } },
  { key: "general", label: { en: "General", ar: "عام", he: "כללי" } },
]);

export const defaultWebsiteTexts = Object.freeze([
  { key: "home.hero.eyebrow", group: "homepage", label: "Homepage hero eyebrow", value: { en: "EB Chemical", ar: "EB Chemical", he: "EB Chemical" } },
  { key: "home.hero.title", group: "homepage", label: "Homepage hero title", value: { en: "Cleaning and care, made simple.", ar: "منتجات تنظيف وعناية ببساطة", he: "ניקוי וטיפוח, עשוי פשוט." } },
  { key: "home.hero.subtitle", group: "homepage", label: "Homepage hero subtitle", value: { en: "Practical solutions for home and car care.", ar: "حلول عملية للعناية بالمنزل والسيارة.", he: "פתרונות פרקטיים לטיפוח הבית והרכב." } },
  { key: "home.hero.primaryButton", group: "homepage", label: "Homepage primary button", value: { en: "Shop products", ar: "تسوق المنتجات", he: "קנה מוצרים" } },
  { key: "home.hero.secondaryButton", group: "homepage", label: "Homepage secondary button", value: { en: "Explore categories", ar: "استكشف الأقسام", he: "גלה קטגוריות" } },
  { key: "products.hero.title", group: "products", label: "Products hero title", value: { en: "A better system for everyday essentials", ar: "نظام أفضل لاحتياجاتك اليومية", he: "מערכת טובה יותר לצרכים יומיומיים" } },
  { key: "products.hero.subtitle", group: "products", label: "Products hero subtitle", value: { en: "", ar: "", he: "" } },
  { key: "about.hero.title", group: "about", label: "About hero title", value: { en: "We're here to make cleaning simpler", ar: "نحن هنا لجعل التنظيف أسهل", he: "אנחנו כאן כדי להפוך את הניקוי לפשוט יותר" } },
  { key: "about.hero.subtitle", group: "about", label: "About hero subtitle", value: { en: "Practical cleaning and care products for homes, cars, and everyday spaces.", ar: "منتجات تنظيف وعناية عملية للمنزل والسيارة والمساحات اليومية.", he: "מוצרי ניקוי וטיפול מעשיים לבתים, לרכב ולחללים יומיומיים." } },
  { key: "how.title", group: "how_it_works", label: "How It Works title", value: { en: "How it works", ar: "كيف يعمل", he: "איך זה עובד" } },
  { key: "how.subtitle", group: "how_it_works", label: "How It Works subtitle", value: { en: "Choose the product once, clean with confidence every day.", ar: "اختر المنتج المناسب، ونظّف بثقة كل يوم.", he: "בחר את המוצר המתאים, נקה בביטחון בכל יום." } },
  { key: "sustainability.hero.title", group: "sustainability", label: "Sustainability hero title", value: { en: "Refills That Revolutionise", ar: "عبوات تعيد تعريف التنظيف", he: "מילוי שמשנה הכל" } },
  { key: "sustainability.hero.subtitle", group: "sustainability", label: "Sustainability hero subtitle", value: { en: "Smarter cleaning starts here", ar: "تنظيف أذكى يبدأ من هنا", he: "ניקוי חכם מתחיל כאן" } },
  { key: "cleanups.hero.title", group: "cleanups", label: "Cleanups hero title", value: { en: "We started with your home, and we're helping clean the spaces around it.", ar: "بدأنا من منزلك، ونساعد في تنظيف المساحات من حولك.", he: "התחלנו מהבית שלך, ואנחנו עוזרים לנקות את החללים מסביבו." } },
  { key: "cleanups.hero.subtitle", group: "cleanups", label: "Cleanups hero subtitle", value: { en: "EB Chemical creates practical cleaning products for everyday spaces. We focus on cleaner homes, cars, and shared environments.", ar: "تقدّم EB Chemical منتجات تنظيف عملية للمساحات اليومية. نركّز على منازل وسيارات وبيئات مشتركة أكثر نظافة.", he: "EB Chemical יוצרת מוצרי ניקוי מעשיים לחללים יומיומיים. אנו מתמקדים בבתים, רכב וסביבות משותפות נקיות יותר." } },
]);

export function normalizeWebsiteText(record = {}) {
  return {
    ...record,
    key: record.key || record.textKey || record.text_key || "",
    group: record.group || record.groupKey || record.group_key || "general",
    valueEn: record.valueEn ?? record.value?.en ?? record.value_json?.en ?? "",
    valueAr: record.valueAr ?? record.value?.ar ?? record.value_json?.ar ?? "",
    valueHe: record.valueHe ?? record.value?.he ?? record.value_json?.he ?? "",
  };
}

export function resolveWebsiteText(records, key, language, fallback = "") {
  const record = (records || []).map(normalizeWebsiteText).find(
    (item) => item.key === key && item.isActive !== false && !item.deletedAt,
  );
  if (!record) return fallback;
  const field = language === "ar" ? "valueAr" : language === "he" ? "valueHe" : "valueEn";
  return record[field] ?? fallback;
}
