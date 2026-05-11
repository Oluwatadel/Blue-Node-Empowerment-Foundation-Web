import { useEffect, useState } from "react";

const ROOT_GALLERY_FOLDER_ID = "16tntmWBaxs-IyBfSbJh827XivD7806-8";

function getDriveThumbnailUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

const navItems = [
  { label: "Home", href: "#home", route: "home" },
  { label: "About", href: "#about", route: "about" },
  { label: "Programs", href: "#programs", route: "programs" },
  { label: "Impact", href: "#impact", route: "impact" },
  { label: "Contact", href: "#contact", route: "contact" },
  { label: "Socials", href: "#socials", route: "socials" }
];

const quickLinks = [
  { label: "About Blue Node", href: "#about", kicker: "Learn who we are" },
  { label: "Our Programs", href: "#programs", kicker: "Explore outreach areas" },
  { label: "Impact Stories", href: "#impact", kicker: "See the numbers" },
  { label: "Contact Us", href: "#contact", kicker: "Partner or support" }
];

const aboutCards = [
  {
    title: "Who we are",
    body:
      "Founded on 28 December 2021 by Ayorinde Jolaosho, Blue Node Foundation is a non-governmental, non-profit organization serving underprivileged children, individuals, and families."
  },
  {
    title: "Our vision",
    body:
      "To build communities where people can live with dignity, access opportunity, and grow beyond poverty through education, care, and support."
  },
  {
    title: "Our mission",
    body:
      "We provide education support, healthcare outreach, humanitarian relief, and empowerment programs that create lasting change across underserved communities in Nigeria."
  }
];

const programs = [
  {
    slug: "school-outreach",
    title: "School Outreach",
    body:
      "Scholarships, school supplies, and learning support that help children stay in school and keep moving forward.",
    image: getDriveThumbnailUrl("162a4Li42i5tDZT2fOF2Yie6-rJhLxVpD"),
    folderId: "1DPv-xZufSmDjumIzmUOHQGtKoXeZY879"
  },
  {
    slug: "healthcare-outreach",
    title: "Healthcare Outreach",
    body:
      "Free checkups, medication support, and health awareness campaigns that bring care closer to people who need it most.",
    image: getDriveThumbnailUrl("1dT-pP7CNtq4IbwT4WNZU2iP1xGn2FYo1"),
    folderId: "1SOaXUK-UYgzlz_sfNwuN93-_z5q9Wm1r"
  },
  {
    slug: "skills-empowerment",
    title: "Skills Empowerment",
    body:
      "Practical training, mentorship, and support that help people build confidence, income, and more stable futures.",
    image: getDriveThumbnailUrl("1zh25uWTrOmhQ_9424VRMkiR2lUas1hMq"),
    folderId: "19T7scoF3UdGGTSPiAGFHiv9Ye28iLT6r"
  },
  {
    slug: "food-outreach",
    title: "Food Outreach",
    body:
      "Food support and feeding drives that bring timely relief to vulnerable households and underserved communities.",
    image: getDriveThumbnailUrl("17fyrPM4CWGxvPdZgm5yw4KUy2BXZ_oTu"),
    folderId: "1EycRJQJmKqcqBUcDqvKtyucwS-yuuUVH"
  },
  {
    slug: "wears-outreach",
    title: "Wears Outreach",
    body:
      "Clothing and essential wear distribution that supports children, families, and communities in need.",
    image: getDriveThumbnailUrl("1QsHs502oeq7kjTgpS-Mcg_VuPZv9tXjx"),
    folderId: "1kDZf-58UjiTixcorGtMEUfzBCnQJVx2G"
  },
  {
    slug: "environmental-cleanup",
    title: "Environmental Cleanup",
    body:
      "Community clean-up drives and environmental awareness programs that promote healthier, safer, and more beautiful neighborhoods.",
    image: getDriveThumbnailUrl("1g5K0FPuVRZutaqjagqRnG2kXalCMHm_5"),
    folderId: "1SXtnEDT4Qky8ss5ARhKkan6Stqh2LcCl"
  }
];

