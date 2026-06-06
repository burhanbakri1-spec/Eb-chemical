import React from "react";
import { brand } from "../data/brand.js";
import { hasPermission } from "../data/permissions.js";
import WorkTimer from "./WorkTimer.jsx";

const shopLinks = [
  { key: "all", labelEn: "Shop All", labelAr: "عرض الكل", action: "products" },
  {
    key: "cleaning",
    labelEn: "Cleaning Products",
    labelAr: "منتجات التنظيف",
    categoryId: "home-cleaning",
  },
  {
    key: "car",
    labelEn: "Car Care",
    labelAr: "العناية بالسيارات",
    categoryId: "car-care",
  },
  {
    key: "home",
    labelEn: "Home Care",
    labelAr: "العناية بالمنزل",
    categoryId: "home-cleaning",
  },
  {
    key: "fragrances",
    labelEn: "Fragrances",
    labelAr: "المعطرات",
    categoryId: "fragrances",
  },
  {
    key: "radiator",
    labelEn: "Radiator Water",
    labelAr: "ماء الرديتر",
    categoryId: "radiator-water",
  },
  {
    key: "accessories",
    labelEn: "Accessories",
    labelAr: "الإكسسوارات",
    action: "products",
  },
];

const aboutLinks = [
  { key: "mission", labelEn: "Mission", labelAr: "رسالتنا", action: "about" },
  { key: "how", labelEn: "How it Works", labelAr: "كيف يعمل", action: "how" },
  { key: "sustainability", labelEn: "Sustainability", labelAr: "الاستدامة", action: "about" },
  { key: "cleanups", labelEn: "Cleanups", labelAr: "حملات التنظيف", action: "cleanups" },
  { key: "points", labelEn: "EB Points", labelAr: "نقاط EB", action: "eb-points" },
];

const aboutFeatureCards = [
  {
    key: "start",
    titleEn: "Join the next CleanUp",
    titleAr: "شارك في حملة التنظيف القادمة",
    image: "/images/products/green-radiator-water.svg",
    action: "cleanups",
  },
  {
    key: "shop",
    titleEn: "Shop cleaning essentials",
    titleAr: "تسوق أساسيات التنظيف",
    image: "/images/products/fabric-cleaner.svg",
    categoryId: "home-cleaning",
  },
];

const aboutMenuLinks = [
  { key: "mission", labelEn: "Mission", labelAr: "رسالتنا", action: "about", activePage: "about" },
  { key: "how", labelEn: "How it Works", labelAr: "كيف يعمل", action: "how", activePage: "how" },
  { key: "sustainability", labelEn: "Sustainability", labelAr: "الاستدامة", action: "about", activePage: "sustainability" },
  { key: "cleanups", labelEn: "Cleanups", labelAr: "حملات التنظيف", action: "cleanups", activePage: "cleanups" },
  { key: "points", labelEn: "EB Points", labelAr: "نقاط EB", action: "eb-points", activePage: "eb-points" },
];

