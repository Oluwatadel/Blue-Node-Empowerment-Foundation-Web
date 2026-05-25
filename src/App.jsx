import { useEffect, useMemo, useState } from "react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "bluenode2026";
const EVENTS_STORAGE_KEY = "bluenode-upcoming-events";
const PROGRAMS_STORAGE_KEY = "bluenode-programs";
const SOCIAL_LINKS_STORAGE_KEY = "bluenode-social-links";
const ADMIN_SESSION_KEY = "bluenode-admin-auth";
const socialIconOptions = ["facebook", "instagram", "x", "linkedin", "youtube", "tiktok", "whatsapp", "email"];

const defaultEvents = [
  {
    id: "event-school-drive",
    title: "Back-to-School Support Drive",
    location: "Abeokuta, Ogun State",
    dateTime: "2026-06-20T10:00",
    description: "Distribution of school supplies and learning materials for children in underserved communities.",
    flyerImage: "/assets/images/Bluenode.jpg"
  },
  {
    id: "event-medical-outreach",
    title: "Community Medical Outreach",
    location: "Obantoko, Abeokuta",
    dateTime: "2026-07-05T09:00",
    description: "Free checkups, health screening, and medication support for families and elderly residents.",
    flyerImage: "/assets/images/Bluenode.jpg"
  }
];

function getImageSources(source) {
  if (!source) {
    return [];
  }

  if (
    source.startsWith("/") ||
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:")
  ) {
    return [source];
  }

  return [
    `https://lh3.googleusercontent.com/d/${source}=w1000`,
    `https://drive.google.com/thumbnail?id=${source}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${source}`
  ];
}

function readStoredEvents() {
  return readStoredCollection(EVENTS_STORAGE_KEY, defaultEvents);
}

function readStoredPrograms() {
  return readStoredCollection(PROGRAMS_STORAGE_KEY, defaultPrograms);
}

function readStoredSocialLinks() {
  return readStoredCollection(SOCIAL_LINKS_STORAGE_KEY, defaultSocialLinks);
}

function readStoredCollection(storageKey, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readAdminSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function formatEventDate(dateTime) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(dateTime));
}