const impactStats = [
  { value: "900+", label: "Families fed" },
  { value: "1,000+", label: "Children supported in school" },
  { value: "2,000+", label: "People empowered with skills" },
  { value: "5,000+", label: "Lives reached with relief" }
];

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/share/1BecctdKCJ/?mibextid=wwXIfr", icon: "facebook" },
  { name: "Instagram", href: "https://www.instagram.com/bluenodecares?igsh=ZGFxMjMxOWM2eDlt&utm_source=qr", icon: "instagram" },
  { name: "X", href: "https://x.com/bluenodecares?s=21&t=DpVhorY-twqi2aY3z9eBBQ", icon: "x" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/blue-node-foundation/", icon: "linkedin" },
  { name: "YouTube", href: "https://youtube.com/@bluenode?si=HLHUP5KxACg4J_jJ", icon: "youtube" },
  { name: "TikTok", href: "https://www.tiktok.com/@bluenodecares?_r=1&_t=ZS-96EnMelePb8", icon: "tiktok" },
  { name: "WhatsApp", href: "https://wa.me/2348104963290", icon: "whatsapp" },
  { name: "Email", href: "mailto:bluenodefoundation@gmail.com", icon: "email" }
];

function SocialIcon({ type }) {
  const icons = {
    facebook: (
      <path d="M13 10h3V6.5h-3c-2.8 0-5 2.2-5 5V14H5v4h3v8h4v-8h3.2l.8-4H12v-2.3c0-1 .6-1.7 1-1.7Z" />
    ),
    instagram: (
      <>
        <rect x="4" y="4" width="20" height="20" rx="6" />
        <circle cx="14" cy="14" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="19.5" cy="8.5" r="1.2" />
      </>
    ),
    x: <path d="M5 5h4.5l4.1 5.4L18.2 5H23l-7 8 7.4 10h-4.5l-4.5-6-5.1 6H4.5l7.3-8.5Z" />,
    linkedin: (
      <>
        <rect x="4" y="4" width="20" height="20" rx="4" />
        <rect x="8" y="11" width="2.7" height="8" />
        <circle cx="9.35" cy="8.4" r="1.35" />
        <path d="M14 11h2.6v1.2c.6-.9 1.7-1.6 3.2-1.6 3 0 3.7 2 3.7 4.7V19h-2.8v-3.2c0-1.5-.3-2.5-1.8-2.5-1.5 0-2.1 1.1-2.1 2.5V19H14Z" />
      </>
    ),
    youtube: (
      <>
        <path d="M24 9.5c-.2-1.6-1.4-2.8-3-3C18.8 6.2 16.3 6 14 6s-4.8.2-7 .5c-1.6.2-2.8 1.4-3 3-.3 1.8-.3 3.2 0 5 .2 1.6 1.4 2.8 3 3 2.2.3 4.7.5 7 .5s4.8-.2 7-.5c1.6-.2 2.8-1.4 3-3 .3-1.8.3-3.2 0-5Z" />
        <path d="M12 10.5v7l6-3.5Z" fill="#1d63d8" />
      </>
    ),
    tiktok: (
      <path d="M16.8 5c.4 1.9 1.5 3.2 3.2 4v2.9c-1.4-.1-2.6-.5-3.8-1.3v6.1a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v3c-.4-.1-.7-.2-1.1-.2a2.6 2.6 0 1 0 2.6 2.6V5Z" />
    ),
    whatsapp: (
      <>
        <path d="M14 4.5a9.4 9.4 0 0 0-8 14.4L5 24l5.2-1a9.5 9.5 0 1 0 3.8-18.5Z" />
        <path
          d="M10.2 9.6c.2-.5.5-.5.8-.5h.7c.2 0 .5 0 .7.5l.6 1.4c.1.3.1.5-.1.8l-.5.8c-.1.1-.2.3 0 .5.4.8 1.3 2 2.8 2.7.2.1.4.1.5 0l.8-.9c.2-.2.5-.2.7-.1l1.4.6c.4.2.5.4.5.7v.7c0 .3 0 .6-.5.8-.5.2-1.1.4-1.8.3-1-.1-2.2-.5-3.7-1.9-1.8-1.6-2.5-3.1-2.8-4.2-.2-.7-.1-1.3 0-1.8Z"
          fill="#1d63d8"
        />
      </>
    ),
    email: (
      <>
        <rect x="4" y="6" width="20" height="14" rx="3" />
        <path d="m6.5 8.5 7.5 5.5 7.5-5.5" fill="none" stroke="#1d63d8" strokeWidth="2" />
      </>
    )
  };

  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="social-icon">
      {icons[type]}
    </svg>
  );
}

function SocialFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="socials">
      <div className="footer-copy">
        <p className="section-kicker">Social media</p>
        <h2>Stay connected with Blue Node Foundation.</h2>
        <p>Follow the foundation, share the work, and keep up with new outreach activities.</p>
      </div>

      <div className="social-grid">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            className="social-card"
            href={link.href}
            target={isExternalLink(link.href) ? "_blank" : undefined}
            rel={isExternalLink(link.href) ? "noreferrer" : undefined}
          >
            <span className="social-badge">
              <SocialIcon type={link.icon} />
            </span>
            <span>{link.name}</span>
          </a>
        ))}
      </div>

      <div className="footer-meta">
        <p>&copy; {year} Blue Node Foundation. All rights reserved.</p>
        <p>Developed by Airis.</p>
      </div>
    </footer>
  );
}

function getCardsPerView(width) {
  if (width < 760) {
    return 1;
  }

  if (width < 1100) {
    return 2;
  }

  return 3;
}

function getRouteFromHash(hash) {
  if (!hash || hash === "#") {
    return "home";
  }

  if (hash.startsWith("#program/")) {
    return "program-gallery";
  }

  const route = hash.replace("#", "");
  return navItems.some((item) => item.route === route) ? route : "home";
}

function getSelectedProgram(hash) {
  if (!hash.startsWith("#program/")) {
    return null;
  }

  const slug = decodeURIComponent(hash.replace("#program/", ""));
  return programs.find((program) => program.slug === slug) ?? null;
}

function isExternalLink(href) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function PageShell({ kicker, title, body, children }) {
  return (
    <main className="page-main">
      <section className="section-shell page-section">
        <div className="section-heading page-heading">
          <p className="section-kicker">{kicker}</p>
          <h2>{title}</h2>
          {body ? <p className="page-intro">{body}</p> : null}
        </div>
        {children}
      </section>
    </main>
  );
}

