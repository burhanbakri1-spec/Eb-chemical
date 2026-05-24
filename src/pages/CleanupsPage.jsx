import React from "react";

const cleanupImages = {
  hero: "/images/products/green-radiator-water.svg",
  galleryOne: "/images/products/fabric-cleaner.svg",
  galleryTwo: "/images/products/car-interior-cleaner.svg",
  galleryThree: "/images/products/grease-oil-remover.svg",
  galleryFour: "/images/products/stone-marble-floor-cleaner.svg",
  galleryFive: "/images/products/ocean-breeze-home-car-fragrance.svg",
  cta: "/images/products/carpet-rug-cleaner.svg",
  community: "/images/products/porcelain-ceramic-floor-cleaner.svg",
  collaborations: "/images/products/limescale-remover.svg",
  locations: "/images/products/green-radiator-water.svg",
};

const content = {
  en: {
    heroTitle: "We started with your home,\nnow we're cleaning up our community.",
    heroText:
      "At EB Chemical, we believe a cleaner home starts with a cleaner environment. Our cleanup initiatives bring people together to care for shared spaces and build a healthier community.",
    galleryTitle: "CleanUps",
    ctaTitle: "Sign up for the next CleanUp",
    ctaText:
      "Sign up through the link below to be the first to know about our upcoming CleanUp events in Ramallah and inside Palestine. We organize community activities regularly, and you'll receive all updates and details directly to your inbox.",
    signUp: "Sign up",
    gallery: [
      {
        location: "Ramallah, Palestine",
        title: "Community CleanUp Day",
        image: cleanupImages.galleryOne,
      },
      {
        location: "Ramallah, Palestine",
        title: "Public Park CleanUp",
        image: cleanupImages.galleryTwo,
      },
      {
        location: "Ramallah, Palestine",
        title: "School Area CleanUp",
        image: cleanupImages.galleryThree,
      },
      {
        location: "Inside Palestine",
        title: "Neighborhood CleanUp Initiative",
        image: cleanupImages.galleryFour,
      },
      {
        location: "Inside Palestine",
        title: "Green Spaces CleanUp",
        image: cleanupImages.galleryFive,
      },
    ],
    tabs: [
      {
        key: "community",
        label: "Community",
        title: "Community",
        description:
          "Our CleanUp activities are built around people. We work with local volunteers, customers, and partners in Ramallah and inside Palestine to create cleaner shared spaces and encourage everyday responsibility.",
        image: cleanupImages.community,
      },
      {
        key: "collaborations",
        label: "Collaborations",
        title: "Collaborations",
        description:
          "We welcome collaborations with local organizations, schools, businesses, and community groups that want to support cleaner and healthier environments.",
        image: cleanupImages.collaborations,
      },
      {
        key: "locations",
        label: "Locations",
        title: "Locations",
        description:
          "We're always exploring new locations for our CleanUp events in Ramallah and inside Palestine. Subscribe to be the first to find out about new events near your community.",
        image: cleanupImages.locations,
      },
    ],
  },
  ar: {
    heroTitle: "بدأنا من بيتك،\nوالآن نعمل لتنظيف مجتمعنا.",
    heroText:
      "في EB Chemical نؤمن أن النظافة تبدأ من البيت وتمتد إلى البيئة من حولنا. من خلال مبادرات التنظيف، نسعى للمشاركة في صناعة مساحات أنظف وأكثر صحة للجميع.",
    galleryTitle: "حملات التنظيف",
    ctaTitle: "سجّل في حملة التنظيف القادمة",
    ctaText:
      "سجّل لتكون أول من يعرف عن حملات التنظيف القادمة في رام الله والداخل الفلسطيني. ننظم مبادرات مجتمعية بشكل دوري، وستصلك جميع التفاصيل والتحديثات مباشرة.",
    signUp: "سجّل الآن",
    gallery: [
      {
        location: "رام الله، فلسطين",
        title: "يوم تنظيف مجتمعي",
        image: cleanupImages.galleryOne,
      },
      {
        location: "رام الله، فلسطين",
        title: "حملة تنظيف الحديقة العامة",
        image: cleanupImages.galleryTwo,
      },
      {
        location: "رام الله، فلسطين",
        title: "تنظيف محيط المدارس",
        image: cleanupImages.galleryThree,
      },
      {
        location: "الداخل الفلسطيني",
        title: "مبادرة تنظيف الأحياء",
        image: cleanupImages.galleryFour,
      },
      {
        location: "الداخل الفلسطيني",
        title: "حملة تنظيف المساحات الخضراء",
        image: cleanupImages.galleryFive,
      },
    ],
    tabs: [
      {
        key: "community",
        label: "المجتمع",
        title: "المجتمع",
        description:
          "تعتمد حملات التنظيف لدينا على مشاركة الناس. نعمل مع المتطوعين والعملاء والشركاء المحليين في رام الله والداخل الفلسطيني لصناعة مساحات مشتركة أنظف وتعزيز المسؤولية اليومية تجاه البيئة.",
        image: cleanupImages.community,
      },
      {
        key: "collaborations",
        label: "التعاونات",
        title: "التعاونات",
        description:
          "نرحب بالتعاون مع المؤسسات المحلية والمدارس والشركات والمجموعات المجتمعية التي ترغب في دعم بيئة أنظف وأكثر صحة.",
        image: cleanupImages.collaborations,
      },
      {
        key: "locations",
        label: "المواقع",
        title: "المواقع",
        description:
          "نبحث دائمًا عن مواقع جديدة لحملات التنظيف في رام الله والداخل الفلسطيني. اشترك لتكون أول من يعرف عن الفعاليات الجديدة القريبة من مجتمعك.",
        image: cleanupImages.locations,
      },
    ],
  },
};

