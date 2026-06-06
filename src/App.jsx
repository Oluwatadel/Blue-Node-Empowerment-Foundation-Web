import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_KEY,
  ADMIN_USERNAME,
  EVENTS_STORAGE_KEY,
  PROGRAMS_STORAGE_KEY,
  PORTFOLIOS_STORAGE_KEY,
  SOCIAL_LINKS_STORAGE_KEY,
  USERS_STORAGE_KEY
} from "./content/siteContent.js";
import {
  createMessage,
  deleteMessage,
  fetchMessages,
  fetchSiteContent,
  saveSiteContent,
  updateMessage
} from "./lib/contentApi.js";
import {
  getActiveNavRoute,
  getCardsPerView,
  getRouteFromHash,
  getSelectedEvent,
  getSelectedProgram,
  readAdminSession,
  readStoredEvents,
  readStoredPrograms,
  readStoredPortfolios,
  readStoredUsers,
  readStoredSocialLinks,
  normalizePortfolioCategories,
  normalizeUserEntries
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
  const [events, setEvents] = useState(() => readStoredEvents());
  const [programs, setPrograms] = useState(() => readStoredPrograms());
  const [portfolios, setPortfolios] = useState(() => readStoredPortfolios());
  const [socialLinks, setSocialLinks] = useState(() => readStoredSocialLinks());
  const [users, setUsers] = useState(() => readStoredUsers());
  const [messages, setMessages] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => readAdminSession());
  const [adminError, setAdminError] = useState("");
  const [saveError, setSaveError] = useState("");
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
        const nextPortfolios = normalizePortfolioCategories(content.portfolios);
        setPortfolios(nextPortfolios);
        setSocialLinks(Array.isArray(content.socialLinks) ? content.socialLinks : []);
        setUsers(normalizeUserEntries(content.users, nextPortfolios));
        setContentSource("api");
      } catch {
        if (!active) {
          return;
        }

        setEvents([]);
        setPrograms(readStoredPrograms());
        setPortfolios(readStoredPortfolios());
        setSocialLinks(readStoredSocialLinks());
        setUsers(readStoredUsers());
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
    let active = true;

    async function loadMessages() {
      try {
        const content = await fetchMessages();
        if (!active) {
          return;
        }

        setMessages(Array.isArray(content.messages) ? content.messages : []);
      } catch {
        if (active) {
          setMessages([]);
        }
      }
    }

    loadMessages();

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
    window.localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(portfolios));
    window.localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(socialLinks));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [events, programs, portfolios, socialLinks, users, isContentReady]);

  async function persistContent(nextContent) {
    try {
      await saveSiteContent(nextContent);
      setContentSource("api");
      setSaveError("");
      return true;
    } catch (error) {
      console.error("Failed to save site content:", error);
      setSaveError(
        "We could not save your changes right now. Please try again in a moment."
      );
      return false;
    }
  }

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

  async function handleSaveEvent(event) {
    const nextEvents = events.some((item) => item.id === event.id)
      ? events.map((item) => (item.id === event.id ? event : item))
      : [...events, event];

    setEvents(nextEvents);
    return persistContent({
      events: nextEvents,
      programs,
      socialLinks,
      users
    });
  }

  async function handleDeleteEvent(eventId) {
    const nextEvents = events.filter((item) => item.id !== eventId);

    setEvents(nextEvents);
    return persistContent({
      events: nextEvents,
      programs,
      socialLinks,
      users
    });
  }

  async function handleSaveProgram(program) {
    const nextPrograms = programs.some((item) => (item.id || item.slug) === (program.id || program.slug))
      ? programs.map((item) => ((item.id || item.slug) === (program.id || program.slug) ? program : item))
      : [...programs, program];

    setPrograms(nextPrograms);
    return persistContent({
      events,
      programs: nextPrograms,
      socialLinks,
      users
    });
  }

  async function handleDeleteProgram(programId) {
    const nextPrograms = programs.filter((item) => (item.id || item.slug) !== programId);

    setPrograms(nextPrograms);
    return persistContent({
      events,
      programs: nextPrograms,
      socialLinks,
      users
    });
  }

  async function handleSaveSocialLink(link) {
    const nextSocialLinks = socialLinks.some((item) => item.id === link.id)
      ? socialLinks.map((item) => (item.id === link.id ? link : item))
      : [...socialLinks, link];

    setSocialLinks(nextSocialLinks);
    return persistContent({
      events,
      programs,
      socialLinks: nextSocialLinks,
      users
    });
  }

  async function handleDeleteSocialLink(linkId) {
    const nextSocialLinks = socialLinks.filter((item) => item.id !== linkId);

    setSocialLinks(nextSocialLinks);
    return persistContent({
      events,
      programs,
      socialLinks: nextSocialLinks,
      users
    });
  }

  async function handleSaveUser(userEntry) {
    const nextUsers = users.some((item) => (item.id || item.user?.name) === (userEntry.id || userEntry.user?.name))
      ? users.map((item) => ((item.id || item.user?.name) === (userEntry.id || userEntry.user?.name) ? userEntry : item))
      : [...users, userEntry];

    setUsers(nextUsers);
    return persistContent({
      events,
      programs,
      socialLinks,
      users: nextUsers
    });
  }

  async function handleDeleteUser(userId) {
    const nextUsers = users.filter((item) => (item.id || item.user?.name) !== userId);

    setUsers(nextUsers);
    return persistContent({
      events,
      programs,
      socialLinks,
      users: nextUsers
    });
  }

  async function handleSavePortfolio(portfolioEntry) {
    const nextPortfolios = portfolios.some((item) => item.id === portfolioEntry.id)
      ? portfolios.map((item) => (item.id === portfolioEntry.id ? portfolioEntry : item))
      : [...portfolios, portfolioEntry];

    const normalizedPortfolios = normalizePortfolioCategories(nextPortfolios);
    setPortfolios(normalizedPortfolios);
    return persistContent({
      events,
      programs,
      portfolios: normalizedPortfolios,
      socialLinks,
      users
    });
  }

  async function handleMovePortfolio(portfolioId, direction) {
    const sortedPortfolios = [...portfolios].sort((left, right) => {
      const leftOrder = Number.parseInt(String(left.displayOrder ?? 0), 10);
      const rightOrder = Number.parseInt(String(right.displayOrder ?? 0), 10);

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return String(left.label || "").localeCompare(String(right.label || ""));
    });

    const currentIndex = sortedPortfolios.findIndex((item) => item.id === portfolioId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedPortfolios.length) {
      return false;
    }

    const nextPortfolios = sortedPortfolios.map((item) => ({ ...item }));
    const currentItem = nextPortfolios[currentIndex];
    const targetItem = nextPortfolios[targetIndex];
    const currentOrder = currentItem.displayOrder;
    currentItem.displayOrder = targetItem.displayOrder;
    targetItem.displayOrder = currentOrder;

    const normalizedPortfolios = normalizePortfolioCategories(nextPortfolios);
    setPortfolios(normalizedPortfolios);

    return persistContent({
      events,
      programs,
      portfolios: normalizedPortfolios,
      socialLinks,
      users
    });
  }

  async function handleDeletePortfolio(portfolioId) {
    if (portfolios.length <= 1) {
      return false;
    }

    const remainingPortfolios = portfolios.filter((item) => item.id !== portfolioId);
    const normalizedPortfolios = normalizePortfolioCategories(remainingPortfolios);
    const fallbackPortfolio = normalizedPortfolios[0];
    const nextUsers = users.map((entry) => {
      const user = entry.user ?? entry;
      if ((user.portfolioId || "") !== portfolioId) {
        return entry;
      }

      return {
        ...entry,
        user: {
          ...user,
          portfolioId: fallbackPortfolio?.id || "",
          portfolio: fallbackPortfolio?.label || user.portfolio
        }
      };
    });

    setPortfolios(normalizedPortfolios);
    setUsers(nextUsers);
    return persistContent({
      events,
      programs,
      portfolios: normalizedPortfolios,
      socialLinks,
      users: nextUsers
    });
  }

  async function handleSubmitMessage(message) {
    const created = await createMessage(message);
    const nextMessage = created.message;

    if (nextMessage) {
      setMessages((current) => [nextMessage, ...current.filter((item) => item.id !== nextMessage.id)]);
    }

    return nextMessage;
  }

  async function handleUpdateMessage(message) {
    const updated = await updateMessage(message);
    const nextMessage = updated.message;

    if (nextMessage) {
      setMessages((current) => current.map((item) => (item.id === nextMessage.id ? nextMessage : item)));
    } else if (message.status === "deleted") {
      setMessages((current) => current.filter((item) => item.id !== message.id));
    }

    return nextMessage;
  }

  async function handleDeleteMessage(messageId) {
    await deleteMessage(messageId);
    setMessages((current) => current.filter((item) => item.id !== messageId));
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
          portfolios={portfolios}
          onSavePortfolio={handleSavePortfolio}
          onDeletePortfolio={handleDeletePortfolio}
          onMovePortfolio={handleMovePortfolio}
          messages={messages}
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          saveError={saveError}
        />
      ) : (
        <AdminLogin onLogin={handleAdminLogin} error={adminError} />
      );
    }

    switch (route) {
      case "about":
        return <AboutPage users={users} portfolios={portfolios} />;
      case "team":
        return <TeamPage users={users} portfolios={portfolios} />;
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
        return <ContactPage onSubmitMessage={handleSubmitMessage} />;
      case "socials":
        return <SocialsPage socialLinks={socialLinks} />;
      case "home":
      default:
        return <HomePage events={events} programs={programs} users={users} portfolios={portfolios} isMobile={isMobile} onOpenTeamPage={openTeamPage} />;
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
