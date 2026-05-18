const placeholderImage = "/images/products/product-placeholder.svg";

// Storefront catalog for EP Chemical products.
const cleaningSizes = [
  { size: "500ml", price: 18 },
  { size: "5L", price: 55 },
  { size: "18L", price: 145 },
];

const bulkCleaningSizes = [
  { size: "5L", price: 55 },
  { size: "18L", price: 145 },
];

const fragranceSizes = [{ size: "500ml", price: 22 }];

const radiatorSizes = [
  { size: "1L", price: 15 },
  { size: "4L", price: 40 },
];

function localized(en, ar) {
  return { en, ar };
}

function createProduct({
  id,
  slug,
  name,
  categoryId,
  shortDescription,
  longDescription,
  sizes,
  badge = localized("Featured", "منتج مميز"),
  usageNotes,
}) {
  return {
    id,
    slug,
    name,
    categoryId,
    shortDescription,
    longDescription,
    image: `/images/products/${slug}.svg`,
    fallbackImage: placeholderImage,
    sizes,
    badge,
    usageNotes,
  };
}

export const products = [
  createProduct({
    id: "hc-fabric-cleaner",
    slug: "fabric-cleaner",
    name: localized("Fabric Cleaner", "منظف الأقمشة"),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "A practical cleaner for sofas, chairs, and daily fabric care.",
      "منظف عملي للكنب والكراسي والعناية اليومية بالأقمشة."
    ),
    longDescription: localized(
      "A fabric cleaner designed to refresh upholstered furniture and textile surfaces with a simple, easy-to-use routine.",
      "منظف أقمشة مصمم لإنعاش الأثاث المنجد والأسطح النسيجية بطريقة سهلة الاستخدام."
    ),
    sizes: cleaningSizes,
    badge: localized("Best Seller", "الأكثر طلباً"),
    usageNotes: localized(
      "Test on a hidden area first. Apply lightly and wipe with a clean cloth.",
      "جرّبه أولاً على منطقة مخفية. استخدم كمية خفيفة وامسح بقطعة قماش نظيفة."
    ),
  }),
  createProduct({
    id: "hc-carpet-rug-cleaner",
    slug: "carpet-rug-cleaner",
    name: localized("Carpet & Rug Cleaner", "منظف السجاد والموكيت"),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "Freshens carpets and rugs while helping lift everyday dirt.",
      "ينعش السجاد والموكيت ويساعد على إزالة الأوساخ اليومية."
    ),
    longDescription: localized(
      "A carpet and rug cleaner for regular home maintenance, spot cleaning, and keeping high-traffic areas feeling refreshed.",
      "منظف سجاد وموكيت للعناية المنزلية الدورية والتنظيف الموضعي وإنعاش المناطق كثيرة الاستخدام."
    ),
    sizes: cleaningSizes,
    usageNotes: localized(
      "Vacuum before use. Avoid over-wetting delicate rugs.",
      "نظف بالمكنسة قبل الاستخدام وتجنب تبليل السجاد الحساس بكثرة."
    ),
  }),
  createProduct({
    id: "hc-leather-plastic-cleaner",
    slug: "leather-plastic-cleaner",
    name: localized("Leather & Plastic Cleaner", "منظف الجلد والبلاستيك"),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "A gentle cleaner for leather-look and plastic surfaces.",
      "منظف لطيف للأسطح الجلدية والبلاستيكية."
    ),
    longDescription: localized(
      "A versatile cleaner for furniture, dashboards, handles, and washable plastic surfaces where a neat finish matters.",
      "منظف متعدد الاستخدام للأثاث ولوحات السيارة والمقابض والأسطح البلاستيكية القابلة للغسل."
    ),
    sizes: cleaningSizes,
    badge: localized("Multi-use", "متعدد الاستخدام"),
    usageNotes: localized(
      "Apply with a soft cloth and avoid unfinished leather.",
      "استخدمه بقطعة قماش ناعمة وتجنب الجلد غير المعالج."
    ),
  }),
  createProduct({
    id: "hc-vacuum-cleaner-solution",
    slug: "vacuum-cleaner-solution",
    name: localized("Vacuum Cleaner Solution", "منظف خاص للمكانس"),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "A practical solution for compatible wet vacuum cleaning routines.",
      "محلول عملي مناسب لروتين التنظيف بالمكانس المائية المتوافقة."
    ),
    longDescription: localized(
      "Made for wet-cleaning workflows, this product supports practical cleaning for floors, rugs, and upholstery when used with compatible machines.",
      "منتج عملي لعمليات التنظيف الرطب، يساعد في تنظيف الأرضيات والسجاد والمفروشات عند استخدامه مع الأجهزة المتوافقة."
    ),
    sizes: cleaningSizes,
    usageNotes: localized(
      "Use only with compatible machines and follow equipment instructions.",
      "استخدمه فقط مع الأجهزة المتوافقة واتبع تعليمات الجهاز."
    ),
  }),
  createProduct({
    id: "hc-stone-marble-floor-cleaner",
    slug: "stone-marble-floor-cleaner",
    name: localized(
      "Stone & Marble Floor Cleaner",
      "منظف الأرضيات الحجر والرخام"
    ),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "A clean-care formula for stone and marble flooring.",
      "تركيبة عملية للعناية بأرضيات الحجر والرخام."
    ),
    longDescription: localized(
      "A floor cleaner intended for polished stone and marble-style surfaces that need a clean, practical finish.",
      "منظف أرضيات للأسطح الحجرية والرخامية المصقولة التي تحتاج إلى لمسة نظيفة وعملية."
    ),
    sizes: cleaningSizes,
    badge: localized("Floor Care", "عناية بالأرضيات"),
    usageNotes: localized(
      "Dilute as needed and avoid acidic cleaners on marble.",
      "خففه حسب الحاجة وتجنب استخدام المنظفات الحمضية على الرخام."
    ),
  }),
  createProduct({
    id: "hc-porcelain-ceramic-floor-cleaner",
    slug: "porcelain-ceramic-floor-cleaner",
    name: localized(
      "Porcelain & Ceramic Floor Cleaner",
      "منظف البورسلان والكراميكا"
    ),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "Everyday floor cleaner for porcelain and ceramic tiles.",
      "منظف يومي لأرضيات البورسلان والكراميكا."
    ),
    longDescription: localized(
      "A tile-floor cleaner for homes, offices, and busy spaces where reliable daily cleaning is needed.",
      "منظف للبلاط في المنازل والمكاتب والأماكن كثيرة الحركة التي تحتاج تنظيفاً يومياً موثوقاً."
    ),
    sizes: cleaningSizes,
    usageNotes: localized(
      "Sweep first, then mop with a diluted solution for best results.",
      "اكنس الأرضية أولاً ثم امسح بمحلول مخفف لأفضل نتيجة."
    ),
  }),
  createProduct({
    id: "hc-limescale-remover",
    slug: "limescale-remover",
    name: localized("Limescale Remover", "مزيل الكلس"),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "Helps remove limescale buildup from washable surfaces.",
      "يساعد على إزالة تراكمات الكلس عن الأسطح القابلة للغسل."
    ),
    longDescription: localized(
      "A practical product for taps, tiles, and bathroom areas affected by mineral buildup.",
      "منتج عملي للحنفيات والبلاط ومناطق الحمام المتأثرة بالتراكمات المعدنية."
    ),
    sizes: cleaningSizes,
    badge: localized("Strong Action", "فعالية قوية"),
    usageNotes: localized(
      "Do not use on marble or acid-sensitive surfaces.",
      "لا تستخدمه على الرخام أو الأسطح الحساسة للأحماض."
    ),
  }),
  createProduct({
    id: "hc-grease-oil-remover",
    slug: "grease-oil-remover",
    name: localized("Grease & Oil Remover", "مزيل الدهون والشحوم"),
    categoryId: "home-cleaning",
    shortDescription: localized(
      "Bulk-size cleaner for greasy kitchen and workshop areas.",
      "منظف بأحجام كبيرة للمطابخ والورش والمناطق الدهنية."
    ),
    longDescription: localized(
      "A heavy-duty cleaner for areas where oil, grease, and stubborn residue need a more focused cleaning routine.",
      "منظف قوي للمناطق التي تحتاج إزالة الزيوت والدهون والبقايا الصعبة."
    ),
    sizes: bulkCleaningSizes,
    badge: localized("Heavy Duty", "استخدام قوي"),
    usageNotes: localized(
      "Wear gloves and rinse food-contact surfaces after cleaning.",
      "ارتدِ القفازات واشطف الأسطح الملامسة للطعام بعد التنظيف."
    ),
  }),
  createProduct({
    id: "cc-car-wheel-cleaner",
    slug: "car-wheel-cleaner",
    name: localized("Car Wheel Cleaner", "منظف جنطات السيارات"),
    categoryId: "car-care",
    shortDescription: localized(
      "Targets daily road dust and wheel grime.",
      "يستهدف غبار الطريق والأوساخ اليومية على الجنطات."
    ),
    longDescription: localized(
      "A wheel cleaner for refreshing rims and helping remove road film before a full car wash.",
      "منظف جنطات لإنعاش مظهر الجنطات والمساعدة في إزالة غبار الطريق قبل غسل السيارة."
    ),
    sizes: cleaningSizes,
    badge: localized("Best Seller", "الأكثر طلباً"),
    usageNotes: localized(
      "Use on cool wheels and rinse well.",
      "استخدمه على جنطات باردة واشطف جيداً."
    ),
  }),
  createProduct({
    id: "cc-concentrated-wax-car-shampoo",
    slug: "concentrated-wax-car-shampoo",
    name: localized(
      "Concentrated Wax Car Shampoo",
      "شامبو واكس مركز للسيارات"
    ),
    categoryId: "car-care",
    shortDescription: localized(
      "Concentrated car shampoo with a glossy finish.",
      "شامبو سيارات مركز بلمسة لمعان واضحة."
    ),
    longDescription: localized(
      "A wax shampoo for routine car washing, designed to leave a clean look and smooth surface feel.",
      "شامبو واكس لغسل السيارات الدوري، مصمم لترك مظهر نظيف وإحساس ناعم على السطح."
    ),
    sizes: cleaningSizes,
    badge: localized("Gloss Finish", "لمعة نهائية"),
    usageNotes: localized(
      "Dilute before use and wash from top to bottom.",
      "خففه قبل الاستخدام واغسل السيارة من الأعلى إلى الأسفل."
    ),
  }),
  createProduct({
    id: "cc-dream-no-scrub-car-shampoo",
    slug: "dream-no-scrub-car-shampoo",
    name: localized("Dream No-Scrub Car Shampoo", "شامبو دريم بدون فرك"),
    categoryId: "car-care",
    shortDescription: localized(
      "A modern shampoo for fast exterior washing.",
      "شامبو حديث لغسيل خارجي سريع."
    ),
    longDescription: localized(
      "A no-scrub style shampoo for quick washing routines where convenience and clean shine matter.",
      "شامبو بفكرة بدون فرك لروتين غسل سريع يجمع بين السهولة والمظهر اللامع."
    ),
    sizes: cleaningSizes,
    badge: localized("New", "جديد"),
    usageNotes: localized(
      "Rinse loose dirt first before applying shampoo.",
      "اشطف الأوساخ العالقة أولاً قبل وضع الشامبو."
    ),
  }),
  createProduct({
    id: "cc-tire-plastic-polish",
    slug: "tire-plastic-polish",
    name: localized("Tire & Plastic Polish", "ملمع الإطارات والبلاستيك"),
    categoryId: "car-care",
    shortDescription: localized(
      "Adds a refreshed look to tires and exterior plastics.",
      "يمنح الإطارات والبلاستيك الخارجي مظهراً متجدداً."
    ),
    longDescription: localized(
      "A polish for tires, trims, and plastic details that need a darker, cleaner appearance.",
      "ملمع للإطارات والحواف والتفاصيل البلاستيكية التي تحتاج مظهراً أنظف وأغمق."
    ),
    sizes: cleaningSizes,
    usageNotes: localized(
      "Apply evenly and avoid tire tread, pedals, and steering surfaces.",
      "ضعه بالتساوي وتجنب سطح الإطار الملامس للطريق والدواسات والمقود."
    ),
  }),
  createProduct({
    id: "cc-car-interior-cleaner",
    slug: "car-interior-cleaner",
    name: localized("Car Interior Cleaner", "منظف داخلي للسيارات"),
    categoryId: "car-care",
    shortDescription: localized(
      "Cleans dashboards, panels, and washable interior surfaces.",
      "ينظف التابلوه والألواح والأسطح الداخلية القابلة للغسل."
    ),
    longDescription: localized(
      "A practical interior cleaner for regular car-care routines across plastic, vinyl, and compatible surfaces.",
      "منظف داخلي عملي لروتين العناية بالسيارة على البلاستيك والفينيل والأسطح المتوافقة."
    ),
    sizes: cleaningSizes,
    badge: localized("Interior Care", "عناية داخلية"),
    usageNotes: localized(
      "Spray onto cloth first near screens and electronics.",
      "رش على قطعة قماش أولاً عند التنظيف قرب الشاشات والإلكترونيات."
    ),
  }),
  createProduct({
    id: "cc-engine-degreaser",
    slug: "engine-degreaser",
    name: localized("Engine Degreaser", "مزيل دهون المحركات"),
    categoryId: "car-care",
    shortDescription: localized(
      "Bulk degreaser for engine bay cleaning support.",
      "مزيل دهون بأحجام كبيرة لتنظيف منطقة المحرك."
    ),
    longDescription: localized(
      "A stronger car-care product for greasy engine areas, tools, and workshop cleaning routines.",
      "منتج قوي للعناية بالسيارات ومناسب للمناطق الدهنية في المحرك والأدوات وروتين تنظيف الورش."
    ),
    sizes: bulkCleaningSizes,
    badge: localized("Heavy Duty", "استخدام قوي"),
    usageNotes: localized(
      "Use carefully around electrical parts and rinse as directed.",
      "استخدمه بحذر قرب الأجزاء الكهربائية واشطف حسب التعليمات."
    ),
  }),
  createProduct({
    id: "fr-ocean-breeze",
    slug: "ocean-breeze-home-car-fragrance",
    name: localized(
      "Ocean Breeze Home & Car Fragrance",
      "عطر نسيم البحر للمنزل والسيارة"
    ),
    categoryId: "fragrances",
    shortDescription: localized(
      "A clean aquatic scent for rooms and cars.",
      "رائحة بحرية نظيفة للغرف والسيارات."
    ),
    longDescription: localized(
      "A fresh fragrance with a light ocean-inspired profile for everyday spaces.",
      "عطر منعش بطابع بحري خفيف للمساحات اليومية."
    ),
    sizes: fragranceSizes,
    badge: localized("Fresh", "منعش"),
    usageNotes: localized(
      "Spray lightly into open air, away from eyes and polished surfaces.",
      "رش بخفة في الهواء بعيداً عن العينين والأسطح المصقولة."
    ),
  }),
  createProduct({
    id: "fr-lavender",
    slug: "lavender-home-car-fragrance",
    name: localized(
      "Lavender Home & Car Fragrance",
      "عطر اللافندر للمنزل والسيارة"
    ),
    categoryId: "fragrances",
    shortDescription: localized(
      "A soft lavender scent for calm everyday freshness.",
      "رائحة لافندر ناعمة لانتعاش يومي هادئ."
    ),
    longDescription: localized(
      "A fragrance option for bedrooms, cars, and living areas that need a softer feel.",
      "خيار عطر لغرف النوم والسيارات وغرف المعيشة التي تحتاج إحساساً ناعماً."
    ),
    sizes: fragranceSizes,
    usageNotes: localized(
      "Use a few sprays at a time and let the scent settle.",
      "استخدم بضع رشات في كل مرة واترك الرائحة تنتشر."
    ),
  }),
  createProduct({
    id: "fr-vanilla",
    slug: "vanilla-home-car-fragrance",
    name: localized(
      "Vanilla Home & Car Fragrance",
      "عطر الفانيلا للمنزل والسيارة"
    ),
    categoryId: "fragrances",
    shortDescription: localized(
      "A warm vanilla scent for cozy interiors.",
      "رائحة فانيلا دافئة للمساحات المريحة."
    ),
    longDescription: localized(
      "A fragrance with a comforting vanilla profile for home and car use.",
      "عطر بطابع فانيلا مريح للاستخدام في المنزل والسيارة."
    ),
    sizes: fragranceSizes,
    badge: localized("Warm", "دافئ"),
    usageNotes: localized(
      "Avoid spraying directly on fabric from close distance.",
      "تجنب الرش المباشر على الأقمشة من مسافة قريبة."
    ),
  }),
  createProduct({
    id: "fr-musk",
    slug: "musk-home-car-fragrance",
    name: localized("Musk Home & Car Fragrance", "عطر المسك للمنزل والسيارة"),
    categoryId: "fragrances",
    shortDescription: localized(
      "A clean musk scent with a polished everyday feel.",
      "رائحة مسك نظيفة بلمسة يومية أنيقة."
    ),
    longDescription: localized(
      "A musk fragrance made for a simple, long-lasting clean impression.",
      "عطر مسك يمنح انطباعاً نظيفاً وبسيطاً وطويل الأثر."
    ),
    sizes: fragranceSizes,
    usageNotes: localized(
      "Use in ventilated areas and keep away from heat.",
      "استخدمه في أماكن جيدة التهوية واحفظه بعيداً عن الحرارة."
    ),
  }),
  createProduct({
    id: "rw-pink-radiator-water",
    slug: "pink-radiator-water",
    name: localized("Pink Radiator Water", "ماء روديتر زهري"),
    categoryId: "radiator-water",
    shortDescription: localized(
      "Pink radiator water product for daily vehicle care.",
      "ماء روديتر زهري للعناية اليومية بالسيارة."
    ),
    longDescription: localized(
      "A radiator water product in convenient sizes for the EP Chemical catalog.",
      "منتج ماء روديتر بأحجام مناسبة ضمن كتالوج EP Chemical."
    ),
    sizes: radiatorSizes,
    badge: localized("Featured", "منتج مميز"),
    usageNotes: localized(
      "Follow vehicle manufacturer instructions before use.",
      "اتبع تعليمات الشركة المصنعة للسيارة قبل الاستخدام."
    ),
  }),
  createProduct({
    id: "rw-green-radiator-water",
    slug: "green-radiator-water",
    name: localized("Green Radiator Water", "ماء روديتر أخضر"),
    categoryId: "radiator-water",
    shortDescription: localized(
      "Green radiator water product for daily vehicle care.",
      "ماء روديتر أخضر للعناية اليومية بالسيارة."
    ),
    longDescription: localized(
      "Another radiator water option for product browsing, cart, and checkout flows.",
      "خيار آخر من ماء الرديتر لتصفح المنتجات وإتمام الطلب بسهولة."
    ),
    sizes: radiatorSizes,
    badge: localized("Featured", "منتج مميز"),
    usageNotes: localized(
      "Do not mix products unless recommended for the vehicle.",
      "لا تخلط المنتجات إلا إذا كان ذلك موصى به للسيارة."
    ),
  }),
];

// Assign a hoverImage to each product: prefer another product in the same
// category, falling back to the next product overall, so cards can swap images
// on hover without requiring a second asset per product.
products.forEach((product, index) => {
  const sibling =
    products.find(
      (other) => other.categoryId === product.categoryId && other.id !== product.id,
    ) || products[(index + 1) % products.length];
  product.hoverImage = sibling?.image || product.image;
});

export { placeholderImage };