function CleanupsPage({ language = "en", onNavigate }) {
  const isArabic = language === "ar";
  const text = content[language] || content.en;
  const galleryRef = React.useRef(null);
  const tabsRef = React.useRef(null);
  const [activeTab, setActiveTab] = React.useState("locations");
  const activeTabContent =
    text.tabs.find((tab) => tab.key === activeTab) || text.tabs[text.tabs.length - 1];

  function scrollGallery(direction) {
    const track = galleryRef.current;
    if (!track) return;
    const card = track.querySelector(".cleanup-gallery-card");
    const distance = card ? card.getBoundingClientRect().width + 18 : track.clientWidth * 0.82;
    track.scrollBy({ left: (isArabic ? -direction : direction) * distance, behavior: "smooth" });
  }

  function scrollToSignup() {
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="cleanups-page">
      <section className="cleanups-hero-section">
        <img alt="" aria-hidden="true" src={cleanupImages.hero} />
        <div className="cleanups-hero-copy">
          <span>EB Chemical Cleanups</span>
          <h1>{text.heroTitle}</h1>
          <p>{text.heroText}</p>
        </div>
      </section>

      <section className="cleanups-gallery-section" aria-label={text.galleryTitle}>
        <div className="cleanups-section-head">
          <h2>{text.galleryTitle}</h2>
          <div className="cleanups-slider-controls">
            <button aria-label={isArabic ? "السابق" : "Previous"} onClick={() => scrollGallery(-1)} type="button">
              ‹
            </button>
            <button aria-label={isArabic ? "التالي" : "Next"} onClick={() => scrollGallery(1)} type="button">
              ›
            </button>
          </div>
        </div>

        <div className="cleanups-gallery-track" ref={galleryRef}>
          {text.gallery.map((item) => (
            <article className="cleanup-gallery-card" key={item.title}>
              <img alt="" aria-hidden="true" src={item.image} />
              <div>
                <small>{item.location}</small>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cleanups-signup-banner">
        <img alt="" aria-hidden="true" src={cleanupImages.cta} />
        <div className="cleanups-signup-copy">
          <h2>{text.ctaTitle}</h2>
          <p>{text.ctaText}</p>
          <button className="cleanup-yellow-button" onClick={scrollToSignup} type="button">
            {text.signUp}
          </button>
        </div>
      </section>

      <section className="cleanups-tabs-section" ref={tabsRef}>
        <div className="cleanups-tabs-image">
          <img alt="" aria-hidden="true" src={activeTabContent.image} />
        </div>
        <div className="cleanups-tabs-content">
          <div className="cleanups-tabs-copy" key={activeTabContent.key}>
            <span>EB Chemical</span>
            <h2>{activeTabContent.title}</h2>
            <p>{activeTabContent.description}</p>
            <button className="cleanup-yellow-button" onClick={() => onNavigate?.("social")} type="button">
              {text.signUp}
            </button>
          </div>
          <div className="cleanups-tab-list" role="tablist" aria-label={text.galleryTitle}>
            {text.tabs.map((tab) => (
              <button
                aria-selected={activeTab === tab.key}
                className={activeTab === tab.key ? "active" : ""}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

export default CleanupsPage;
