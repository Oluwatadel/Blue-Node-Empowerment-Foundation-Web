import {
  ADMIN_SESSION_KEY,
  defaultPortfolioCategories,
  defaultPrograms,
  defaultSocialLinks,
  EVENTS_STORAGE_KEY,
  PROGRAMS_STORAGE_KEY,
  PORTFOLIOS_STORAGE_KEY,
  SOCIAL_LINKS_STORAGE_KEY,
  USERS_STORAGE_KEY,
  VOLUNTEERS_STORAGE_KEY,
  navItems
} from "../content/siteContent.js";

export function getDriveThumbnailUrl(fileId, size = 1800) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

function extractGoogleDriveFileId(source) {
  if (!source || typeof source !== "string") {
    return null;
  }

  try {
    const parsed = new URL(source);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!host.includes("drive.google.com") && !host.includes("docs.google.com")) {
      return null;
    }

    const pathMatches = [
      parsed.pathname.match(/\/file\/d\/([^/]+)/),
      parsed.pathname.match(/\/uc$/),
      parsed.search.match(/[?&]id=([^&]+)/)
    ];

    const pathId = pathMatches[0]?.[1] || pathMatches[2]?.[1];
    if (pathId) {
      return pathId;
    }

    if (parsed.pathname.includes("/uc") && parsed.searchParams.get("id")) {
      return parsed.searchParams.get("id");
    }
  } catch {
    return null;
  }

  return null;
}

export function getImageSources(source) {
  if (!source) {
    return [];
  }

  const driveFileId = extractGoogleDriveFileId(source);
  if (driveFileId) {
    return [
      `https://lh3.googleusercontent.com/d/${driveFileId}=w1000`,
      `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1000`,
      `https://drive.google.com/uc?export=view&id=${driveFileId}`
    ];
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

export function readStoredEvents() {
  return readStoredCollection(EVENTS_STORAGE_KEY, []);
}

export function readStoredPrograms() {
  return readStoredCollection(PROGRAMS_STORAGE_KEY, defaultPrograms);
}

export function readStoredPortfolios() {
  return readStoredCollection(PORTFOLIOS_STORAGE_KEY, defaultPortfolioCategories, transformStoredPortfolios);
}

export function readStoredSocialLinks() {
  return readStoredCollection(SOCIAL_LINKS_STORAGE_KEY, defaultSocialLinks);
}

export function readStoredUsers() {
  return readStoredCollection(USERS_STORAGE_KEY, [], transformStoredUsers, VOLUNTEERS_STORAGE_KEY);
}

export function readStoredVolunteers() {
  return readStoredUsers();
}

function transformStoredUsers(value) {
  return normalizeUserEntries(value);
}

function transformStoredPortfolios(value) {
  return normalizePortfolioCategories(value);
}

export function normalizePortfolioCategories(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultPortfolioCategories;
  }

  const normalized = value.map((item, index) => {
    const id = String(item?.id || item?.portfolioId || item?.slug || `portfolio-${index + 1}`).trim() || `portfolio-${index + 1}`;
    const label = String(item?.label || item?.name || item?.title || item?.portfolio || "").trim() || `Portfolio ${index + 1}`;
    return {
      id,
      label,
      displayOrder: normalizeTeamDisplayOrder(item?.displayOrder ?? item?.order ?? index + 1, index + 1)
    };
  });

  return sortPortfolioCategories(normalized);
}

export function sortPortfolioCategories(categories = []) {
  return [...categories].sort((left, right) => {
    const leftOrder = normalizeTeamDisplayOrder(left.displayOrder, Number.MAX_SAFE_INTEGER);
    const rightOrder = normalizeTeamDisplayOrder(right.displayOrder, Number.MAX_SAFE_INTEGER);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return String(left.label || "").localeCompare(String(right.label || ""));
  });
}

export function getPortfolioCategoryByIdOrLabel(value, portfolios = defaultPortfolioCategories) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (!normalizedValue) {
    return portfolios[0] ?? null;
  }

  return (
    portfolios.find((portfolio) => String(portfolio.id || "").toLowerCase() === normalizedValue) ??
    portfolios.find((portfolio) => String(portfolio.label || "").trim().toLowerCase() === normalizedValue) ??
    null
  );
}