function HomePage() {
  return (
    <>
      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Blue Node Foundation</p>
            <h1>Building brighter futures for families and children across Nigeria.</h1>
            <p className="hero-text">
              We combine compassion with action through education support, medical outreach,
              empowerment programs, and practical humanitarian care.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#programs">
                Explore Programs
              </a>
              <a className="btn secondary" href="#contact">
                Partner With Us
              </a>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-heading">
            <p className="section-kicker">Quick links</p>
            <h2>Move quickly to the pages people need most.</h2>
          </div>

          <div className="quick-links-grid">
            {quickLinks.map((link) => (
              <a className="quick-link-card" href={link.href} key={link.label}>
                <span className="quick-link-kicker">{link.kicker}</span>
                <strong>{link.label}</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="section-shell home-program-preview">
          <div className="section-heading">
            <p className="section-kicker">Featured programs</p>
            <h2>Six active outreach areas connected to real photo galleries.</h2>
          </div>

          <div className="program-preview-grid">
            {programs.slice(0, 3).map((program) => (
              <a className="program-preview-card" href={`#program/${program.slug}`} key={program.slug}>
                <img src={program.image} alt={program.title} />
                <div className="program-preview-copy">
                  <strong>{program.title}</strong>
                  <span>Open gallery</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <SocialFooter />
    </>
  );
}

function AboutPage() {
  return (
    <PageShell
      kicker="About us"
      title="A foundation rooted in service, dignity, and measurable community impact."
      body="Blue Node Foundation exists to respond with compassion and structure, turning support into practical help for children, women, and families."
    >
      <div className="about-grid">
        {aboutCards.map((card) => (
          <article className="info-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function ProgramsPage({ cardsPerView, currentSlide, maxSlide, goToSlide, showPrevious, showNext }) {
  return (
    <PageShell
      kicker="Our programs"
      title="Focused initiatives that respond to urgent needs and create lasting change."
      body="Each category opens its own photo gallery, so visitors can view real activity from each program area."
    >
      <div className="section-heading program-heading">
        <div />
        <div className="program-controls" aria-label="Program slider controls">
          <button type="button" className="slider-button" onClick={showPrevious} aria-label="Previous program">
            {"<"}
          </button>
          <button type="button" className="slider-button" onClick={showNext} aria-label="Next program">
            {">"}
          </button>
        </div>
      </div>

      <div className="program-carousel">
        <div
          className="program-track"
          style={{
            transform: `translateX(-${(currentSlide * 100) / cardsPerView}%)`
          }}
        >
          {programs.map((program) => (
            <article
              className="program-card"
              key={program.slug}
              style={{ flexBasis: `${100 / cardsPerView}%` }}
            >
              <img src={program.image} alt={program.title} />
              <div className="program-copy">
                <h3>
                  <a className="program-link" href={`#program/${program.slug}`}>
                    {program.title}
                  </a>
                </h3>
                <p>{program.body}</p>
                <a className="program-gallery-link" href={`#program/${program.slug}`}>
                  View photo gallery
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="program-dots" aria-label="Program slides">
        {Array.from({ length: maxSlide + 1 }, (_, index) => (
          <button
            key={index}
            type="button"
            className={index === currentSlide ? "program-dot active" : "program-dot"}
            aria-label={`Show program slide ${index + 1}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </PageShell>
  );
}

function ImpactPage() {
  return (
    <PageShell
      kicker="Our impact"
      title="Lives touched through consistent outreach, support, and community trust."
      body="Blue Node Foundation is a registered non-profit in Nigeria dedicated to poverty alleviation, healthcare access, education, and empowerment."
    >
      <div className="impact">
        <div className="impact-copy">
          <p>
            Our work is driven by the belief that real support should be both compassionate and
            practical. We aim to meet urgent needs while strengthening communities for the long
            term.
          </p>
        </div>

        <div className="impact-stats">
          {impactStats.map((item) => (
            <div className="impact-item" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell
      kicker="Contact us"
      title="Let's partner, support a campaign, or hear from you."
      body="Use the details below to reach Blue Node Foundation for collaborations, donations, outreach support, or general enquiries."
    >
      <div className="contact-social">
        <div className="contact-card">
          <ul className="contact-list">
            <li>No 5, Tejumola Estate, Fajol Obantoko, Abeokuta, Nigeria</li>
            <li>
              <a href="mailto:bluenodefoundation@gmail.com">bluenodefoundation@gmail.com</a>
            </li>
            <li>
              <a href="tel:+2348104963290">+234 810 496 3290</a>
            </li>
          </ul>
        </div>

        <form className="contact-form">
          <label>
            Full Name
            <input type="text" placeholder="Enter full name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="Enter email address" />
          </label>
          <label>
            Message
            <textarea rows="5" placeholder="Tell us how you'd like to connect..." />
          </label>
          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </PageShell>
  );
}

function SocialsPage() {
  return (
    <>
      <PageShell
        kicker="Social media"
        title="Stay connected with Blue Node Foundation."
        body="Visitors can quickly find and follow the foundation across the major platforms."
      >
        <div className="social-grid">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              className="social-card"
              href={link.href}
              target={isExternalLink(link.href) ? "_blank" : undefined}
              rel={isExternalLink(link.href) ? "noreferrer" : undefined}
            >
              <span className="social-badge">
                <SocialIcon type={link.icon} />
              </span>
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </PageShell>

      <SocialFooter />
    </>
  );
}

function ProgramGallery({ program }) {
  const folderId = program.folderId;
  const galleryFolderUrl = folderId
    ? `https://drive.google.com/drive/folders/${folderId}`
    : `https://drive.google.com/drive/folders/${ROOT_GALLERY_FOLDER_ID}`;
  const galleryEmbedUrl = folderId
    ? `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`
    : null;

  return (
    <main className="gallery-main">
      <section className="gallery-hero">
        <div className="gallery-copy">
          <p className="section-kicker">Program gallery</p>
          <h1>{program.title}</h1>
          <p className="gallery-text">{program.body}</p>

          <div className="gallery-actions">
            <a className="btn primary" href="#programs">
              Back to Programs
            </a>
            <a className="btn secondary" href={galleryFolderUrl} target="_blank" rel="noreferrer">
              Open in Google Drive
            </a>
          </div>
        </div>
      </section>

      <section className="gallery-shell">
        <div className="section-heading gallery-heading">
          <div>
            <p className="section-kicker">Photos</p>
            <h2>{program.title} in pictures.</h2>
          </div>
          <p className="gallery-note">
            This gallery is linked to the matching Google Drive folder for this program.
          </p>
        </div>

        <div className="gallery-frame-wrap">
          <iframe
            title={`${program.title} gallery`}
            src={galleryEmbedUrl}
            className="gallery-frame"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [cardsPerView, setCardsPerView] = useState(() => getCardsPerView(window.innerWidth));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash));
  const [selectedProgram, setSelectedProgram] = useState(() => getSelectedProgram(window.location.hash));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setCardsPerView(getCardsPerView(window.innerWidth));
      if (window.innerWidth > 760) {
        setMobileNavOpen(false);
      }
    }

    function handleHashChange() {
      setRoute(getRouteFromHash(window.location.hash));
      setSelectedProgram(getSelectedProgram(window.location.hash));
      setMobileNavOpen(false);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const maxSlide = Math.max(0, programs.length - cardsPerView);

  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, maxSlide));
  }, [maxSlide]);

  useEffect(() => {
    if (route !== "programs" || maxSlide === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 4500);

    return () => window.clearInterval(timer);
  }, [maxSlide, route]);

  function goToSlide(index) {
    setCurrentSlide(index);
  }

  function showPrevious() {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  }

  function showNext() {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  }

  function toggleMobileNav() {
    setMobileNavOpen((open) => !open);
  }

  function renderPage() {
    if (route === "program-gallery" && selectedProgram) {
      return <ProgramGallery program={selectedProgram} />;
    }

    switch (route) {
      case "about":
        return <AboutPage />;
      case "programs":
        return (
          <ProgramsPage
            cardsPerView={cardsPerView}
            currentSlide={currentSlide}
            maxSlide={maxSlide}
            goToSlide={goToSlide}
            showPrevious={showPrevious}
            showNext={showNext}
          />
        );
      case "impact":
        return <ImpactPage />;
      case "contact":
        return <ContactPage />;
      case "socials":
        return <SocialsPage />;
      case "home":
      default:
        return <HomePage />;
    }
  }

  return (
    <div className="page">
      <header className="top-nav">
        <a className="brand" href="#home" aria-label="Blue Node Foundation home">
          <img src="/assets/images/logo.PNG" alt="Blue Node Foundation" className="logo-image" />
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          onClick={toggleMobileNav}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="primary-navigation"
          className={mobileNavOpen ? "main-nav mobile-open" : "main-nav"}
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <a
              href={item.href}
              key={item.label}
              className={route === item.route ? "active" : undefined}
            >
              {item.label}
            </a>
          ))}

          <a className="donate-mini mobile-donate" href="#contact">
            Donate
          </a>
        </nav>

        <a className="donate-mini nav-donate" href="#contact">
          Donate
        </a>
      </header>

      {renderPage()}
    </div>
  );
}
