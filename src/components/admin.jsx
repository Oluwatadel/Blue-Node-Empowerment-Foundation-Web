import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatEventDate,
  getPortfolioCategoryByIdOrLabel,
  normalizePortfolioCategories,
  normalizePortfolioValue,
  normalizeTeamDisplayOrder,
  sortPortfolioCategories,
  sortTeamEntries,
  slugify
} from "../lib/siteUtils.js";
import { careerOptions, defaultPortfolioCategories, socialIconOptions } from "../content/siteContent.js";
import { ManagedImage } from "./shared.jsx";

function ModalShell({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onClose}>
      <div className="admin-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <p className="admin-card-label">{subtitle}</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        {children}
        <div className="admin-modal-footer">{footer}</div>
      </div>
    </div>
  );
}

function TableCard({ title, subtitle, createLabel, onCreate, columns, children, tableClassName = "" }) {
  return (
    <article className="admin-content-card admin-table-card">
      <div className="admin-section-head">
        <div>
          <p className="admin-card-label">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        {createLabel && onCreate ? (
          <button type="button" className="btn secondary" onClick={onCreate}>
            {createLabel}
          </button>
        ) : null}
      </div>
      <div className="admin-table-wrap">
        <table className={tableClassName ? `admin-table ${tableClassName}` : "admin-table"}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </article>
  );
}