function Icon({ name }) {
  const icons = {
    search: (
      <path d="m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
    ),
    cart: (
      <path d="M6.5 8.5h11l-.8 10.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8L6.5 8.5ZM9 8.5V7a3 3 0 0 1 6 0v1.5" />
    ),
    user: (
      <path d="M19 20a7 7 0 0 0-14 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    chevron: <path d="m7 10 5 5 5-5" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={`header-icon header-icon-${name}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      {icons[name]}
    </svg>
  );
}

function Header({
  activePage,
  cartCount,
  currentUser,
  language,
  onCategorySelect,
  onLanguageChange,
  onLogout,
  onNavigate,
  products = [],
  t,
  workSession,
}) {
  const isAdmin = currentUser?.role === "admin";
  const isEmployee = ["employee", "staff"].includes(currentUser?.role);
  const isCustomer = currentUser?.role === "customer";
  const [isMegaOpen, setIsMegaOpen] = React.useState(false);
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isHomeHeroActive, setIsHomeHeroActive] = React.useState(activePage === "home");
  const headerRef = React.useRef(null);
  const aboutCloseTimer = React.useRef(null);
  const megaCloseTimer = React.useRef(null);
  const shopLabel = language === "ar" ? "المتجر" : "Shop";
  const aboutLabel = language === "ar" ? "عن الشركة" : "About us";
  const howLabel = language === "ar" ? "كيف يعمل" : "How it Works";
  const socialLabel = language === "ar" ? "السوشيال ميديا" : t("nav.social");
  const megaFeatureCards = React.useMemo(() => {
    const distinctProducts = products.filter((product) => product?.image).slice(0, 2);
    const fallbackCards = [
      {
        titleEn: "Start here",
        titleAr: "ابدأ من هنا",
        image: "/images/products/fabric-cleaner.svg",
        action: "products",
      },
      {
        titleEn: "Shop featured products",
        titleAr: "تسوق المنتجات المميزة",
        image: "/images/products/car-shampoo.svg",
        categoryId: "car-care",
      },
    ];

    return [0, 1].map((index) => {
      const product = distinctProducts[index];
      if (!product) return fallbackCards[index];

      return {
        titleEn: index === 0 ? "Start here" : "Shop featured products",
        titleAr: index === 0 ? "ابدأ من هنا" : "تسوق المنتجات المميزة",
        image: product.image || fallbackCards[index].image,
        categoryId: product.categoryId,
        productSlug: product.slug,
      };
    });
  }, [products]);


  const searchResults = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products.slice(0, 5);

    return products
      .filter((product) => {
        const values = [
          product.name?.en,
          product.name?.ar,
          product.categoryId,
          product.description?.en,
          product.description?.ar,
        ];
        return values.some((value) => String(value || "").toLowerCase().includes(query));
      })
      .slice(0, 7);
  }, [products, searchTerm]);

  React.useEffect(() => {
    function closeMenus(event) {
      if (!headerRef.current?.contains(event.target)) {
        setIsMegaOpen(false);
        setIsAboutOpen(false);
        setIsAccountOpen(false);
        setIsMobileShopOpen(false);
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, []);

  React.useEffect(() => {
    if (activePage !== "home") {
      setIsHomeHeroActive(false);
      return undefined;
    }

    function updateHeaderTone() {
      const hero = document.querySelector(".storefront-home > .hero-editorial");
      if (!hero) {
        setIsHomeHeroActive(window.scrollY < 120);
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      setIsHomeHeroActive(heroBottom > 106);
    }

    updateHeaderTone();
    window.addEventListener("scroll", updateHeaderTone, { passive: true });
    window.addEventListener("resize", updateHeaderTone);

    return () => {
      window.removeEventListener("scroll", updateHeaderTone);
      window.removeEventListener("resize", updateHeaderTone);
    };
  }, [activePage]);

  function closeAllMenus() {
    setIsMegaOpen(false);
    setIsAboutOpen(false);
    setIsAccountOpen(false);
    setIsMobileOpen(false);
    setIsMobileShopOpen(false);
    setIsSearchOpen(false);
  }

  function goTo(page) {
    closeAllMenus();
    onNavigate(page);
  }

  function goToCategory(categoryId) {
    closeAllMenus();
    onCategorySelect?.(categoryId);
  }

  function handleShopLink(link) {
    if (link.categoryId) {
      goToCategory(link.categoryId);
      return;
    }

    goTo(link.action || "products");
  }

  function handleAboutLink(link) {
    if (link.action === "how") {
      goToHow();
      return;
    }

    if (link.action === "reviews") {
      closeAllMenus();
      onNavigate("home");
      window.setTimeout(() => {
        document.querySelector(".reviews-section")?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return;
    }

    goTo(link.action || "about");
  }

  function handleFeatureCard(card) {
    if (card.categoryId) {
      goToCategory(card.categoryId);
      return;
    }

    goTo(card.action || "products");
  }

  function viewSearchedProduct(product) {
    closeAllMenus();
    setSearchTerm("");
    if (product?.slug) {
      onNavigate("product", { slug: product.slug });
    }
  }

  function openSearchPanel() {
    setIsSearchOpen(true);
    setIsMegaOpen(false);
    setIsAboutOpen(false);
    setIsAccountOpen(false);
    window.setTimeout(() => {
      document.querySelector(".search-panel-input")?.focus();
    }, 0);
  }

  function goToHow() {
    closeAllMenus();
    onNavigate("how");
  }

  function toggleAccount() {
    setIsAccountOpen((open) => !open);
    setIsMegaOpen(false);
    setIsAboutOpen(false);
    setIsMobileShopOpen(false);
    setIsSearchOpen(false);
  }

  function handleLogout() {
    closeAllMenus();
    onLogout();
  }

  function clearMenuTimers() {
    window.clearTimeout(aboutCloseTimer.current);
    window.clearTimeout(megaCloseTimer.current);
  }

  function openMegaMenu() {
    clearMenuTimers();
    setIsMegaOpen(true);
    setIsAboutOpen(false);
    setIsAccountOpen(false);
  }

  function scheduleCloseMegaMenu() {
    window.clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = window.setTimeout(() => setIsMegaOpen(false), 140);
  }

  function openAboutMenu() {
    clearMenuTimers();
    setIsAboutOpen(true);
    setIsMegaOpen(false);
    setIsAccountOpen(false);
  }

  function scheduleCloseAboutMenu() {
    window.clearTimeout(aboutCloseTimer.current);
    aboutCloseTimer.current = window.setTimeout(() => setIsAboutOpen(false), 140);
  }

  const headerClassName = [
    "site-header",
    activePage === "home" ? "header--homepage" : "header--default",
    activePage === "home" && isHomeHeroActive ? "header--home-light" : "",
    activePage === "home" && !isHomeHeroActive ? "header--home-dark" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName} ref={headerRef}>
      <div className="header-left-block">
        <button className="brand-logo" onClick={() => goTo("home")} type="button">
          <img
            alt={`${brand.logoText} logo`}
            className="brand-logo-image"
            src="/images/brand/ep-chemical-logo.png"
          />
          <span className="brand-logo-text">{brand.logoText}</span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          <div
            className="nav-menu-wrap shop-menu-wrap"
            onMouseEnter={openMegaMenu}
            onMouseLeave={scheduleCloseMegaMenu}
          >
            <button
              aria-expanded={isMegaOpen}
              className={activePage === "products" ? "nav-link active" : "nav-link"}
              onClick={() => {
                setIsMegaOpen((open) => !open);
                setIsAboutOpen(false);
                setIsAccountOpen(false);
              }}
              type="button"
            >
              {shopLabel}
              <span className={isMegaOpen ? "chevron-wrap open" : "chevron-wrap"}>
                <Icon name="chevron" />
              </span>
            </button>
            <div className={isMegaOpen ? "mega-menu shop-mega-menu-viewport open" : "mega-menu shop-mega-menu-viewport"}>
              <nav className="mega-link-column" aria-label={shopLabel}>
                {shopLinks.map((link) => (
                  <button key={link.key} onClick={() => handleShopLink(link)} type="button">
                    {language === "ar" ? link.labelAr : link.labelEn}
                  </button>
                ))}
              </nav>
              <div className="mega-feature-grid">
                {megaFeatureCards.map((card) => (
                  <button
                    className="mega-image-card"
                    key={card.titleEn}
                    onClick={() => handleFeatureCard(card)}
                    type="button"
                  >
                    <span>
                      <img
                        alt={language === "ar" ? card.titleAr : card.titleEn}
                        src={card.image}
                      />
                    </span>
                    <strong>{language === "ar" ? card.titleAr : card.titleEn}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            className="nav-menu-wrap about-menu-wrap"
            onMouseEnter={openAboutMenu}
            onMouseLeave={scheduleCloseAboutMenu}
          >
            <button
              className={["about", "how", "cleanups", "eb-points"].includes(activePage) ? "nav-link active" : "nav-link"}
              onClick={() => {
                setIsAboutOpen((open) => !open);
                setIsMegaOpen(false);
                setIsAccountOpen(false);
              }}
              type="button"
            >
              {aboutLabel}
              <Icon name="chevron" />
            </button>
            <div className={isAboutOpen ? "about-menu about-mega-menu open" : "about-menu about-mega-menu"}>
              <nav className="about-link-column" aria-label={aboutLabel}>
                {aboutMenuLinks.map((link) => (
                  <button
                    className={activePage === (link.activePage || link.action) ? "active" : ""}
                    key={link.key}
                    onClick={() => handleAboutLink(link)}
                    type="button"
                  >
                    {language === "ar" ? link.labelAr : link.labelEn}
                  </button>
                ))}
              </nav>
              <div className="about-feature-grid">
                {aboutFeatureCards.map((card) => (
                  <button
                    className="about-image-card"
                    key={card.key}
                    onClick={() => handleFeatureCard(card)}
                    type="button"
                  >
                    <span>
                      <img alt={language === "ar" ? card.titleAr : card.titleEn} src={card.image} />
                    </span>
                    <strong>{language === "ar" ? card.titleAr : card.titleEn}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button className={activePage === "how" ? "nav-link active" : "nav-link"} onClick={goToHow} type="button">
            {howLabel}
          </button>
        </nav>
      </div>

      <div className="header-right-block">
        <button
          aria-label={t("common.changeLanguage")}
          className="language-toggle"
          onClick={onLanguageChange}
          type="button"
        >
          {language === "ar" ? "EN" : "AR"}
        </button>
        <button
          aria-label={language === "ar" ? "البحث" : "Search"}
          className="utility-icon-button"
          onClick={openSearchPanel}
          type="button"
        >
          <Icon name="search" />
        </button>
        <button
          aria-label={t("nav.cart")}
          className="utility-icon-button cart-icon-button"
          onClick={() => goTo("cart")}
          type="button"
        >
          <Icon name="cart" />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <div className="account-menu-wrap">
          <button
            aria-expanded={isAccountOpen}
            aria-label={currentUser ? currentUser.name : t("auth.login")}
            className="utility-icon-button"
            onClick={currentUser ? toggleAccount : () => goTo("login")}
            type="button"
          >
            <Icon name="user" />
          </button>
          <div className={isAccountOpen ? "account-menu open" : "account-menu"}>
            {currentUser && <strong>{currentUser.name}</strong>}
            {isAdmin && (
              <>
                <button onClick={() => goTo("admin")} type="button">
                  {t("admin.dashboard")}
                </button>
                <button onClick={() => goTo("admin-employees")} type="button">
                  {t("admin.employees")}
                </button>
              </>
            )}
            {isEmployee && (
              <>
                <button onClick={() => goTo("employee")} type="button">
                  {t("admin.employeeDashboard")}
                </button>
                {hasPermission(currentUser, "products.view") && (
                  <button onClick={() => goTo("products")} type="button">
                    {shopLabel}
                  </button>
                )}
                <WorkTimer compact session={workSession} t={t} />
              </>
            )}
            {isCustomer && (
              <button onClick={() => goTo("account")} type="button">
                {t("auth.myAccount")}
              </button>
            )}
            <button onClick={() => goTo("social")} type="button">
              {socialLabel}
            </button>
            {currentUser ? (
              <button onClick={handleLogout} type="button">
                {t("auth.logout")}
              </button>
            ) : (
              <>
                <button onClick={() => goTo("login")} type="button">
                  {t("auth.login")}
                </button>
                <button onClick={() => goTo("register")} type="button">
                  {t("auth.register")}
                </button>
              </>
            )}
          </div>
        </div>
        <button
          aria-expanded={isMobileOpen}
          aria-label="Toggle menu"
          className="mobile-menu-toggle"
          onClick={() => setIsMobileOpen((open) => !open)}
          type="button"
        >
          <Icon name="menu" />
        </button>
      </div>

      <div className={isSearchOpen ? "search-panel open" : "search-panel"}>
        <div className="search-panel-card">
          <div className="search-panel-head">
            <p>{language === "ar" ? "ابحث في المنتجات" : "Search products"}</p>
            <button aria-label="Close search" onClick={() => setIsSearchOpen(false)} type="button">
              <Icon name="close" />
            </button>
          </div>
          <input
            className="search-panel-input"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={language === "ar" ? "اكتب اسم المنتج أو القسم..." : "Search product or category..."}
            value={searchTerm}
          />
          <div className="search-results-list">
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <button key={product.id} onClick={() => viewSearchedProduct(product)} type="button">
                  <img alt={product.name?.[language] || product.name?.en || product.slug} src={product.image} />
                  <span>
                    <strong>{product.name?.[language] || product.name?.en || product.slug}</strong>
                    <small>{product.categoryId}</small>
                  </span>
                </button>
              ))
            ) : (
              <p className="search-empty-state">{language === "ar" ? "لا توجد نتائج مطابقة." : "No matching products found."}</p>
            )}
          </div>
        </div>
      </div>

      <div className={isMobileOpen ? "mobile-nav-panel open" : "mobile-nav-panel"}>
        <button
          className="mobile-shop-toggle"
          onClick={() => setIsMobileShopOpen((open) => !open)}
          type="button"
        >
          {shopLabel}
          <span className={isMobileShopOpen ? "chevron-wrap open" : "chevron-wrap"}>
            <Icon name="chevron" />
          </span>
        </button>
        {isMobileShopOpen && (
          <div className="mobile-shop-links">
            {shopLinks.map((link) => (
              <button key={link.key} onClick={() => handleShopLink(link)} type="button">
                {language === "ar" ? link.labelAr : link.labelEn}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => goTo("about")} type="button">
          {language === "ar" ? "رسالتنا" : "Mission"}
        </button>
        <button onClick={goToHow} type="button">
          {howLabel}
        </button>
        <button onClick={() => goTo("about")} type="button">
          {language === "ar" ? "الاستدامة" : "Sustainability"}
        </button>
        <button onClick={() => goTo("cleanups")} type="button">
          {language === "ar" ? "حملات التنظيف" : "Cleanups"}
        </button>
        <button onClick={() => goTo("eb-points")} type="button">
          {language === "ar" ? "نقاط EB" : "EB Points"}
        </button>
        <button onClick={() => goTo("social")} type="button">
          {socialLabel}
        </button>
        {isAdmin && (
          <button onClick={() => goTo("admin")} type="button">
            {t("admin.dashboard")}
          </button>
        )}
        {isAdmin && (
          <button onClick={() => goTo("admin-employees")} type="button">
            {t("admin.employees")}
          </button>
        )}
        {isEmployee && (
          <button onClick={() => goTo("employee")} type="button">
            {t("admin.employeeDashboard")}
          </button>
        )}
        {isCustomer && (
          <button onClick={() => goTo("account")} type="button">
            {t("auth.myAccount")}
          </button>
        )}
        {currentUser ? (
          <button onClick={handleLogout} type="button">
            {t("auth.logout")}
          </button>
        ) : (
          <>
            <button onClick={() => goTo("login")} type="button">
              {t("auth.login")}
            </button>
            <button onClick={() => goTo("register")} type="button">
              {t("auth.register")}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
