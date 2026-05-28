import {
  ADMIN_SESSION_KEY,
  defaultEvents,
  defaultPrograms,
  defaultSocialLinks,
  EVENTS_STORAGE_KEY,
  PROGRAMS_STORAGE_KEY,
  SOCIAL_LINKS_STORAGE_KEY,
  navItems
} from "../content/siteContent.js";

export function getDriveThumbnailUrl(fileId, size = 1800) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export function getImageSources(source) {
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

export function readStoredEvents() {
  return readStoredCollection(EVENTS_STORAGE_KEY, defaultEvents);
}

export function readStoredPrograms() {
  return readStoredCollection(PROGRAMS_STORAGE_KEY, defaultPrograms);
}

export function readStoredSocialLinks() {
  return readStoredCollection(SOCIAL_LINKS_STORAGE_KEY, defaultSocialLinks);
}

export function readStoredCollection(storageKey, fallback) {
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
