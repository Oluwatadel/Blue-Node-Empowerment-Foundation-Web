import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_KEY,
  ADMIN_USERNAME,
  EVENTS_STORAGE_KEY,
  PROGRAMS_STORAGE_KEY,
  SOCIAL_LINKS_STORAGE_KEY,
  USERS_STORAGE_KEY
} from "./content/siteContent.js";
import { fetchSiteContent, saveSiteContent } from "./lib/contentApi.js";
import {
  getActiveNavRoute,
  getCardsPerView,
  getRouteFromHash,
  getSelectedEvent,
  getSelectedProgram,
  readAdminSession,
  readStoredPrograms,
  readStoredSocialLinks
} from "./lib/siteUtils.js";
import { SiteHeader, SocialFooter } from "./components/layout.jsx";
import { AdminDashboard, AdminLogin } from "./components/admin.jsx";
import {
  AboutPage,
  ContactPage,
  EventDetailPage,
  EventsPage,
  HomePage,
  ImpactPage,
  ProgramGallery,
  ProgramsPage,
  TeamPage,
  SocialsPage
} from "./components/publicPages.jsx";

const TEAM_PAGE_ACCESS_KEY = "bluenode-team-page-access";

export default function App() {
  const [route, setRoute] = useState(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    return getRouteFromHash(window.location.hash);
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(() => {
    if (typeof window === "undefined") {
      return 3;
    }

    return getCardsPerView(window.innerWidth);
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => readAdminSession());
  const [adminError, setAdminError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [contentSource, setContentSource] = useState("local");
  const [isContentReady, setIsContentReady] = useState(false);

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
    if (route !== "team") {
      return;
    }

    const canAccessTeamPage = window.sessionStorage.getItem(TEAM_PAGE_ACCESS_KEY) === "true";
    if (!canAccessTeamPage) {
      window.location.hash = "#home";
      setRoute("home");
    }
  }, [route]);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const content = await fetchSiteContent();

        if (!active) {
          return;
        }

        setEvents(Array.isArray(content.events) ? content.events : []);
        setPrograms(Array.isArray(content.programs) ? content.programs : []);
        setSocialLinks(Array.isArray(content.socialLinks) ? content.socialLinks : []);
        setUsers(Array.isArray(content.users) ? content.users : []);
        setContentSource("api");
      } catch {
        if (!active) {
          return;
        }

        setEvents([]);
        setPrograms(readStoredPrograms());
        setSocialLinks(readStoredSocialLinks());
        setUsers([]);
        setContentSource("local");
      } finally {
        if (active) {
          setIsContentReady(true);
        }
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isContentReady) {
      return;
    }

    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    window.localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
    window.localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(socialLinks));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [events, programs, socialLinks, users, isContentReady]);

  useEffect(() => {
    if (!isContentReady || contentSource !== "api") {
      return undefined;
    }

    let cancelled = false;

    async function persistContent() {
      try {
        await saveSiteContent({
          events,
          programs,
          socialLinks,
          users
        });
      } catch {
        if (!cancelled) {
          setContentSource("local");
        }
      }
    }

    persistContent();

    return () => {
      cancelled = true;
    };
  }, [contentSource, events, programs, socialLinks, users, isContentReady]);

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

  function openTeamPage() {
    window.sessionStorage.setItem(TEAM_PAGE_ACCESS_KEY, "true");
    window.location.hash = "#team";
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

  function handleSaveUser(userEntry) {
    setUsers((current) => {
      const exists = current.some((item) => (item.id || item.user?.name) === (userEntry.id || userEntry.user?.name));
      if (exists) {
        return current.map((item) => ((item.id || item.user?.name) === (userEntry.id || userEntry.user?.name) ? userEntry : item));
      }

      return [...current, userEntry];
    });
  }

  function handleDeleteUser(userId) {
    setUsers((current) => current.filter((item) => (item.id || item.user?.name) !== userId));
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
          users={users}
          onLogout={handleAdminLogout}
          onSaveEvent={handleSaveEvent}
          onEditEvent={setEditingEvent}
          onDeleteEvent={handleDeleteEvent}
          onSaveProgram={handleSaveProgram}
          onDeleteProgram={handleDeleteProgram}
          onSaveSocialLink={handleSaveSocialLink}
          onDeleteSocialLink={handleDeleteSocialLink}
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
        />
      ) : (
        <AdminLogin onLogin={handleAdminLogin} error={adminError} />
      );
    }

    switch (route) {
      case "about":
        return <AboutPage users={users} />;
      case "team":
        return <TeamPage users={users} />;
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
        return <HomePage events={events} programs={programs} users={users} isMobile={isMobile} onOpenTeamPage={openTeamPage} />;
    }
  }

  return (
    <div className={`page page-${route} ${isAdminRoute ? "page-admin" : "page-public"}`}>
      <SiteHeader
        activeNavRoute={activeNavRoute}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={toggleMobileNav}
        isAdminRoute={isAdminRoute}
      />
      {renderPage()}
      {isAdminRoute ? null : <SocialFooter socialLinks={socialLinks} />}
    </div>
  );
}