export function normalizeUserEntries(value, portfolios = defaultPortfolioCategories) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const legacyUser = item?.user ?? item ?? {};
    const matchedPortfolio =
      getPortfolioCategoryByIdOrLabel(legacyUser.portfolioId || legacyUser.portfolio_id || legacyUser.portfolio, portfolios) ??
      portfolios[0] ??
      defaultPortfolioCategories[0];
    return {
      id: item?.id || `user-${index + 1}`,
      user: {
        name: legacyUser.name || "",
        portfolioId: matchedPortfolio?.id || "",
        portfolio: matchedPortfolio?.label || normalizePortfolioValue(legacyUser.portfolio || legacyUser.post || ""),
        imageUrl: legacyUser.imageUrl || legacyUser.imageId || "",
        phoneNumber: legacyUser.phoneNumber || legacyUser.phone || "",
        email: legacyUser.email || "",
        career: legacyUser.career || "",
        displayOrder: normalizeTeamDisplayOrder(legacyUser.displayOrder ?? legacyUser.order ?? legacyUser.teamOrder, index + 1)
      }
    };
  });
}

export function normalizeTeamDisplayOrder(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getPortfolioDisplayOrder(portfolio, portfolios = defaultPortfolioCategories) {
  const matched = getPortfolioCategoryByIdOrLabel(portfolio?.portfolioId || portfolio?.portfolio || portfolio, portfolios);
  return normalizeTeamDisplayOrder(matched?.displayOrder, Number.MAX_SAFE_INTEGER);
}

export function sortTeamEntries(entries = [], portfolios = defaultPortfolioCategories) {
  return [...entries].sort((left, right) => {
    const leftUser = left.user ?? left;
    const rightUser = right.user ?? right;
    const leftPortfolioOrder = getPortfolioDisplayOrder(leftUser, portfolios);
    const rightPortfolioOrder = getPortfolioDisplayOrder(rightUser, portfolios);

    if (leftPortfolioOrder !== rightPortfolioOrder) {
      return leftPortfolioOrder - rightPortfolioOrder;
    }

    const leftOrder = normalizeTeamDisplayOrder(leftUser.displayOrder ?? left.displayOrder, Number.MAX_SAFE_INTEGER);
    const rightOrder = normalizeTeamDisplayOrder(rightUser.displayOrder ?? right.displayOrder, Number.MAX_SAFE_INTEGER);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const leftName = String(leftUser.name ?? left.name ?? "").toLowerCase();
    const rightName = String(rightUser.name ?? right.name ?? "").toLowerCase();
    return leftName.localeCompare(rightName);
  });
}

export function normalizePortfolioValue(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return "members";
  }

  if (normalized === "executive director") {
    return "Executive director";
  }

  if (normalized === "programs lead") {
    return "Founder";
  }

  if (normalized === "ceo") {
    return "Founder";
  }

  if (normalized === "founder") {
    return "Founder";
  }

  if (normalized === "cofounder" || normalized === "co-founder") {
    return "cofounder";
  }

  if (normalized === "outreach coordinator") {
    return "PRO";
  }

  if (normalized === "partnerships lead") {
    return "Tech Lead";
  }

  if (normalized === "communications lead") {
    return "Program Cordinator";
  }

  if (normalized === "volunteer lead") {
    return "Secretary";
  }

  if (normalized === "education officer" || normalized === "health outreach lead" || normalized === "operations manager" || normalized === "media coordinator") {
    return "members";
  }

  return value;
}

export function readStoredCollection(storageKey, fallback, transform, legacyStorageKey) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(storageKey) ?? (legacyStorageKey ? window.localStorage.getItem(legacyStorageKey) : null);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallback;
    }

    return typeof transform === "function" ? transform(parsed) : parsed;
  } catch {
    return fallback;
  }
}

export function readAdminSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function formatEventDate(dateTime) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(dateTime));
}

export function getCountdownParts(dateTime) {
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

export function getCardsPerView(width) {
  if (width < 760) {
    return 1;
  }

  if (width < 1100) {
    return 2;
  }

  return 3;
}

export function getRouteFromHash(hash) {
  if (!hash || hash === "#") {
    return "home";
  }

  if (hash === "#team") {
    return "team";
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

export function getSelectedProgram(hash, programItems) {
  if (!hash.startsWith("#program/")) {
    return null;
  }

  const slug = decodeURIComponent(hash.replace("#program/", ""));
  return programItems.find((program) => program.slug === slug) ?? null;
}

export function getSelectedEvent(hash, eventItems) {
  if (!hash.startsWith("#event/")) {
    return null;
  }

  const eventId = decodeURIComponent(hash.replace("#event/", ""));
  return eventItems.find((event) => event.id === eventId) ?? null;
}

export function getActiveNavRoute(route) {
  if (route === "program-gallery") {
    return "programs";
  }

  if (route === "event-detail") {
    return "events";
  }

  if (route === "team") {
    return "home";
  }

  return navItems.some((item) => item.route === route) ? route : "home";
}

export function isExternalLink(href) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