function normalizeGalleryImageIds(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getEditableGalleryImageIds(value) {
  const galleryImageIds = normalizeGalleryImageIds(value);
  return galleryImageIds.length > 0 ? galleryImageIds : [""];
}

export function AdminLogin({ onLogin, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    onLogin({ username, password });
  }

  return (
    <main className="page-main admin-login-page">
      <section className="admin-login-stage">
        <div className="admin-login-shell">
          <div className="admin-login-panel admin-login-copy">
            <div className="admin-login-brand-row">
              <img src="/assets/images/logo.PNG" alt="Blue Node Foundation" className="admin-login-brand-mark" />
              <span className="admin-login-brand-pill">Secure access</span>
            </div>
            <p className="section-kicker admin-login-kicker">Admin dashboard</p>
            <h2>Sign in to manage the Blue Node website.</h2>
            <p className="page-intro">
              Access the content management area to publish events, update timelines, and keep the Blue Node website accurate.
            </p>

            <div className="admin-login-highlights" aria-hidden="true">
              <span>Events</span>
              <span>Programs</span>
              <span>Users</span>
              <span>Social links</span>
            </div>

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
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-login-visibility-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
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
                Manage public updates from one place with a calm, focused workflow built for the Blue Node team.
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

export function AdminDashboard({
  events,
  programs,
  portfolios,
  socialLinks,
  users,
  messages,
  onLogout,
  onSaveEvent,
  onEditEvent,
  onDeleteEvent,
  onSaveProgram,
  onDeleteProgram,
  onSaveSocialLink,
  onDeleteSocialLink,
  onSaveUser,
  onDeleteUser,
  onSavePortfolio,
  onDeletePortfolio,
  onMovePortfolio,
  onUpdateMessage,
  onDeleteMessage,
  editingEvent,
  setEditingEvent,
  saveError
}) {
  const emptyEventForm = {
    id: "",
    title: "",
    location: "",
    dateTime: "",
    description: "",
    flyerImage: ""
  };
  const emptyProgramForm = {
    id: "",
    slug: "",
    title: "",
    body: "",
    imageId: "",
    galleryImageIds: ["", ""]
  };
  const portfolioChoices = sortPortfolioCategories(
    normalizePortfolioCategories(portfolios?.length ? portfolios : defaultPortfolioCategories)
  );
  const emptyUserForm = {
    id: "",
    name: "",
    portfolioId: portfolioChoices[0]?.id || "",
    displayOrder: "",
    imageUrl: "",
    phoneNumber: "",
    email: "",
    career: careerOptions[0],
    careerOther: ""
  };
  const emptyPortfolioForm = {
    id: "",
    label: "",
    displayOrder: ""
  };
  const emptySocialForm = {
    id: "",
    name: "",
    href: "",
    icon: socialIconOptions[0],
    handle: "",
    description: ""
  };

  const [activeSection, setActiveSection] = useState("overview");
  const [eventFormState, setEventFormState] = useState(emptyEventForm);
  const [programFormState, setProgramFormState] = useState(emptyProgramForm);
  const [userFormState, setUserFormState] = useState(emptyUserForm);
  const [portfolioFormState, setPortfolioFormState] = useState(emptyPortfolioForm);
  const [socialFormState, setSocialFormState] = useState(emptySocialForm);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const [galleryEditorProgram, setGalleryEditorProgram] = useState(null);
  const [galleryEditorState, setGalleryEditorState] = useState(null);
  const [galleryAddDraft, setGalleryAddDraft] = useState("");
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime)),
    [events]
  );
  const upcomingCount = sortedEvents.length;
  const nextEvent = sortedEvents[0];
  const sortedMessages = useMemo(
    () =>
      [...(Array.isArray(messages) ? messages : [])].sort(
        (left, right) => {
          const leftPriority = left.status === "read" ? 0 : 1;
          const rightPriority = right.status === "read" ? 0 : 1;

          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }

          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
        }
      ),
    [messages]
  );
  const unreadMessagesCount = sortedMessages.filter((message) => message.status === "new").length;
  const portfolioStats = portfolioChoices.map((portfolio) => ({
    ...portfolio,
    count: users.filter((entry) => {
      const user = entry.user ?? entry;
      return user.portfolioId === portfolio.id || user.portfolio === portfolio.label;
    }).length
  }));
  const adminSections = [
    { id: "overview", label: "Overview" },
    { id: "events", label: "Events" },
    { id: "programs", label: "Programs" },
    { id: "gallery", label: "Gallery content" },
    { id: "users", label: "User management" },
    { id: "portfolios", label: "Portfolio management" },
    { id: "messages", label: "Messages", badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { id: "socials", label: "Social media" }
  ];

  useEffect(() => {
    if (editingEvent) {
      setEventFormState({
        ...emptyEventForm,
        ...editingEvent
      });
      setEventModalOpen(true);
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
        galleryImageIds: getEditableGalleryImageIds(editingProgram.galleryImageIds)
      });
      setProgramModalOpen(true);
    }
  }, [editingProgram]);

  useEffect(() => {
    if (editingUser) {
      const user = editingUser.user ?? editingUser;
      const matchedPortfolio =
        getPortfolioCategoryByIdOrLabel(user.portfolioId || user.portfolio, portfolioChoices) || portfolioChoices[0];
      setUserFormState({
        id: editingUser.id || "",
        name: user.name || "",
        portfolioId: matchedPortfolio?.id || portfolioChoices[0]?.id || "",
        displayOrder: normalizeTeamDisplayOrder(user.displayOrder ?? editingUser.displayOrder, ""),
        imageUrl: user.imageUrl || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        career: careerOptions.includes(user.career) ? user.career : "Other",
        careerOther: careerOptions.includes(user.career) ? "" : user.career || ""
      });
      setUserModalOpen(true);
    }
  }, [editingUser]);

  useEffect(() => {
    if (editingPortfolio) {
      setPortfolioFormState({
        id: editingPortfolio.id || "",
        label: editingPortfolio.label || "",
        displayOrder: String(editingPortfolio.displayOrder || "")
      });
      setPortfolioModalOpen(true);
    }
  }, [editingPortfolio]);

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
      setSocialModalOpen(true);
    }
  }, [editingSocialLink]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1100) {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!isProfileMenuOpen) {
        return;
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isProfileMenuOpen]);

  function resetEventModal() {
    setEventModalOpen(false);
    setEditingEvent(null);
    setEventFormState(emptyEventForm);
  }

  function resetProgramModal() {
    setProgramModalOpen(false);
    setEditingProgram(null);
    setProgramFormState(emptyProgramForm);
  }

  function resetUserModal() {
    setUserModalOpen(false);
    setEditingUser(null);
    setUserFormState(emptyUserForm);
  }

  function resetPortfolioModal() {
    setPortfolioModalOpen(false);
    setEditingPortfolio(null);
    setPortfolioFormState(emptyPortfolioForm);
  }

  function resetSocialModal() {
    setSocialModalOpen(false);
    setEditingSocialLink(null);
    setSocialFormState(emptySocialForm);
  }

  function toggleSidebar() {
    setIsSidebarOpen((current) => !current);
  }

  function toggleProfileMenu() {
    setIsProfileMenuOpen((current) => !current);
  }

  function handleLogout() {
    setIsProfileMenuOpen(false);
    onLogout();
  }

  function selectSection(sectionId) {
    setActiveSection(sectionId);
    if (window.innerWidth <= 1100) {
      setIsSidebarOpen(false);
    }
  }

  function openEventCreate() {
    setEditingEvent(null);
    setEventFormState(emptyEventForm);
    setEventModalOpen(true);
  }

  function openEventEdit(event) {
    setEditingEvent(event);
    setEventFormState({
      ...emptyEventForm,
      ...event
    });
    setEventModalOpen(true);
  }

  function openProgramCreate() {
    setEditingProgram(null);
    setProgramFormState({
      ...emptyProgramForm,
      galleryImageIds: ["", ""]
    });
    setProgramModalOpen(true);
  }

  function openProgramEdit(program) {
    setEditingProgram(program);
    setProgramFormState({
      id: program.id || program.slug || "",
      slug: program.slug || "",
      title: program.title || "",
      body: program.body || "",
      imageId: program.imageId || "",
      galleryImageIds: getEditableGalleryImageIds(program.galleryImageIds)
    });
    setProgramModalOpen(true);
  }

  function openUserCreate() {
    setEditingUser(null);
    setUserFormState({
      ...emptyUserForm,
      displayOrder: String(users.length + 1)
    });
    setUserModalOpen(true);
  }

  function openUserEdit(entry) {
    const user = entry.user ?? entry;
    setEditingUser(entry);
    setUserFormState({
      id: entry.id || "",
      name: user.name || "",
      portfolioId:
        getPortfolioCategoryByIdOrLabel(user.portfolioId || user.portfolio, portfolioChoices)?.id ||
        portfolioChoices[0]?.id ||
        "",
      displayOrder: normalizeTeamDisplayOrder(user.displayOrder ?? entry.displayOrder, ""),
      imageUrl: user.imageUrl || "",
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      career: careerOptions.includes(user.career) ? user.career : "Other",
      careerOther: careerOptions.includes(user.career) ? "" : user.career || ""
    });
    setUserModalOpen(true);
  }

  function openPortfolioCreate() {
    setEditingPortfolio(null);
    setPortfolioFormState({
      ...emptyPortfolioForm,
      displayOrder: String(portfolioChoices.length + 1)
    });
    setPortfolioModalOpen(true);
  }

  function openPortfolioEdit(portfolio) {
    setEditingPortfolio(portfolio);
    setPortfolioFormState({
      id: portfolio.id || "",
      label: portfolio.label || "",
      displayOrder: String(portfolio.displayOrder || "")
    });
    setPortfolioModalOpen(true);
  }

  function openSocialCreate() {
    setEditingSocialLink(null);
    setSocialFormState(emptySocialForm);
    setSocialModalOpen(true);
  }

  function openSocialEdit(link) {
    setEditingSocialLink(link);
    setSocialFormState({
      id: link.id || "",
      name: link.name || "",
      href: link.href || "",
      icon: link.icon || socialIconOptions[0],
      handle: link.handle || "",
      description: link.description || ""
    });
    setSocialModalOpen(true);
  }

  async function saveEvent() {
    const saved = await onSaveEvent({
      ...eventFormState,
      id: eventFormState.id || `event-${Date.now()}`
    });

    if (saved !== false) {
      resetEventModal();
    }
  }

  async function saveProgram() {
    const slug = programFormState.slug || slugify(programFormState.title);
    const saved = await onSaveProgram({
      id: programFormState.id || slug || `program-${Date.now()}`,
      slug,
      title: programFormState.title,
      body: programFormState.body,
      imageId: programFormState.imageId,
      galleryImageIds: normalizeGalleryImageIds(programFormState.galleryImageIds)
    });

    if (saved !== false) {
      resetProgramModal();
    }
  }

  function updateProgramGalleryImage(index, value) {
    setProgramFormState((current) => ({
      ...current,
      galleryImageIds: current.galleryImageIds.map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  }

  function addProgramGalleryImage() {
    setProgramFormState((current) => ({
      ...current,
      galleryImageIds: [...current.galleryImageIds, ""]
    }));
  }

  function removeProgramGalleryImage(index) {
    setProgramFormState((current) => {
      const nextGallery = current.galleryImageIds.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        galleryImageIds: nextGallery.length > 0 ? nextGallery : [""]
      };
    });
  }

  async function saveUser() {
    const careerValue =
      userFormState.career === "Other"
        ? userFormState.careerOther.trim() || "Other"
        : userFormState.career;
    const selectedPortfolio =
      getPortfolioCategoryByIdOrLabel(userFormState.portfolioId, portfolioChoices) || portfolioChoices[0];

    const saved = await onSaveUser({
      id: userFormState.id || `user-${Date.now()}`,
      user: {
        name: userFormState.name,
        portfolioId: selectedPortfolio?.id || "",
        portfolio: selectedPortfolio?.label || "",
        displayOrder: normalizeTeamDisplayOrder(userFormState.displayOrder, users.length + 1),
        imageUrl: userFormState.imageUrl,
        phoneNumber: userFormState.phoneNumber,
        email: userFormState.email,
        career: careerValue
      }
    });

    if (saved !== false) {
      resetUserModal();
    }
  }

  async function saveSocialLink() {
    const saved = await onSaveSocialLink({
      id: socialFormState.id || `social-${Date.now()}`,
      name: socialFormState.name,
      href: socialFormState.href,
      icon: socialFormState.icon,
      handle: socialFormState.handle,
      description: socialFormState.description
    });

    if (saved !== false) {
      resetSocialModal();
    }
  }

  async function savePortfolio() {
    const saved = await onSavePortfolio({
      id: portfolioFormState.id || `portfolio-${Date.now()}`,
      label: String(portfolioFormState.label || "").trim(),
      displayOrder: normalizeTeamDisplayOrder(portfolioFormState.displayOrder, portfolioChoices.length + 1)
    });

    if (saved !== false) {
      resetPortfolioModal();
    }
  }

  function askDelete(kind, item) {
    const id =
      kind === "event"
        ? item.id
        : kind === "program"
          ? item.slug
          : kind === "user"
            ? item.id || item.user?.name || item.name
            : kind === "portfolio"
              ? item.id
            : item.id;
    const label =
      kind === "event"
        ? item.title
        : kind === "program"
          ? item.title
          : kind === "user"
            ? item.user?.name || item.name
            : kind === "portfolio"
              ? item.label
            : item.name;

    setDeleteTarget({ kind, id, label });
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      if (deleteTarget.kind === "event") {
        await onDeleteEvent(deleteTarget.id);
        if (editingEvent?.id === deleteTarget.id) {
          resetEventModal();
        }
      }

      if (deleteTarget.kind === "program") {
        await onDeleteProgram(deleteTarget.id);
        if (editingProgram && (editingProgram.slug === deleteTarget.id || editingProgram.id === deleteTarget.id)) {
          resetProgramModal();
        }
      }

      if (deleteTarget.kind === "user") {
        await onDeleteUser(deleteTarget.id);
        if ((editingUser?.id || editingUser?.user?.name || editingUser?.name) === deleteTarget.id) {
          resetUserModal();
        }
      }

      if (deleteTarget.kind === "social") {
        await onDeleteSocialLink(deleteTarget.id);
        if (editingSocialLink?.id === deleteTarget.id) {
          resetSocialModal();
        }
      }

      if (deleteTarget.kind === "portfolio") {
        await onDeletePortfolio(deleteTarget.id);
        if (editingPortfolio?.id === deleteTarget.id) {
          resetPortfolioModal();
        }
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  const userRows = sortTeamEntries(users, portfolioChoices).map((entry) => ({
    id: entry.id || entry.user?.name || entry.name,
    data: {
      ...(entry.user ?? entry),
      portfolio: normalizePortfolioValue((entry.user ?? entry).portfolio),
      portfolioId: (entry.user ?? entry).portfolioId || "",
      displayOrder: normalizeTeamDisplayOrder((entry.user ?? entry).displayOrder ?? entry.displayOrder)
    }
  }));

  const programsWithGallery = programs.map((program) => ({
    ...program,
    galleryImageIds: Array.isArray(program.galleryImageIds) ? program.galleryImageIds : []
  }));

  function renderTableRows(rows, renderRow) {
    return rows.map(renderRow);
  }

  function openGalleryManager(program) {
    setGalleryEditorProgram(program);
    setGalleryEditorState({
      ...program,
      galleryImageIds: Array.isArray(program.galleryImageIds) && program.galleryImageIds.length ? [...program.galleryImageIds] : [""]
    });
    setGalleryAddDraft("");
    setGalleryModalOpen(true);
  }

  function resetGalleryModal() {
    setGalleryModalOpen(false);
    setGalleryEditorProgram(null);
    setGalleryEditorState(null);
    setGalleryAddDraft("");
  }

  function updateGalleryImage(index, value) {
    setGalleryEditorState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        galleryImageIds: current.galleryImageIds.map((item, itemIndex) => (itemIndex === index ? value : item))
      };
    });
  }

  function addGalleryImageRow() {
    setGalleryEditorState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        galleryImageIds: [...current.galleryImageIds, ""]
      };
    });
  }

  function removeGalleryImageRow(index) {
    setGalleryEditorState((current) => {
      if (!current) {
        return current;
      }

      const nextGallery = current.galleryImageIds.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        galleryImageIds: nextGallery.length > 0 ? nextGallery : [""]
      };
    });
  }

  function appendGalleryDraft() {
    const additions = normalizeGalleryImageIds(galleryAddDraft);
    if (!additions.length) {
      return;
    }

    setGalleryEditorState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        galleryImageIds: [...current.galleryImageIds, ...additions]
      };
    });
    setGalleryAddDraft("");
  }

  function saveGalleryChanges() {
    if (!galleryEditorState) {
      return;
    }

    onSaveProgram({
      ...galleryEditorState,
      galleryImageIds: normalizeGalleryImageIds(galleryEditorState.galleryImageIds)
    });
    resetGalleryModal();
  }

  return (
    <main className="admin-main-page">
      <section className={isSidebarOpen ? "admin-shell sidebar-open" : "admin-shell"}>
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close admin menu"
          aria-hidden={!isSidebarOpen}
          tabIndex={isSidebarOpen ? 0 : -1}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <img src="/assets/images/logo.PNG" alt="Blue Node Foundation" className="admin-sidebar-logo" />
            <div>
              <p className="section-kicker">Blue Node</p>
              <h2>Admin</h2>
            </div>
          </div>

          <div className="admin-profile-card">
            <div className="admin-profile-avatar" aria-hidden="true">
              BN
            </div>
            <div className="admin-profile-copy">
              <strong>Blue Node Admin</strong>
              <span>Premium user</span>
            </div>
          </div>

          <p className="admin-menu-label">Main Menu</p>
          <nav className="admin-nav" aria-label="Admin sections">
            {adminSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? "active" : undefined}
                onClick={() => selectSection(section.id)}
              >
                <span className="admin-nav-dot" aria-hidden="true" />
                <span className="admin-nav-label">{section.label}</span>
                {section.badge ? <span className="admin-nav-badge">{section.badge}</span> : null}
                <span className="admin-nav-arrow" aria-hidden="true">
                  {">"}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="admin-dashboard">
          <div className="admin-toolbar">
            <div className="admin-toolbar-left">
              <button
                type="button"
                className="admin-toolbar-menu"
                aria-label={isSidebarOpen ? "Close admin menu" : "Open admin menu"}
                aria-expanded={isSidebarOpen}
                onClick={toggleSidebar}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
            <div className="admin-toolbar-search">
              <input type="search" placeholder="Search Here" aria-label="Search dashboard" />
            </div>
            <div className="admin-toolbar-right" ref={profileMenuRef}>
              <button
                type="button"
                className="admin-toolbar-profile"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={toggleProfileMenu}
              >
                <span className="admin-toolbar-avatar">A</span>
                <span className="admin-toolbar-profile-copy">
                  <strong>Admin</strong>
                  <span>Profile</span>
                </span>
                <span className="admin-toolbar-profile-caret" aria-hidden="true">
                  {"▾"}
                </span>
              </button>

              {isProfileMenuOpen ? (
                <div className="admin-profile-dropdown" role="menu" aria-label="Profile menu">
                  <button type="button" className="admin-profile-dropdown-item" onClick={handleLogout} role="menuitem">
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {saveError ? (
            <p className="admin-error" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="admin-hero">
            <div>
              <p className="section-kicker">Dashboard</p>
              <h2>
                {activeSection === "overview" && "Website content overview"}
                {activeSection === "events" && "Manage upcoming events"}
                {activeSection === "programs" && "Manage programs and galleries"}
                {activeSection === "gallery" && "Manage gallery content"}
                {activeSection === "users" && "Manage users and team members"}
                {activeSection === "socials" && "Manage social media presence"}
              </h2>
              <p className="page-intro">
                {activeSection === "overview" &&
                  "Review everything in one screen, then jump into the dedicated sections when you need to edit content."}
                {activeSection === "events" &&
                  "Create and maintain event listings that power the home page countdown and spotlight section."}
                {activeSection === "programs" &&
                  "Update program titles, descriptions, cover images, and gallery image collections shown publicly."}
                {activeSection === "gallery" &&
                  "Refine the images attached to each program gallery and keep the public photo pages current."}
                {activeSection === "users" &&
                  "Keep user profiles, roles, photos, contact details, and career notes current across the public team section."}
                {activeSection === "portfolios" &&
                  "Review the portfolio categories available to the team and how many users are assigned to each."}
                {activeSection === "messages" &&
                  "Review incoming contact messages, mark them as read, and remove anything that is no longer needed."}
                {activeSection === "socials" &&
                  "Keep the home and socials pages current with the right links, handles, and platform descriptions."}
              </p>
            </div>
            <div className="admin-hero-badges" aria-hidden="true">
              <span className="admin-hero-badge">Fast edits</span>
              <span className="admin-hero-badge">Public sync</span>
              <span className="admin-hero-badge">Secure session</span>
            </div>
          </div>

          <div className="admin-content-scroll">
            {activeSection === "overview" ? (
              <>
                <div className="admin-metric-row">
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Scheduled events</span>
                    <strong>{upcomingCount}</strong>
                    <p>{nextEvent ? nextEvent.title : "No event is currently scheduled."}</p>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Programs</span>
                    <strong>{programs.length}</strong>
                    <p>Gallery-driven program areas currently published on the website.</p>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Gallery items</span>
                    <strong>{programs.reduce((total, program) => total + (program.galleryImageIds?.length || 0), 0)}</strong>
                    <p>Total gallery images attached to all published programs.</p>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Users</span>
                    <strong>{users.length}</strong>
                    <p>User profiles shown publicly on the About page and editable here.</p>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Portfolios</span>
                    <strong>{portfolioStats.length}</strong>
                    <p>Available team portfolio categories and how many profiles use each one.</p>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Messages</span>
                    <strong>{sortedMessages.length}</strong>
                    <p>{unreadMessagesCount} unread contact messages waiting in the inbox.</p>
                  </article>
                  <article className="admin-metric-card">
                    <span className="admin-stat-label">Social channels</span>
                    <strong>{socialLinks.length}</strong>
                    <p>Channels available across the home footer and the dedicated socials page.</p>
                  </article>
                </div>

                <div className="admin-overview-grid">
                  <TableCard
                    title="Events"
                    subtitle="Overview"
                    columns={["Title", "Date", "Location"]}
                  >
                    {renderTableRows(sortedEvents, (event) => (
                      <tr key={event.id}>
                        <td data-label="Title">{event.title}</td>
                        <td data-label="Date">{formatEventDate(event.dateTime)}</td>
                        <td data-label="Location">{event.location}</td>
                      </tr>
                    ))}
                  </TableCard>

                  <TableCard
                    title="Programs"
                    subtitle="Overview"
                    columns={["Title", "Slug", "Body"]}
                  >
                    {renderTableRows(programs, (program) => (
                      <tr key={program.slug}>
                        <td data-label="Title">{program.title}</td>
                        <td data-label="Slug">{program.slug}</td>
                        <td data-label="Body">{program.body}</td>
                      </tr>
                    ))}
                  </TableCard>

                  <TableCard
                    title="Portfolio management"
                    subtitle="Overview"
                    columns={["Portfolio", "Users", "Status"]}
                  >
                    {renderTableRows(portfolioStats, (item) => (
                      <tr key={item.portfolio}>
                        <td data-label="Portfolio">{item.portfolio}</td>
                        <td data-label="Users">{item.count}</td>
                        <td data-label="Status">{item.count > 0 ? "Active" : "Unused"}</td>
                      </tr>
                    ))}
                  </TableCard>

                  <TableCard
                    title="User management"
                    subtitle="Overview"
                    columns={["Name", "Portfolio", "Order", "Email"]}
                    tableClassName="admin-user-table"
                  >
                    {renderTableRows(userRows, (entry) => (
                      <tr key={entry.id}>
                        <td data-label="Name">
                          <div className="admin-user-cell">
                            <ManagedImage
                              source={entry.data.imageUrl || "/assets/images/Bluenode.jpg"}
                              alt={entry.data.name}
                              className="admin-user-mini"
                            />
                            <span>{entry.data.name}</span>
                          </div>
                        </td>
                        <td data-label="Portfolio">{entry.data.portfolio}</td>
                        <td data-label="Order">{entry.data.displayOrder}</td>
                        <td data-label="Email">{entry.data.email || "No email assigned"}</td>
                      </tr>
                    ))}
                  </TableCard>

                  <TableCard
                    title="Social media"
                    subtitle="Overview"
                    columns={["Platform", "Handle", "Link"]}
                    tableClassName="admin-social-table"
                  >
                    {renderTableRows(socialLinks, (link) => (
                      <tr key={link.id}>
                        <td data-label="Platform">{link.name}</td>
                        <td data-label="Handle">{link.handle}</td>
                        <td data-label="Link">{link.href}</td>
                      </tr>
                    ))}
                  </TableCard>
                </div>
              </>
            ) : null}

            {activeSection === "events" ? (
              <TableCard
                title="Events"
                subtitle="Manage"
                createLabel="Create event"
                onCreate={openEventCreate}
                columns={["Title", "Date", "Location", "Actions"]}
              >
                {renderTableRows(sortedEvents, (event) => (
                  <tr key={event.id}>
                    <td data-label="Title">{event.title}</td>
                    <td data-label="Date">{formatEventDate(event.dateTime)}</td>
                    <td data-label="Location">{event.location}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button type="button" className="btn secondary" onClick={() => openEventEdit(event)}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={() => askDelete("event", event)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}

            {activeSection === "programs" ? (
              <TableCard
                title="Programs"
                subtitle="Manage"
                createLabel="Create program"
                onCreate={openProgramCreate}
                columns={["Title", "Slug", "Body", "Actions"]}
              >
                {renderTableRows(programs, (program) => (
                  <tr key={program.slug}>
                    <td data-label="Title">{program.title}</td>
                    <td data-label="Slug">{program.slug}</td>
                    <td data-label="Body">{program.body}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button type="button" className="btn secondary" onClick={() => openProgramEdit(program)}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={() => askDelete("program", program)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}

            {activeSection === "gallery" ? (
              <TableCard title="Gallery content" subtitle="Manage" columns={["Program", "Gallery images", "Actions"]}>
                {renderTableRows(programsWithGallery, (program) => (
                  <tr key={program.slug}>
                    <td data-label="Program">
                      <div className="admin-user-cell">
                        <ManagedImage
                          source={program.imageId || "/assets/images/Bluenode.jpg"}
                          alt={program.title}
                          className="admin-user-mini"
                        />
                        <span>{program.title}</span>
                      </div>
                    </td>
                    <td data-label="Gallery images">{program.galleryImageIds.length}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button type="button" className="btn secondary" onClick={() => openGalleryManager(program)}>
                          Manage images
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}

            {activeSection === "users" ? (
              <TableCard
                title="User management"
                subtitle="Manage"
                createLabel="Create user"
                onCreate={openUserCreate}
                columns={["Name", "Portfolio", "Order", "Email", "Actions"]}
                tableClassName="admin-user-table"
              >
                {renderTableRows(userRows, (entry) => (
                  <tr key={entry.id}>
                    <td data-label="Name">
                      <div className="admin-user-cell">
                        <ManagedImage
                          source={entry.data.imageUrl || "/assets/images/Bluenode.jpg"}
                          alt={entry.data.name}
                          className="admin-user-mini"
                        />
                        <span>{entry.data.name}</span>
                      </div>
                    </td>
                    <td data-label="Portfolio">{entry.data.portfolio}</td>
                    <td data-label="Order">{entry.data.displayOrder}</td>
                    <td data-label="Email">{entry.data.email || "No email assigned"}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button type="button" className="btn secondary" onClick={() => openUserEdit(entry)}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={() => askDelete("user", entry)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}

            {activeSection === "portfolios" ? (
              <TableCard
                title="Portfolio management"
                subtitle="Manage"
                createLabel="Create portfolio"
                onCreate={openPortfolioCreate}
                columns={["Portfolio", "Users", "Status", "Actions"]}
              >
                {renderTableRows(portfolioStats, (item, index) => (
                  <tr key={item.id}>
                    <td data-label="Portfolio">{item.label}</td>
                    <td data-label="Users">{item.count}</td>
                    <td data-label="Status">{item.count > 0 ? "Active" : "Unused"}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => onMovePortfolio(item.id, -1)}
                          disabled={index === 0}
                          aria-label="Move portfolio up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => onMovePortfolio(item.id, 1)}
                          disabled={index === portfolioStats.length - 1}
                          aria-label="Move portfolio down"
                        >
                          ↓
                        </button>
                        <button type="button" className="btn secondary" onClick={() => openPortfolioEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={() => askDelete("portfolio", item)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}

            {activeSection === "socials" ? (
              <TableCard
                title="Social media"
                subtitle="Manage"
                createLabel="Create social link"
                onCreate={openSocialCreate}
                columns={["Platform", "Handle", "Link", "Actions"]}
                tableClassName="admin-social-table"
              >
                {renderTableRows(socialLinks, (link) => (
                  <tr key={link.id}>
                    <td data-label="Platform">{link.name}</td>
                    <td data-label="Handle">{link.handle}</td>
                    <td data-label="Link">{link.href}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button type="button" className="btn secondary" onClick={() => openSocialEdit(link)}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={() => askDelete("social", link)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}

            {activeSection === "messages" ? (
              <TableCard
                title="Contact messages"
                subtitle="Manage"
                columns={["Name", "Email", "Message", "Status", "Date", "Actions"]}
                tableClassName="admin-message-table"
              >
                {renderTableRows(sortedMessages, (message) => (
                  <tr
                    key={message.id}
                    className={message.status === "read" ? "admin-message-row read" : "admin-message-row unread"}
                  >
                    <td data-label="Name">{message.name}</td>
                    <td data-label="Email">{message.email || "No email provided"}</td>
                    <td data-label="Message">{message.message}</td>
                    <td data-label="Status">{message.status}</td>
                    <td data-label="Date">{formatEventDate(message.createdAt)}</td>
                    <td data-label="Actions">
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => onUpdateMessage({ id: message.id, status: message.status === "new" ? "read" : "new" })}
                        >
                          {message.status === "new" ? "Mark read" : "Mark unread"}
                        </button>
                        <button type="button" className="btn danger" onClick={() => onDeleteMessage(message.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableCard>
            ) : null}
          </div>
        </div>
      </section>

      {eventModalOpen ? (
        <ModalShell
          title={editingEvent ? "Edit event" : "Create event"}
          subtitle={editingEvent ? "Editing" : "New content"}
          onClose={resetEventModal}
          footer={
            <>
              <button type="button" className="btn secondary" onClick={resetEventModal}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={saveEvent}>
                Save event
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-modal-form-grid">
            <label className="admin-span-2">
              Event title
              <input
                value={eventFormState.title}
                onChange={(event) => setEventFormState((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label>
              Location
              <input
                value={eventFormState.location}
                onChange={(event) => setEventFormState((current) => ({ ...current, location: event.target.value }))}
              />
            </label>
            <label>
              Event date and time
              <input
                type="datetime-local"
                value={eventFormState.dateTime}
                onChange={(event) => setEventFormState((current) => ({ ...current, dateTime: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Flyer image URL, Drive link, or ID
              <input
                value={eventFormState.flyerImage}
                onChange={(event) => setEventFormState((current) => ({ ...current, flyerImage: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Description
              <textarea
                rows="5"
                value={eventFormState.description}
                onChange={(event) => setEventFormState((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
          </div>
        </ModalShell>
      ) : null}

      {programModalOpen ? (
        <ModalShell
          title={editingProgram ? "Edit program" : "Create program"}
          subtitle={editingProgram ? "Editing" : "New content"}
          onClose={resetProgramModal}
          footer={
            <>
              <button type="button" className="btn secondary" onClick={resetProgramModal}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={saveProgram}>
                Save program
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-modal-form-grid">
            <label className="admin-span-2">
              Program title
              <input
                value={programFormState.title}
                onChange={(event) => setProgramFormState((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Slug
              <input
                value={programFormState.slug}
                onChange={(event) => setProgramFormState((current) => ({ ...current, slug: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Cover image URL, Drive link, or ID
              <input
                value={programFormState.imageId}
                onChange={(event) => setProgramFormState((current) => ({ ...current, imageId: event.target.value }))}
              />
            </label>
            <div className="admin-span-2 admin-gallery-editor">
              <div className="admin-gallery-editor-head">
                <div>
                  <p className="admin-card-label">Gallery content</p>
                  <strong>Program gallery images</strong>
                  <p className="admin-field-hint">Add one image ID or Drive link per row. Programs can have multiple gallery images, and we will save them in the order shown here.</p>
                </div>
                <button
                  type="button"
                  className="admin-gallery-add-button"
                  onClick={addProgramGalleryImage}
                  title="Add another image"
                  aria-label="Add another image"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>

              <div className="admin-gallery-list">
                {(programFormState.galleryImageIds.length ? programFormState.galleryImageIds : [""]).map((imageId, index) => (
                  <div className="admin-gallery-row" key={`${index}-${imageId || "blank"}`}>
                    <div className="admin-gallery-row-fields">
                      <input
                        value={imageId}
                        placeholder="Drive file ID or image URL"
                        onChange={(event) => updateProgramGalleryImage(index, event.target.value)}
                      />
                      <button
                        type="button"
                        className="btn danger admin-gallery-remove"
                        onClick={() => removeProgramGalleryImage(index)}
                        disabled={programFormState.galleryImageIds.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                    {imageId ? (
                      <div className="admin-gallery-preview">
                        <ManagedImage source={imageId} alt={`Gallery preview ${index + 1}`} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <label className="admin-span-2">
              Program body
              <textarea
                rows="5"
                value={programFormState.body}
                onChange={(event) => setProgramFormState((current) => ({ ...current, body: event.target.value }))}
              />
            </label>
          </div>
        </ModalShell>
      ) : null}

      {galleryModalOpen && galleryEditorState ? (
        <ModalShell
          title="Manage gallery images"
          subtitle={galleryEditorProgram ? galleryEditorProgram.title : "Gallery content"}
          onClose={resetGalleryModal}
          footer={
            <>
              <button type="button" className="btn secondary" onClick={resetGalleryModal}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={saveGalleryChanges}>
                Save gallery
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-modal-form-grid">
            <div className="admin-span-2 admin-gallery-editor">
              <div className="admin-gallery-add-row">
                <label className="admin-span-2">
                  Add image or more images
                  <textarea
                    rows="4"
                    placeholder="Paste one image ID or URL per line, or separate multiple values with commas"
                    value={galleryAddDraft}
                    onChange={(event) => setGalleryAddDraft(event.target.value)}
                  />
                </label>
                <p className="admin-field-hint">
                  Paste one or many Google Drive IDs, links, or image URLs. Click the plus button to append them to this program.
                </p>
                <button
                  type="button"
                  className="admin-gallery-add-button"
                  onClick={appendGalleryDraft}
                  title="Add another image"
                  aria-label="Add another image"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>

              <div className="admin-gallery-list">
                {galleryEditorState.galleryImageIds.length ? (
                  galleryEditorState.galleryImageIds.map((imageId, index) => (
                    <div className="admin-gallery-row" key={`${galleryEditorState.slug}-${index}-${imageId || "blank"}`}>
                      <div className="admin-gallery-row-fields">
                        <input
                          value={imageId}
                          placeholder="Drive file ID or image URL"
                          onChange={(event) => updateGalleryImage(index, event.target.value)}
                        />
                        <button
                          type="button"
                          className="btn danger admin-gallery-remove"
                          onClick={() => removeGalleryImageRow(index)}
                        >
                          Remove
                        </button>
                      </div>
                      {imageId ? (
                        <div className="admin-gallery-preview">
                          <ManagedImage source={imageId} alt={`Gallery preview ${index + 1}`} />
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="admin-field-hint">This gallery has no images yet. Add one above to begin.</p>
                )}
              </div>

              <button
                type="button"
                className="admin-gallery-add-button"
                onClick={addGalleryImageRow}
                title="Add another image"
                aria-label="Add another image"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {userModalOpen ? (
        <ModalShell
          title={editingUser ? "Edit user" : "Create user"}
          subtitle={editingUser ? "Editing" : "New content"}
          onClose={resetUserModal}
          footer={
            <>
              <button type="button" className="btn secondary" onClick={resetUserModal}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={saveUser}>
                Save user
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-modal-form-grid">
            <label className="admin-span-2">
              Full name
              <input
                value={userFormState.name}
                onChange={(event) => setUserFormState((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Portfolio
              <select
                value={userFormState.portfolio}
                onChange={(event) => setUserFormState((current) => ({ ...current, portfolio: event.target.value }))}
              >
                {portfolioOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Display order
              <input
                type="number"
                min="1"
                step="1"
                value={userFormState.displayOrder}
                onChange={(event) => setUserFormState((current) => ({ ...current, displayOrder: event.target.value }))}
              />
            </label>
            <p className="admin-span-2 admin-field-hint">
              Lower numbers appear first on the team page and in the admin list.
            </p>
            <label className="admin-span-2">
              Image URL, Drive link, or ID
              <input
                value={userFormState.imageUrl}
                onChange={(event) => setUserFormState((current) => ({ ...current, imageUrl: event.target.value }))}
              />
            </label>
            <label>
              Phone number
              <input
                value={userFormState.phoneNumber}
                onChange={(event) => setUserFormState((current) => ({ ...current, phoneNumber: event.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={userFormState.email}
                onChange={(event) => setUserFormState((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Career
              <select
                value={userFormState.career}
                onChange={(event) =>
                  setUserFormState((current) => ({
                    ...current,
                    career: event.target.value,
                    careerOther: event.target.value === "Other" ? current.careerOther : ""
                  }))
                }
              >
                {careerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {userFormState.career === "Other" ? (
              <label className="admin-span-2">
                Other career
                <input
                  value={userFormState.careerOther}
                  onChange={(event) =>
                    setUserFormState((current) => ({ ...current, careerOther: event.target.value }))
                  }
                />
              </label>
            ) : null}
          </div>
        </ModalShell>
      ) : null}

      {portfolioModalOpen ? (
        <ModalShell
          title={editingPortfolio ? "Edit portfolio" : "Create portfolio"}
          subtitle={editingPortfolio ? "Editing" : "New content"}
          onClose={resetPortfolioModal}
          footer={
            <>
              <button type="button" className="btn secondary" onClick={resetPortfolioModal}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={savePortfolio}>
                Save portfolio
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-modal-form-grid">
            <label className="admin-span-2">
              Portfolio name
              <input
                value={portfolioFormState.label}
                onChange={(event) => setPortfolioFormState((current) => ({ ...current, label: event.target.value }))}
              />
            </label>
            <label>
              Display order
              <input
                type="number"
                min="1"
                step="1"
                value={portfolioFormState.displayOrder}
                onChange={(event) =>
                  setPortfolioFormState((current) => ({ ...current, displayOrder: event.target.value }))
                }
              />
            </label>
            <p className="admin-span-2 admin-field-hint">
              Lower numbers appear first on the team page and homepage.
            </p>
          </div>
        </ModalShell>
      ) : null}

      {socialModalOpen ? (
        <ModalShell
          title={editingSocialLink ? "Edit social link" : "Create social link"}
          subtitle={editingSocialLink ? "Editing" : "New content"}
          onClose={resetSocialModal}
          footer={
            <>
              <button type="button" className="btn secondary" onClick={resetSocialModal}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={saveSocialLink}>
                Save social link
              </button>
            </>
          }
        >
          <div className="admin-form-grid admin-modal-form-grid">
            <label className="admin-span-2">
              Platform name
              <input
                value={socialFormState.name}
                onChange={(event) => setSocialFormState((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Link
              <input
                value={socialFormState.href}
                onChange={(event) => setSocialFormState((current) => ({ ...current, href: event.target.value }))}
              />
            </label>
            <label>
              Icon
              <select
                value={socialFormState.icon}
                onChange={(event) => setSocialFormState((current) => ({ ...current, icon: event.target.value }))}
              >
                {socialIconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Handle
              <input
                value={socialFormState.handle}
                onChange={(event) => setSocialFormState((current) => ({ ...current, handle: event.target.value }))}
              />
            </label>
            <label className="admin-span-2">
              Description
              <textarea
                rows="4"
                value={socialFormState.description}
                onChange={(event) =>
                  setSocialFormState((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
          </div>
        </ModalShell>
      ) : null}

      {deleteTarget ? (
        <div className="admin-modal-overlay" role="presentation" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal admin-confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <p className="admin-card-label">Confirm delete</p>
                <h3>Delete {deleteTarget.label}</h3>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close modal">
                ×
              </button>
            </div>
            <p className="admin-modal-copy">
              This action cannot be undone. Are you sure you want to permanently delete this item?
            </p>
            <div className="admin-modal-footer">
              <button type="button" className="btn secondary" onClick={() => setDeleteTarget(null)}>
                No, keep it
              </button>
              <button type="button" className="btn danger" onClick={confirmDelete}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
