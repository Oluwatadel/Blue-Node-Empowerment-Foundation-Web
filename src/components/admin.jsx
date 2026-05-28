import { useEffect, useState } from "react";
import { formatEventDate, slugify } from "../lib/siteUtils.js";
import { socialIconOptions } from "../content/siteContent.js";

export function AdminLogin({ onLogin, error }) {
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

export function AdminDashboard({
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
                    Event date and time
                    <input
                      type="datetime-local"
                      value={formState.dateTime}
                      onChange={(event) => updateField("dateTime", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Flyer image URL or Drive ID
                    <input
                      value={formState.flyerImage}
                      onChange={(event) => updateField("flyerImage", event.target.value)}
                      placeholder="Drive ID or /assets/images/Bluenode.jpg"
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
                </div>

                <div className="admin-actions">
                  <button type="submit" className="submit-btn">
                    {editingEvent ? "Update event" : "Save event"}
                  </button>
                  {editingEvent ? (
                    <button type="button" className="btn secondary" onClick={handleCancelEdit}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="admin-list">
                {sortedEvents.map((event) => (
                  <article className="admin-event-item" key={event.id}>
                    <div className="admin-event-copy">
                      <strong>{event.title}</strong>
                      <span>{formatEventDate(event.dateTime)}</span>
                      <p>{event.location}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn secondary" onClick={() => onEditEvent(event)}>
                        Edit
                      </button>
                      <button type="button" className="btn danger" onClick={() => onDeleteEvent(event.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === "programs" ? (
            <div className="admin-workspace">
              <form className="admin-form admin-content-card admin-editor-card" onSubmit={handleProgramSubmit}>
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">{editingProgram ? "Editing mode" : "New content"}</p>
                    <h3>{editingProgram ? "Edit program" : "Add program"}</h3>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-span-2">
                    Program title
                    <input
                      value={programFormState.title}
                      onChange={(event) => updateProgramField("title", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Slug
                    <input
                      value={programFormState.slug}
                      onChange={(event) => updateProgramField("slug", event.target.value)}
                      placeholder="Auto-generated if left blank"
                    />
                  </label>
                  <label className="admin-span-2">
                    Cover image ID
                    <input
                      value={programFormState.imageId}
                      onChange={(event) => updateProgramField("imageId", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Gallery image IDs
                    <textarea
                      rows="8"
                      value={programFormState.galleryImageIds}
                      onChange={(event) => updateProgramField("galleryImageIds", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Program body
                    <textarea
                      rows="5"
                      value={programFormState.body}
                      onChange={(event) => updateProgramField("body", event.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="admin-actions">
                  <button type="submit" className="submit-btn">
                    {editingProgram ? "Update program" : "Save program"}
                  </button>
                  {editingProgram ? (
                    <button type="button" className="btn secondary" onClick={handleCancelProgramEdit}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="admin-list">
                {programs.map((program) => (
                  <article className="admin-event-item" key={program.slug}>
                    <div className="admin-event-copy">
                      <strong>{program.title}</strong>
                      <span>{program.slug}</span>
                      <p>{program.body}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn secondary" onClick={() => setEditingProgram(program)}>
                        Edit
                      </button>
                      <button type="button" className="btn danger" onClick={() => onDeleteProgram(program.slug)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === "socials" ? (
            <div className="admin-workspace">
              <form className="admin-form admin-content-card admin-editor-card" onSubmit={handleSocialSubmit}>
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-card-label">{editingSocialLink ? "Editing mode" : "New content"}</p>
                    <h3>{editingSocialLink ? "Edit social link" : "Add social link"}</h3>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <label className="admin-span-2">
                    Platform name
                    <input
                      value={socialFormState.name}
                      onChange={(event) => updateSocialField("name", event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-span-2">
                    Link
                    <input
                      value={socialFormState.href}
                      onChange={(event) => updateSocialField("href", event.target.value)}
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
                  <label>
                    Handle
                    <input
                      value={socialFormState.handle}
                      onChange={(event) => updateSocialField("handle", event.target.value)}
                    />
                  </label>
                  <label className="admin-span-2">
                    Description
                    <textarea
                      rows="4"
                      value={socialFormState.description}
                      onChange={(event) => updateSocialField("description", event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-actions">
                  <button type="submit" className="submit-btn">
                    {editingSocialLink ? "Update link" : "Save social link"}
                  </button>
                  {editingSocialLink ? (
                    <button type="button" className="btn secondary" onClick={handleCancelSocialEdit}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="admin-list">
                {socialLinks.map((link) => (
                  <article className="admin-event-item" key={link.id}>
                    <div className="admin-event-copy">
                      <strong>{link.name}</strong>
                      <span>{link.handle}</span>
                      <p>{link.description}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn secondary" onClick={() => setEditingSocialLink(link)}>
                        Edit
                      </button>
                      <button type="button" className="btn danger" onClick={() => onDeleteSocialLink(link.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