function getCountdownParts(dateTime) {
  const target = new Date(dateTime).getTime();
  const remaining = target - Date.now();

  if (remaining <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function ManagedImage({ source, alt, className }) {
  const sources = useMemo(() => getImageSources(source), [source]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [source]);

  if (!sources.length) {
    return null;
  }

  function handleError() {
    setSourceIndex((currentIndex) => {
      if (currentIndex >= sources.length - 1) {
        return currentIndex;
      }

      return currentIndex + 1;
    });
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={handleError}
    />
  );
}

function DriveImage({ fileId, alt, className }) {
  return <ManagedImage source={fileId} alt={alt} className={className} />;
}

function Countdown({ dateTime }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const parts = useMemo(() => {
    const target = new Date(dateTime).getTime();
    const remaining = target - now;

    if (remaining <= 0) {
      return null;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
  }, [dateTime, now]);

  if (!parts) {
    return <p className="event-live">This event is now live or completed.</p>;
  }

  return (
    <div className="countdown-strip" aria-label="Event countdown">
      <div className="countdown-item">
        <strong>{parts.days}</strong>
        <span>Days</span>
      </div>
      <div className="countdown-item">
        <strong>{parts.hours}</strong>
        <span>Hours</span>
      </div>
      <div className="countdown-item">
        <strong>{parts.minutes}</strong>
        <span>Minutes</span>
      </div>
      <div className="countdown-item">
        <strong>{parts.seconds}</strong>
        <span>Seconds</span>
      </div>
    </div>
  );
}

const navItems = [
  { label: "Home", href: "#home", route: "home" },
  { label: "About", href: "#about", route: "about" },
  { label: "Programs", href: "#programs", route: "programs" },
  { label: "Events", href: "#events", route: "events" },
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

const defaultPrograms = [
  {
    slug: "school-outreach",
    title: "School Outreach",
    body:
      "Scholarships, school supplies, and learning support that help children stay in school and keep moving forward.",
    imageId: "1BPdzTrpajXolvDUkDgVBZmLxW7VLiqiG",
    galleryImageIds: [
      "162a4Li42i5tDZT2fOF2Yie6-rJhLxVpD",
      "1lKs1X5RZADW7lOLPShgxodc0svs2WU2G",
      "121afMcxqZH84x5t58lnUpf4aveu2AftY",
      "1uDZobCxTKM4LEL89oDxoK1DIOemRjiND",
      "13aU-XwstyGFJ061Xj0UHm6vhUuiFqHAC",
      "1cKs8W_9gtBS8oMFyc05oyPUcA1sMz2Zf",
      "1tgnoJ0tEVJ8eQJHbTLSx1Tf7y2RRzo-U",
      "1ZAPZE7zig_cMbFAnWUGyjoW8RpCHys2r",
      "1nVD61yfhpMus86xps6TlcOvz5Taboor2",
      "1bVw1AH2DRb0FMHbV_m2uVUACBvBshBtr",
      "1qpu0do47c2RYrrNRzxN_WvOwTlalQACV",
      "1yGDUBrFRNGzOGm77yHq0eoWJEPOK8d5T",
      "1_XwHt1Q1U-6k4H1SCJGch3DmliHb_5QW",
      "1BijWspMXQtveKcqCXyH-aMYdiFUxNOVs",
      "1p8HtC1bBihqTmiQlVllIWXcrKYmJokm5",
      "1e7ywD2YGXCa08xY9kqYqABhOcnvaF4Lk",
      "1Mw8JqgtMh7MHtix3HHSct-xrFtiZUqY1",
      "10GLOq-kav4EFdOfnG6djU8FO1LixUeFy",
      "1BPdzTrpajXolvDUkDgVBZmLxW7VLiqiG"
    ]
  },
  {
    slug: "healthcare-outreach",
    title: "Healthcare Outreach",
    body:
      "Free checkups, medication support, and health awareness campaigns that bring care closer to people who need it most.",
    imageId: "18FepQKZvltHDqKYce44beLEkGtrviHH1",
    galleryImageIds: [
      "1dT-pP7CNtq4IbwT4WNZU2iP1xGn2FYo1",
      "1eCLirnohC6u2bCQAdQL7YROcZbS1HAw2",
      "1fEA8626UliRdgcQTa-yx9umsoOz_8xQ3",
      "1sB-JsIlhr6hNon2v6Mg9F6rIuxyFjsgA",
      "1z7x8b1BxygJUVzFS2mxEQ7HFxsJwdDS5",
      "1CG3ONHfl527X5CEJY0RMqeYTbiNIQXck",
      "1K-X9gsbtdwlTnGRAxZYRRGL8FQLT8b_X",
      "1UsDhsbcj4EN0Ht-2i0YYhqO75Pgs6bFp",
      "1QC84XKtPfaHxKNpwrtczwiI7aKetS_e-",
      "1KCqIRY9RG5iTRE6q02iz9XXi3XGNU1F6",
      "1OmWZ35yDzBNyLvh84mjUqsRddgJ_lEiJ",
      "18AxR4uLlBpMsdcQ7UCMqo6AJh5pQ52l8",
      "1CGFgcOOODlVxWZcuGhW5AmlSn7g2K65I",
      "1VjT5Eu_MpDYCmgUKUTLKv2N0TvJb1ZV8",
      "1PtgiH_u2K2ZANGT2ApTNu0_p5JDpY94S",
      "18FepQKZvltHDqKYce44beLEkGtrviHH1"
    ]
  },
  {
    slug: "skills-empowerment",
    title: "Skills Empowerment",
    body:
      "Practical training, mentorship, and support that help people build confidence, income, and more stable futures.",
    imageId: "1zh25uWTrOmhQ_9424VRMkiR2lUas1hMq",
    galleryImageIds: [
      "1KJvS1xETAgPyM6Hd_wgju9eaHnZHoWgm",
      "1Q9JVEaoRbsgu9RpDi6uP_dGSf-ScAE1f",
      "1jDNU-MXwMa5yjo7_8aD2Bx_Dd3pjrG0D",
      "1QjnR7VJTP1_yOZ2iATcLMftilxuYSbUC",
      "1Vw0fBWx5-BCkpoL0TNvyjDU7kRmGwZpG",
      "15S4unXiXdkBHe0hP643j7S7yAjQHJvT9",
      "1uAUqpaZ7KYBn_UjXEVjg7ZzsDZOPi2T8",
      "1eXeLYULmhN_LyxhosV83emmJwjM99m5M",
      "1Krg_QfPXbUi8wI6Rgjc9HwPCb2o2BoZZ",
      "183asjva1HMib66WA7JbM9S1jK73a6bjk",
      "1TOtwSrd9ZsiMBO3xnLsAFpYSsAKn3aSo",
      "1NQCEQRx5_bqiP-lhYQkeb7m8fuMPkyxW",
      "1zh25uWTrOmhQ_9424VRMkiR2lUas1hMq"
    ]
  },
  {
    slug: "food-outreach",
    title: "Food Outreach",
    body:
      "Food support and feeding drives that bring timely relief to vulnerable households and underserved communities.",
    imageId: "1a7eIGOFwANJjMXGfwHB2AGKqLW04HDaW",
    galleryImageIds: [
      "17fyrPM4CWGxvPdZgm5yw4KUy2BXZ_oTu",
      "1aE7yQV7Q3ZuWjJ-R0_aPzCzmBHHKynhY",
      "1bwXAg2ImtO6wvX5-xrQ2cTorveKu4pq9",
      "1jCsASjYy1j_Uk_pCJzfkm5Li6ZqjIz22",
      "1qbkGp8xzYSeP5cOQUTylhdweohUCIKpb",
      "1SYoYdRExVDnEvsyx0MEiOelkMJdEGdHr",
      "1bmZLzbiYYLX5AE2Pf1No-wCuDQZ_uvN8",
      "18IdhbHYS1b1OXX8yA-yMFuqlV1m-Pt9j",
      "1gWufqVbLK_pJwb2B-HzeX4-Rtji8ZRMx",
      "1MajAcwjgNg72fCOd3wvbx1yHs2tZgxx_",
      "1-T-DPgHCrRqiIKbMenYQZbEHUJRmqRnW",
      "1CLa42ie4Yt-wNfWUy_ypbTW01Uglu9FT",
      "1Io83OtSFsL8xPM9QXDMv7YQsyKczDyZd",
      "1a7eIGOFwANJjMXGfwHB2AGKqLW04HDaW"
    ]
  },
  {
    slug: "wears-outreach",
    title: "Wears Outreach",
    body:
      "Clothing and essential wear distribution that supports children, families, and communities in need.",
    imageId: "1QsHs502oeq7kjTgpS-Mcg_VuPZv9tXjx",
    galleryImageIds: [
      "1EnZyswwh16aXqmXvW-9BhnGZ2G0hDeih",
      "1SAmpFoYj25Q9DpDqVaslo3cD7TpqljqE",
      "1TXoxYmQJx0BBhsg0sA1AVUd3_7Q9Qm8I",
      "1bcLXmAu1zc4PaRJiZmHFWdLF1Tw3YIuD",
      "1F4RpZraoZsPzTWKGl1-6IpQEKFGTwEVW",
      "1QsHs502oeq7kjTgpS-Mcg_VuPZv9tXjx"
    ]
  },
  {
    slug: "environmental-cleanup",
    title: "Environmental Cleanup",
    body:
      "Community clean-up drives and environmental awareness programs that promote healthier, safer, and more beautiful neighborhoods.",
    imageId: "11sIjQYIMM1G_oR1USXLgBGyWTF1eGh1M",
    galleryImageIds: [
      "1g5K0FPuVRZutaqjagqRnG2kXalCMHm_5",
      "19UvG3kTV1FHXWcKQ3v_AfwART-6QszjR",
      "1SKMg34WUUuRaQp5VLaesniZcaFqQ7h8I",
      "1R5HLUgqXimpa-rErEd2ENEwx2Btot4C5",
      "1bIKEvq8UL5gFIRqwiPWQx17kfHzrqSsN",
      "1Ity7XKfnCB19nI_vSwFTSkC4Z-3UNzfO",
      "1HerOU2vuIXNsZZ38gUKGEBSOOVQXQNYR",
      "1e0raaZfSCa9Oon0ccRilUcM2PNT0GEWP",
      "11sIjQYIMM1G_oR1USXLgBGyWTF1eGh1M"
    ]
  }
];

const impactStats = [
  { value: "900+", label: "Families fed" },
  { value: "1,000+", label: "Children supported in school" },
  { value: "2,000+", label: "People empowered with skills" },
  { value: "5,000+", label: "Lives reached with relief" }
];

const defaultSocialLinks = [
  {
    id: "social-facebook",
    name: "Facebook",
    href: "https://www.facebook.com/share/1BecctdKCJ/?mibextid=wwXIfr",
    icon: "facebook",
    handle: "Blue Node Foundation",
    description: "Community updates, outreach highlights, and event recaps."
  },
  {
    id: "social-instagram",
    name: "Instagram",
    href: "https://www.instagram.com/bluenodecares?igsh=ZGFxMjMxOWM2eDlt&utm_source=qr",
    icon: "instagram",
    handle: "@bluenodecares",
    description: "Photo stories from outreach visits, volunteer moments, and impact on the ground."
  },
  {
    id: "social-x",
    name: "X",
    href: "https://x.com/bluenodecares?s=21&t=DpVhorY-twqi2aY3z9eBBQ",
    icon: "x",
    handle: "@bluenodecares",
    description: "Announcements, campaign updates, and real-time foundation news."
  },
  {
    id: "social-linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/blue-node-foundation/",
    icon: "linkedin",
    handle: "Blue Node Foundation",
    description: "Partnership opportunities, organization news, and professional updates."
  },
  {
    id: "social-youtube",
    name: "YouTube",
    href: "https://youtube.com/@bluenode?si=HLHUP5KxACg4J_jJ",
    icon: "youtube",
    handle: "@bluenode",
    description: "Video stories, field documentation, and community impact features."
  },
  {
    id: "social-tiktok",
    name: "TikTok",
    href: "https://www.tiktok.com/@bluenodecares?_r=1&_t=ZS-96EnMelePb8",
    icon: "tiktok",
    handle: "@bluenodecares",
    description: "Short-form outreach moments designed for quick sharing and discovery."
  },
  {
    id: "social-whatsapp",
    name: "WhatsApp",
    href: "https://wa.me/2348104963290",
    icon: "whatsapp",
    handle: "+234 810 496 3290",
    description: "Direct contact for enquiries, support coordination, and quick communication."
  },
  {
    id: "social-email",
    name: "Email",
    href: "mailto:bluenodefoundation@gmail.com",
    icon: "email",
    handle: "bluenodefoundation@gmail.com",
    description: "Formal enquiries, collaborations, and partnership communication."
  }
];

function SocialIcon({ type }) {
  const icons = {
    facebook: <path d="M13 10h3V6.5h-3c-2.8 0-5 2.2-5 5V14H5v4h3v8h4v-8h3.2l.8-4H12v-2.3c0-1 .6-1.7 1-1.7Z" />,
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
    tiktok: <path d="M16.8 5c.4 1.9 1.5 3.2 3.2 4v2.9c-1.4-.1-2.6-.5-3.8-1.3v6.1a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v3c-.4-.1-.7-.2-1.1-.2a2.6 2.6 0 1 0 2.6 2.6V5Z" />,
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

function SocialFooter({ socialLinks }) {
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
            key={link.id || link.name}
            className="social-card"
            href={link.href}
            target={isExternalLink(link.href) ? "_blank" : undefined}
            rel={isExternalLink(link.href) ? "noreferrer" : undefined}
          >
            <span className="social-badge">
              <SocialIcon type={link.icon} />
            </span>
            <span className="social-card-copy">
              <strong>{link.name}</strong>
              <span>{link.handle}</span>
            </span>
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

  if (hash.startsWith("#event/")) {
    return "event-detail";
  }

  if (hash === "#admin") {
    return "admin";
  }

  const route = hash.replace("#", "");
  return navItems.some((item) => item.route === route) ? route : "home";
}

function getSelectedProgram(hash, programItems) {
  if (!hash.startsWith("#program/")) {
    return null;
  }

  const slug = decodeURIComponent(hash.replace("#program/", ""));
  return programItems.find((program) => program.slug === slug) ?? null;
}

function getSelectedEvent(hash, eventItems) {
  if (!hash.startsWith("#event/")) {
    return null;
  }

  const eventId = decodeURIComponent(hash.replace("#event/", ""));
  return eventItems.find((event) => event.id === eventId) ?? null;
}

function getActiveNavRoute(route) {
  if (route === "program-gallery") {
    return "programs";
  }

  if (route === "event-detail") {
    return "events";
  }

  return navItems.some((item) => item.route === route) ? route : "home";
}

function isExternalLink(href) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function AutoPlayCarousel({ items, renderItem, className, isMobile, ariaLabel, autoPlayMs = 4500 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length, isMobile]);

  useEffect(() => {
    if (!isMobile || items.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex >= items.length - 1 ? 0 : currentIndex + 1));
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [autoPlayMs, isMobile, items.length]);

  if (!isMobile) {
    return <div className={className}>{items.map((item, index) => renderItem(item, index))}</div>;
  }

  return (
    <div className={`${className} mobile-carousel`} aria-label={ariaLabel}>
      <div className="mobile-carousel-viewport">
        <div
          className="mobile-carousel-track"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`
          }}
        >
          {items.map((item, index) => (
            <div className="mobile-carousel-slide" key={item.id || item.slug || item.label || item.name || index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 ? (
        <div className="mobile-carousel-dots" aria-label={`${ariaLabel} navigation`}>
          {items.map((item, index) => (
            <button
              key={item.id || item.slug || item.label || item.name || index}
              type="button"
              className={index === activeIndex ? "mobile-carousel-dot active" : "mobile-carousel-dot"}
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function QuickLinksSection() {
  return (
    <section className="section-shell quick-links-section">
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
  );
}

function UpcomingEventsSection({ events }) {
  const upcomingEvents = events
    .filter((event) => getCountdownParts(event.dateTime))
    .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime))
    .slice(0, 3);
  const featuredEvent = upcomingEvents[0] ?? null;

  if (upcomingEvents.length === 0) {
    return (
      <section className="section-shell event-spotlight">
        <div className="event-hero">
          <p className="event-pill">Upcoming events</p>
          <h2>New outreach dates will appear here as soon as they are published.</h2>
          <p className="event-summary">
            The Blue Node team can publish upcoming activities from the admin dashboard.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell event-spotlight">
      <div className="event-hero">
        <p className="event-pill">Upcoming events</p>
        <h2>Join the next Blue Node outreach and watch the countdown live.</h2>
        <p className="event-summary">
          Featured events are managed from the admin dashboard and update automatically on this home page.
        </p>
        {featuredEvent ? (
          <a className="event-summary-link" href="#events">
            Open all events
          </a>
        ) : null}
      </div>

      <div className="event-grid">
        {upcomingEvents.map((event) => (
          <article className="event-card" key={event.id}>
            <a className="event-card-link" href={`#event/${event.id}`} aria-label={`Open ${event.title} event page`}>
              <ManagedImage
                source={event.flyerImage || "/assets/images/Bluenode.jpg"}
                alt={`${event.title} flyer`}
                className="event-flyer"
              />
            </a>
            <div className="event-card-top">
              <span className="event-badge">Next up</span>
              <p className="event-date">{formatEventDate(event.dateTime)}</p>
            </div>
            <h3>
              <a className="event-title-link" href={`#event/${event.id}`}>
                {event.title}
              </a>
            </h3>
            <p className="event-location">{event.location}</p>
            <p className="event-description">{event.description}</p>
            <Countdown dateTime={event.dateTime} />
            <a className="event-detail-link" href={`#event/${event.id}`}>
              View event details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomePage({ events, programs, socialLinks, isMobile }) {
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

        <UpcomingEventsSection events={events} />

        <section className="section-shell home-program-preview">
          <div className="section-heading">
            <p className="section-kicker">Featured programs</p>
            <h2>{programs.length} active outreach areas connected to real photo galleries.</h2>
          </div>

          <AutoPlayCarousel
            items={programs.slice(0, 6)}
            className="program-preview-grid"
            isMobile={isMobile}
            ariaLabel="Featured programs"
            renderItem={(program) => (
              <a className="program-preview-card" href={`#program/${program.slug}`} key={program.slug}>
                <DriveImage fileId={program.imageId} alt={program.title} />
                <div className="program-preview-copy">
                  <strong>{program.title}</strong>
                  <span>Open gallery</span>
                </div>
              </a>
            )}
          />
        </section>

        <QuickLinksSection />
      </main>

      <SocialFooter socialLinks={socialLinks} />
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

function ProgramsPage({ programs, cardsPerView, currentSlide, maxSlide, goToSlide, showPrevious, showNext }) {
  return (
    <PageShell
      kicker="Our programs"
      title="Focused initiatives that respond to urgent needs and create lasting change."
      body="Each program opens its own photo gallery, so visitors can explore real activity from every outreach area."
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
              <DriveImage fileId={program.imageId} alt={program.title} />
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
          <div className="donation-highlight">
            <p className="donation-label">Donate to Blue Node Foundation</p>
            <strong className="donation-account-number">0110523810</strong>
            <p className="donation-bank">Prospa Capital Bank</p>
            <p className="donation-account-name">Blue Node Foundatio</p>
          </div>

          <ul className="contact-list">
            <li>2, Arokoje Street, Off Conoil Filling Station, Abeokuta, Ogun State. Nigeria</li>
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

function SocialsPage({ socialLinks }) {
  return (
    <PageShell
      kicker="Social media"
      title="Stay connected with Blue Node Foundation."
      body="Every channel below is managed from the admin dashboard so the public directory stays accurate and current."
    >
      <div className="social-grid social-grid-detailed">
        {socialLinks.map((link) => (
          <a
            key={link.id || link.name}
            className="social-card"
            href={link.href}
            target={isExternalLink(link.href) ? "_blank" : undefined}
            rel={isExternalLink(link.href) ? "noreferrer" : undefined}
          >
            <span className="social-badge">
              <SocialIcon type={link.icon} />
            </span>
            <span className="social-card-copy">
              <strong>{link.name}</strong>
              <span>{link.handle}</span>
              <small>{link.description}</small>
            </span>
          </a>
        ))}
      </div>
    </PageShell>
  );
}

function EventsPage({ events }) {
  const sortedEvents = [...events].sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime));
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  useEffect(() => {
    setActiveEventIndex(0);
  }, [events.length]);

  function showNextEvent() {
    setActiveEventIndex((currentIndex) => {
      if (sortedEvents.length <= 1) {
        return currentIndex;
      }

      return currentIndex >= sortedEvents.length - 1 ? 0 : currentIndex + 1;
    });
  }

  function showPreviousEvent() {
    setActiveEventIndex((currentIndex) => {
      if (sortedEvents.length <= 1) {
        return currentIndex;
      }

      return currentIndex <= 0 ? sortedEvents.length - 1 : currentIndex - 1;
    });
  }

  return (
    <main className="events-main">
      {sortedEvents.length ? (
        <section className="events-showcase">
          <div className="events-showcase-brand">
            <span className="events-brand-mark" />
            <strong>Blue Node Events</strong>
          </div>

          <div className="events-showcase-nav">
            <span>Community</span>
            <span>Outreach</span>
            <span>Countdown</span>
            <span>Flyer</span>
          </div>

          <div className="events-slider-shell">
            <div className="events-slider-track" style={{ transform: `translateX(-${activeEventIndex * 100}%)` }}>
              {sortedEvents.map((event) => (
                <article className="events-slide" key={event.id}>
                  <div className="events-showcase-grid">
                    <div className="events-poster-stack">
                      <span className="events-glow-card" aria-hidden="true" />
                      <a
                        className="events-poster-frame"
                        href={`#event/${event.id}`}
                        aria-label={`Open ${event.title} event page`}
                      >
                        <ManagedImage
                          source={event.flyerImage || "/assets/images/Bluenode.jpg"}
                          alt={`${event.title} flyer`}
                          className="events-poster-image"
                        />
                      </a>
                    </div>

                    <div className="events-showcase-copy">
                      <h1>{event.title}</h1>
                      <p className="events-intro">{event.description}</p>

                      <div className="events-meta">
                        <span>{formatEventDate(event.dateTime)}</span>
                        <span>{event.location}</span>
                      </div>

                      <div className="events-countdown-panel">
                        <p className="events-countdown-label">Save the date:</p>
                        <Countdown dateTime={event.dateTime} />
                      </div>

                      <div className="events-showcase-actions">
                        <a className="events-register-btn" href={`#event/${event.id}`}>
                          View Event Details
                        </a>
                      </div>

                      <p className="events-queue-label">
                        Showing event {activeEventIndex + 1} of {sortedEvents.length}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="events-slider-controls">
            <button type="button" className="events-slider-button" onClick={showPreviousEvent} aria-label="Previous event">
              {"<"}
            </button>

            <div className="events-slider-dots" aria-label="Upcoming event slides">
              {sortedEvents.map((event, index) => (
                <button
                  key={event.id}
                  type="button"
                  className={index === activeEventIndex ? "events-slider-dot active" : "events-slider-dot"}
                  aria-label={`Show event ${index + 1}`}
                  onClick={() => setActiveEventIndex(index)}
                />
              ))}
            </div>

            <button type="button" className="events-slider-button" onClick={showNextEvent} aria-label="Next event">
              {">"}
            </button>
          </div>

          <div className="events-slider-caption">
            <span>Nearest upcoming events appear first.</span>
            <span>Slide to the next event using the controls below.</span>
          </div>
        </section>
      ) : (
        <section className="section-shell page-section">
          <div className="admin-empty-state">
            <strong>No events yet</strong>
            <p>Published events will appear here once they are added from the admin dashboard.</p>
          </div>
        </section>
      )}
    </main>
  );
}

function ProgramGallery({ program }) {
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
          </div>
        </div>
      </section>

      <section className="gallery-shell">
        <div className="section-heading gallery-heading">
          <div>
            <p className="section-kicker">Photos</p>
            <h2>{program.title} in pictures.</h2>
          </div>
        </div>

        <div className="gallery-frame-wrap gallery-grid">
          {program.galleryImageIds.map((imageId, index) => (
            <figure className="gallery-photo-card" key={imageId}>
              <DriveImage
                fileId={imageId}
                alt={`${program.title} photo ${index + 1}`}
                className="gallery-photo"
              />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

function EventDetailPage({ event }) {
  return (
    <main className="gallery-main">
      <section className="gallery-hero event-detail-hero">
        <div className="gallery-copy event-detail-copy">
          <p className="section-kicker">Upcoming event</p>
          <h1>{event.title}</h1>
          <p className="gallery-text">{event.description}</p>

          <div className="event-detail-meta">
            <span>{formatEventDate(event.dateTime)}</span>
            <span>{event.location}</span>
          </div>

          <div className="gallery-actions">
            <a className="btn primary" href="#home">
              Back to Home
            </a>
            <a className="btn secondary" href="#contact">
              Partner for this event
            </a>
          </div>
        </div>

        <div className="event-detail-flyer-wrap">
          <ManagedImage
            source={event.flyerImage || "/assets/images/Bluenode.jpg"}
            alt={`${event.title} flyer`}
            className="event-detail-flyer"
          />
        </div>
      </section>

      <section className="gallery-shell event-detail-shell">
        <div className="section-heading gallery-heading">
          <div>
            <p className="section-kicker">Event flyer</p>
            <h2>Full event summary and countdown.</h2>
          </div>
        </div>

        <div className="event-detail-grid">
          <article className="event-detail-card">
            <h3>What to expect</h3>
            <p>{event.description}</p>
          </article>

          <article className="event-detail-card">
            <h3>When and where</h3>
            <p>{formatEventDate(event.dateTime)}</p>
            <p>{event.location}</p>
          </article>

          <article className="event-detail-card event-detail-countdown-card">
            <h3>Countdown</h3>
            <Countdown dateTime={event.dateTime} />
          </article>
        </div>
      </section>
    </main>
  );
}

function AdminLogin({ onLogin, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onLogin({ username, password });
  }

  return (
    <main className="page-main admin-login-page">
      <section className="admin-login-stage">
        <div className="admin-login-shell">
          <div className="admin-login-panel admin-login-copy">
            <p className="section-kicker admin-login-kicker">Admin dashboard</p>
            <h2>Admin sign in</h2>
            <p className="page-intro">
              Access the content management area to publish events, update timelines, and keep the BlueNode website accurate.
            </p>

            <form className="admin-login-form" onSubmit={handleSubmit}>
              <label className="admin-login-field">
                <span className="admin-login-field-shell">
                  <span className="admin-login-field-icon" aria-hidden="true" />
                  <input
                    aria-label="Username"
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </span>
              </label>
              <label className="admin-login-field">
                <span className="admin-login-field-shell">
                  <span className="admin-login-field-icon admin-login-field-icon-lock" aria-hidden="true" />
                  <input
                    aria-label="Password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </span>
              </label>
              <p className="admin-login-help">Forgot password?</p>
              {error ? <p className="admin-error">{error}</p> : null}
              <button type="submit" className="admin-login-submit">
                Sign in
              </button>
              <p className="admin-login-note">Need access? Contact the website administrator.</p>
            </form>
          </div>

          <div className="admin-login-art" aria-hidden="true">
            <div className="admin-login-art-glow" />
            <div className="admin-login-aside-card admin-login-aside-card-primary">
              <p className="admin-login-aside-label">Workspace</p>
              <h3>Content operations</h3>
              <p>
                Manage public updates from one place with a calm, focused workflow built for the BlueNode team.
              </p>
            </div>
            <div className="admin-login-metrics">
              <div className="admin-login-aside-card">
                <p className="admin-login-aside-label">Publishing</p>
                <strong>Events and countdowns</strong>
              </div>
              <div className="admin-login-aside-card">
                <p className="admin-login-aside-label">Access</p>
                <strong>Restricted to administrators</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard({
  events,
  programs,
  socialLinks,
  onLogout,
  onSaveEvent,
  onEditEvent,
  onDeleteEvent,
  onSaveProgram,
  onDeleteProgram,
  onSaveSocialLink,
  onDeleteSocialLink,
  editingEvent,
  setEditingEvent
}) {
  const emptyForm = {
    id: "",
    title: "",
    location: "",
    dateTime: "",
    description: "",
    flyerImage: ""
  };
  const [formState, setFormState] = useState(emptyForm);
  const [activeSection, setActiveSection] = useState("overview");
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const emptyProgramForm = {
    id: "",
    slug: "",
    title: "",
    body: "",
    imageId: "",
    galleryImageIds: ""
  };
  const emptySocialForm = {
    id: "",
    name: "",
    href: "",
    icon: socialIconOptions[0],
    handle: "",
    description: ""
  };
  const [programFormState, setProgramFormState] = useState(emptyProgramForm);
  const [socialFormState, setSocialFormState] = useState(emptySocialForm);

  useEffect(() => {
    if (editingEvent) {
      setFormState({
        ...emptyForm,
        ...editingEvent
      });
    } else {
      setFormState(emptyForm);
    }
  }, [editingEvent]);

  useEffect(() => {
    if (editingProgram) {
      setProgramFormState({
        id: editingProgram.id || editingProgram.slug,
        slug: editingProgram.slug,
        title: editingProgram.title,
        body: editingProgram.body,
        imageId: editingProgram.imageId,
        galleryImageIds: editingProgram.galleryImageIds.join("\n")
      });
      setActiveSection("programs");
      return;
    }

    setProgramFormState(emptyProgramForm);
  }, [editingProgram]);

  useEffect(() => {
    if (editingSocialLink) {
      setSocialFormState({
        id: editingSocialLink.id,
        name: editingSocialLink.name,
        href: editingSocialLink.href,
        icon: editingSocialLink.icon,
        handle: editingSocialLink.handle || "",
        description: editingSocialLink.description || ""
      });
      setActiveSection("socials");
      return;
    }

    setSocialFormState(emptySocialForm);
  }, [editingSocialLink]);

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...formState,
      id: formState.id || `event-${Date.now()}`
    };

    onSaveEvent(payload);
    setFormState(emptyForm);
  }

  function handleCancelEdit() {
    setEditingEvent(null);
    setFormState(emptyForm);
  }

  function updateProgramField(field, value) {
    setProgramFormState((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleProgramSubmit(event) {
    event.preventDefault();

    const slug = programFormState.slug || slugify(programFormState.title);
    const payload = {
      id: programFormState.id || slug || `program-${Date.now()}`,
      slug,
      title: programFormState.title,
      body: programFormState.body,
      imageId: programFormState.imageId,
      galleryImageIds: programFormState.galleryImageIds
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    };

    onSaveProgram(payload);
    setEditingProgram(null);
    setProgramFormState(emptyProgramForm);
  }

  function handleCancelProgramEdit() {
    setEditingProgram(null);
    setProgramFormState(emptyProgramForm);
  }

  function updateSocialField(field, value) {
    setSocialFormState((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSocialSubmit(event) {
    event.preventDefault();

    const payload = {
      id: socialFormState.id || `social-${Date.now()}`,
      name: socialFormState.name,
      href: socialFormState.href,
      icon: socialFormState.icon,
      handle: socialFormState.handle,
      description: socialFormState.description
    };

    onSaveSocialLink(payload);
    setEditingSocialLink(null);
    setSocialFormState(emptySocialForm);
  }

  function handleCancelSocialEdit() {
    setEditingSocialLink(null);
    setSocialFormState(emptySocialForm);
  }

  const sortedEvents = [...events].sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime));
  const upcomingCount = sortedEvents.length;
  const nextEvent = sortedEvents[0];
  const adminSections = [
    { id: "overview", label: "Overview" },
    { id: "events", label: "Events" },
    { id: "programs", label: "Programs" },
    { id: "socials", label: "Social media" }
  ];

  return (
    <main className="admin-main-page">
      <section className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <p className="section-kicker">Blue Node</p>
            <h2>Content control</h2>
            <p>Manage public-facing updates without leaving the dashboard.</p>
          </div>

          <nav className="admin-nav" aria-label="Admin sections">
            {adminSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? "active" : undefined}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-summary">
            <div className="admin-mini-card">
              <span className="admin-stat-label">Events</span>
              <strong>{events.length}</strong>
            </div>
            <div className="admin-mini-card">
              <span className="admin-stat-label">Programs</span>
              <strong>{programs.length}</strong>
            </div>
            <div className="admin-mini-card">
              <span className="admin-stat-label">Social links</span>
              <strong>{socialLinks.length}</strong>
            </div>
          </div>

          <button type="button" className="admin-logout" onClick={onLogout}>
            Logout
          </button>
        </aside>

        <div className="admin-dashboard">
          <div className="admin-hero">
            <div>
              <p className="section-kicker">Admin dashboard</p>
              <h2>
                {activeSection === "overview" && "Website content overview"}
                {activeSection === "events" && "Manage upcoming events"}
                {activeSection === "programs" && "Manage programs and galleries"}
                {activeSection === "socials" && "Manage social media presence"}
              </h2>
              <p className="page-intro">
                {activeSection === "overview" &&
                  "Review publishing status across events, program galleries, and social channels from one workspace."}
                {activeSection === "events" &&
                  "Create and maintain event listings that power the home page countdown and spotlight section."}
                {activeSection === "programs" &&
                  "Update program titles, descriptions, cover images, and gallery image collections shown publicly."}
                {activeSection === "socials" &&
                  "Keep the home and socials pages current with the right links, handles, and platform descriptions."}
              </p>
            </div>
          </div>

          {activeSection === "overview" ? (
            <>
              <div className="admin-overview-grid">
                <article className="admin-stat-card">
                  <span className="admin-stat-label">Scheduled events</span>
                  <strong>{upcomingCount}</strong>
                  <p>{nextEvent ? nextEvent.title : "No event is currently scheduled."}</p>
                </article>
                <article className="admin-stat-card">
                  <span className="admin-stat-label">Programs</span>
                  <strong>{programs.length}</strong>
                  <p>Gallery-driven program areas currently published on the website.</p>
                </article>
                <article className="admin-stat-card">
                  <span className="admin-stat-label">Social channels</span>
                  <strong>{socialLinks.length}</strong>
                  <p>Channels available across the home footer and the dedicated socials page.</p>
                </article>
              </div>

              <div className="admin-overview-notes">
                <article className="admin-content-card">
                  <div className="admin-card-heading">
                    <div>
                      <p className="admin-card-label">Next event</p>
                      <h3>{nextEvent ? nextEvent.title : "No event scheduled"}</h3>
                    </div>
                  </div>
                  <p className="admin-overview-text">
                    {nextEvent
                      ? `${formatEventDate(nextEvent.dateTime)} at ${nextEvent.location}.`
                      : "Use the Events section to publish the next outreach activity."}
                  </p>
                </article>
                <article className="admin-content-card">
                  <div className="admin-card-heading">
                    <div>
                      <p className="admin-card-label">Publishing flow</p>
                      <h3>What updates where</h3>
                    </div>
                  </div>
                  <p className="admin-overview-text">
                    Events feed the home spotlight. Programs power the public gallery pages. Social links appear in the footer and socials directory.
                  </p>
                </article>
              </div>
            </>
          ) : null}

          {activeSection === "events" ? (
            <div className="admin-workspace">
              <form className="admin-form admin-content-card admin-editor-card" onSubmit={handleSubmit}>
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">{editingEvent ? "Editing mode" : "New content"}</p>
                    <h3>{editingEvent ? "Edit event" : "Add upcoming event"}</h3>
                  </div>
                  <span className="admin-chip">{editingEvent ? "Draft update" : "Publish-ready"}</span>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-span-2">
                    Event title
                    <input
                      value={formState.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Location
                    <input
                      value={formState.location}
                      onChange={(event) => updateField("location", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Date and time
                    <input
                      type="datetime-local"
                      value={formState.dateTime}
                      onChange={(event) => updateField("dateTime", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Description
                    <textarea
                      rows="5"
                      value={formState.description}
                      onChange={(event) => updateField("description", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Flyer image URL or Google Drive file ID
                    <input
                      value={formState.flyerImage}
                      onChange={(event) => updateField("flyerImage", event.target.value)}
                      placeholder="/assets/images/Bluenode.jpg or Drive file ID"
                    />
                  </label>
                </div>

                <div className="admin-actions">
                  <button type="submit" className="submit-btn">
                    {editingEvent ? "Update event" : "Publish event"}
                  </button>
                  {editingEvent ? (
                    <button type="button" className="btn admin-secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="admin-content-card admin-events-card">
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">Live queue</p>
                    <h3>Published events</h3>
                  </div>
                  <span className="admin-chip">{upcomingCount} total</span>
                </div>

                <div className="admin-event-list">
                  {sortedEvents.length ? (
                    sortedEvents.map((event) => (
                      <article className="admin-event-item" key={event.id}>
                        <div className="admin-event-copy">
                          <strong>{event.title}</strong>
                          <span>{formatEventDate(event.dateTime)}</span>
                          <span>{event.location}</span>
                          <p>{event.description}</p>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            type="button"
                            className="btn admin-secondary"
                            onClick={() => {
                              onEditEvent(event);
                              setActiveSection("events");
                            }}
                          >
                            Edit
                          </button>
                          <button type="button" className="btn admin-danger" onClick={() => onDeleteEvent(event.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="admin-empty-state">
                      <strong>No events yet</strong>
                      <p>Your published events will appear here once you create the first one.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "programs" ? (
            <div className="admin-workspace">
              <form className="admin-form admin-content-card admin-editor-card" onSubmit={handleProgramSubmit}>
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">{editingProgram ? "Editing mode" : "Program library"}</p>
                    <h3>{editingProgram ? "Edit program" : "Add program"}</h3>
                  </div>
                  <span className="admin-chip">{editingProgram ? "Updating gallery" : "New gallery entry"}</span>
                </div>

                <div className="admin-form-grid">
                  <label>
                    Title
                    <input
                      value={programFormState.title}
                      onChange={(event) => updateProgramField("title", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Slug
                    <input
                      value={programFormState.slug}
                      onChange={(event) => updateProgramField("slug", slugify(event.target.value))}
                      placeholder="auto-generated-from-title"
                    />
                  </label>
                  <label className="admin-span-2">
                    Description
                    <textarea
                      rows="4"
                      value={programFormState.body}
                      onChange={(event) => updateProgramField("body", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Cover image Google Drive ID
                    <input
                      value={programFormState.imageId}
                      onChange={(event) => updateProgramField("imageId", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Gallery image IDs
                    <textarea
                      rows="6"
                      value={programFormState.galleryImageIds}
                      onChange={(event) => updateProgramField("galleryImageIds", event.target.value)}
                      placeholder="One Google Drive image ID per line"
                      required
                    />
                  </label>
                </div>

                <div className="admin-actions">
                  <button type="submit" className="submit-btn">
                    {editingProgram ? "Update program" : "Save program"}
                  </button>
                  {editingProgram ? (
                    <button type="button" className="btn admin-secondary" onClick={handleCancelProgramEdit}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="admin-content-card admin-events-card">
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">Published programs</p>
                    <h3>Gallery collection</h3>
                  </div>
                  <span className="admin-chip">{programs.length} total</span>
                </div>

                <div className="admin-event-list">
                  {programs.map((program) => (
                    <article className="admin-event-item" key={program.id || program.slug}>
                      <div className="admin-event-copy">
                        <strong>{program.title}</strong>
                        <span>{program.slug}</span>
                        <span>{program.galleryImageIds.length} gallery images</span>
                        <p>{program.body}</p>
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn admin-secondary" onClick={() => setEditingProgram(program)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn admin-danger"
                          onClick={() => onDeleteProgram(program.id || program.slug)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "socials" ? (
            <div className="admin-workspace">
              <form className="admin-form admin-content-card admin-editor-card" onSubmit={handleSocialSubmit}>
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">{editingSocialLink ? "Editing mode" : "Social directory"}</p>
                    <h3>{editingSocialLink ? "Edit social link" : "Add social link"}</h3>
                  </div>
                  <span className="admin-chip">{editingSocialLink ? "Updating channel" : "New channel"}</span>
                </div>

                <div className="admin-form-grid">
                  <label>
                    Platform name
                    <input
                      value={socialFormState.name}
                      onChange={(event) => updateSocialField("name", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Icon
                    <select
                      value={socialFormState.icon}
                      onChange={(event) => updateSocialField("icon", event.target.value)}
                    >
                      {socialIconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-span-2">
                    Link URL
                    <input
                      value={socialFormState.href}
                      onChange={(event) => updateSocialField("href", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Handle or contact
                    <input
                      value={socialFormState.handle}
                      onChange={(event) => updateSocialField("handle", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Description
                    <textarea
                      rows="4"
                      value={socialFormState.description}
                      onChange={(event) => updateSocialField("description", event.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="admin-actions">
                  <button type="submit" className="submit-btn">
                    {editingSocialLink ? "Update channel" : "Save channel"}
                  </button>
                  {editingSocialLink ? (
                    <button type="button" className="btn admin-secondary" onClick={handleCancelSocialEdit}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="admin-content-card admin-events-card">
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">Public channels</p>
                    <h3>Social directory</h3>
                  </div>
                  <span className="admin-chip">{socialLinks.length} total</span>
                </div>

                <div className="admin-event-list">
                  {socialLinks.map((link) => (
                    <article className="admin-event-item" key={link.id}>
                      <div className="admin-event-copy">
                        <strong>{link.name}</strong>
                        <span>{link.handle}</span>
                        <span>{link.href}</span>
                        <p>{link.description}</p>
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn admin-secondary" onClick={() => setEditingSocialLink(link)}>
                          Edit
                        </button>
                        <button type="button" className="btn admin-danger" onClick={() => onDeleteSocialLink(link.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [cardsPerView, setCardsPerView] = useState(() => getCardsPerView(window.innerWidth));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [events, setEvents] = useState(() => readStoredEvents());
  const [programs, setPrograms] = useState(() => readStoredPrograms());
  const [socialLinks, setSocialLinks] = useState(() => readStoredSocialLinks());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => readAdminSession());
  const [adminError, setAdminError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const selectedProgram = useMemo(() => getSelectedProgram(window.location.hash, programs), [programs, route]);
  const selectedEvent = useMemo(() => getSelectedEvent(window.location.hash, events), [events, route]);
  const activeNavRoute = getActiveNavRoute(route);
  const isAdminRoute = route === "admin";
  const isMobile = cardsPerView === 1;

  useEffect(() => {
    function handleResize() {
      setCardsPerView(getCardsPerView(window.innerWidth));
      if (window.innerWidth > 760) {
        setMobileNavOpen(false);
      }
    }

    function handleHashChange() {
      setRoute(getRouteFromHash(window.location.hash));
      setMobileNavOpen(false);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    window.localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    window.localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(socialLinks));
  }, [socialLinks]);

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

  function handleAdminLogin({ username, password }) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminError("");
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      return;
    }

    setAdminError("Invalid admin username or password.");
  }

  function handleAdminLogout() {
    setIsAdminAuthenticated(false);
    setEditingEvent(null);
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  function handleSaveEvent(event) {
    setEvents((current) => {
      const exists = current.some((item) => item.id === event.id);
      if (exists) {
        return current.map((item) => (item.id === event.id ? event : item));
      }

      return [...current, event];
    });
    setEditingEvent(null);
  }

  function handleDeleteEvent(eventId) {
    setEvents((current) => current.filter((item) => item.id !== eventId));
    if (editingEvent?.id === eventId) {
      setEditingEvent(null);
    }
  }

  function handleSaveProgram(program) {
    setPrograms((current) => {
      const exists = current.some((item) => (item.id || item.slug) === (program.id || program.slug));
      if (exists) {
        return current.map((item) => ((item.id || item.slug) === (program.id || program.slug) ? program : item));
      }

      return [...current, program];
    });
  }

  function handleDeleteProgram(programId) {
    setPrograms((current) => current.filter((item) => (item.id || item.slug) !== programId));
  }

  function handleSaveSocialLink(link) {
    setSocialLinks((current) => {
      const exists = current.some((item) => item.id === link.id);
      if (exists) {
        return current.map((item) => (item.id === link.id ? link : item));
      }

      return [...current, link];
    });
  }

  function handleDeleteSocialLink(linkId) {
    setSocialLinks((current) => current.filter((item) => item.id !== linkId));
  }

  function renderPage() {
    if (route === "program-gallery" && selectedProgram) {
      return <ProgramGallery program={selectedProgram} />;
    }

    if (route === "event-detail" && selectedEvent) {
      return <EventDetailPage event={selectedEvent} />;
    }

    if (route === "admin") {
      return isAdminAuthenticated ? (
        <AdminDashboard
          events={events}
          programs={programs}
          socialLinks={socialLinks}
          onLogout={handleAdminLogout}
          onSaveEvent={handleSaveEvent}
          onEditEvent={setEditingEvent}
          onDeleteEvent={handleDeleteEvent}
          onSaveProgram={handleSaveProgram}
          onDeleteProgram={handleDeleteProgram}
          onSaveSocialLink={handleSaveSocialLink}
          onDeleteSocialLink={handleDeleteSocialLink}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
        />
      ) : (
        <AdminLogin onLogin={handleAdminLogin} error={adminError} />
      );
    }

    switch (route) {
      case "about":
        return <AboutPage />;
      case "programs":
        return (
          <ProgramsPage
            programs={programs}
            cardsPerView={cardsPerView}
            currentSlide={currentSlide}
            maxSlide={maxSlide}
            goToSlide={goToSlide}
            showPrevious={showPrevious}
            showNext={showNext}
          />
        );
      case "events":
        return <EventsPage events={events} />;
      case "impact":
        return <ImpactPage />;
      case "contact":
        return <ContactPage />;
      case "socials":
        return <SocialsPage socialLinks={socialLinks} />;
      case "home":
      default:
        return <HomePage events={events} programs={programs} socialLinks={socialLinks} isMobile={isMobile} />;
    }
  }

  return (
    <div className="page">
      {isAdminRoute ? null : (
        <header className="top-nav">
          <a className="brand" href="#home" aria-label="Blue Node Foundation home">
            <img src="/assets/images/logo.PNG" alt="Blue Node Foundation" className="logo-image" />
          </a>

          <nav
            id="primary-navigation"
            className={mobileNavOpen ? "main-nav mobile-open" : "main-nav"}
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <a
                href={item.href}
                key={item.label}
                className={activeNavRoute === item.route ? "active" : undefined}
                aria-current={activeNavRoute === item.route ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <div className="nav-shortcuts">
              <a className="admin-entry" href="#admin">
                Admin
              </a>
              <a className="donate-mini nav-donate" href="#contact">
                Donate
              </a>
            </div>

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
          </div>
        </header>
      )}

      {renderPage()}
    </div>
  );
}
