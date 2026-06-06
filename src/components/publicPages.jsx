import { useEffect, useState } from "react";
import { aboutCards, HOME_HERO_IMAGE_ID, quickLinks } from "../content/siteContent.js";
import {
  getDriveThumbnailUrl,
  formatEventDate,
  getCountdownParts,
  getPortfolioCategoryByIdOrLabel,
  isExternalLink,
  normalizePortfolioValue,
  normalizePortfolioCategories,
  sortTeamEntries
} from "../lib/siteUtils.js";
import { AutoPlayCarousel, Countdown, DriveImage, ManagedImage, PageShell, SocialIcon } from "./shared.jsx";

function normalizeUsersForView(users = [], portfolios = []) {
  const normalizedPortfolios = normalizePortfolioCategories(portfolios);

  return users.map((entry) => ({
    id: entry.id,
    user: (() => {
      const user = entry.user ?? entry;
      const portfolio = getPortfolioCategoryByIdOrLabel(user.portfolioId || user.portfolio, normalizedPortfolios);
      return {
        ...user,
        portfolioId: portfolio?.id || user.portfolioId || "",
        portfolio: portfolio?.label || normalizePortfolioValue(user.portfolio)
      };
    })()
  }));
}

function groupUsersByPortfolio(users = [], portfolios = []) {
  const normalizedPortfolios = normalizePortfolioCategories(portfolios);
  const normalizedUsers = normalizeUsersForView(users, normalizedPortfolios);

  return normalizedPortfolios
    .map((portfolio) => ({
      portfolio,
      users: sortTeamEntries(
        normalizedUsers.filter((entry) => {
          const userPortfolio = entry.user ?? entry;
          return userPortfolio.portfolioId === portfolio.id || userPortfolio.portfolio === portfolio.label;
        }),
        normalizedPortfolios
      )
    }))
    .filter((group) => group.users.length > 0);
}

function TeamCard({ entry }) {
  const user = entry.user ?? entry;

  return (
    <article className="team-card" key={entry.id || user.name}>
      <ManagedImage source={user.imageUrl || "/assets/images/Bluenode.jpg"} alt={user.name} className="team-photo" />
      <div className="team-card-copy">
        <strong>{user.name}</strong>
        <span>{user.portfolio}</span>
      </div>
    </article>
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
          <h2>Watch out for upcoming events.</h2>
          <p className="event-summary">
            There are no published events right now, but fresh outreach dates will appear here as soon as they are added.
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
            <div className="events-countdown-panel">
              <p className="events-countdown-label">Countdown to this event</p>
              <Countdown dateTime={event.dateTime} />
            </div>
            <a className="event-detail-link" href={`#event/${event.id}`}>
              View event details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeTeamSection({ users, portfolios, onOpenTeamPage }) {
  if (!Array.isArray(users) || users.length === 0) {
    return null;
  }

  const featuredUsers = sortTeamEntries(users, portfolios).slice(0, 3);
  const showSeeMoreButton = users.length > featuredUsers.length;

  return (
    <section className="section-shell home-team-preview">
      <div className="section-heading">
        <p className="section-kicker">Our team</p>
        <h2>Meet the people leading the work behind Blue Node.</h2>
      </div>

      <div className="home-team-grid team-grid">
        {featuredUsers.map((entry) => (
          <TeamCard key={entry.id || entry.user?.name || entry.name} entry={entry} />
        ))}
      </div>

      {showSeeMoreButton ? (
        <div className="team-section-footer">
          <button type="button" className="btn primary" onClick={onOpenTeamPage} aria-label="Open the full team page">
            View full team
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function HomePage({ events, programs, users, portfolios, isMobile, onOpenTeamPage }) {
  const heroBackground = getDriveThumbnailUrl(HOME_HERO_IMAGE_ID);
  const normalizedUsers = normalizeUsersForView(users, portfolios);

  return (
    <>
      <main>
        <section className="hero" id="home">
          <div className="hero-copy" style={{ "--hero-image": `url("${heroBackground}")` }}>
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

        <HomeTeamSection users={normalizedUsers} portfolios={portfolios} onOpenTeamPage={onOpenTeamPage} />
        <QuickLinksSection />
      </main>
    </>
  );
}

export function AboutPage({ users = [], portfolios = [] }) {
  const featuredUsers = sortTeamEntries(normalizeUsersForView(users, portfolios), portfolios).slice(0, 4);

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

      <section className="section-shell team-section">
        <div className="section-heading">
          <p className="section-kicker">Our team</p>
          <h2>The people shaping Blue Node's day-to-day work.</h2>
          <p className="page-intro">
            A 10-person team keeps the foundation moving through outreach planning, partnerships,
            communication, and on-the-ground support.
          </p>
        </div>

        <div className="team-grid">
          {featuredUsers.map((entry) => (
            <TeamCard key={entry.id || entry.user.name} entry={entry} />
          ))}
        </div>

      </section>
    </PageShell>
  );
}

export function TeamPage({ users = [], portfolios = [] }) {
  const groupedUsers = groupUsersByPortfolio(users, portfolios);

  return (
    <PageShell
      kicker="Team"
      title="Meet the people behind Blue Node Foundation."
      body="This page brings together the executive team, support crew, and wider members in one place."
    >
      {groupedUsers.map((group) => (
        <section className="section-shell team-section" key={group.portfolio.id}>
          <div className="section-heading">
            <p className="section-kicker">Portfolio</p>
            <h2>{group.portfolio.label}.</h2>
          </div>
          <div className="team-grid">
            {group.users.map((entry) => (
              <TeamCard key={entry.id || entry.user.name} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </PageShell>
  );
}

export function ProgramsPage({ programs, cardsPerView, currentSlide, maxSlide, goToSlide, showPrevious, showNext }) {
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

export function ImpactPage() {
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
          {[
            { value: "900+", label: "Families fed" },
            { value: "1,000+", label: "Children supported in school" },
            { value: "2,000+", label: "People empowered with skills" },
            { value: "5,000+", label: "Lives reached with relief" }
          ].map((item) => (
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

export function ContactPage({ onSubmitMessage }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submissionState, setSubmissionState] = useState({ status: "idle", note: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmissionState({ status: "sending", note: "" });

    try {
      if (typeof onSubmitMessage !== "function") {
        throw new Error("Message submission is not available right now.");
      }

      await onSubmitMessage({
        id: `message-${Date.now()}`,
        name: formState.name.trim(),
        email: formState.email.trim(),
        message: formState.message.trim(),
        createdAt: new Date().toISOString()
      });

      setFormState({
        name: "",
        email: "",
        message: ""
      });
      setSubmissionState({ status: "success", note: "Your message has been sent and saved for the admin team." });
    } catch (error) {
      setSubmissionState({
        status: "error",
        note: error instanceof Error ? error.message : "We could not send your message right now."
      });
    }
  }

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
            <p className="donation-account-name">Blue Node Foundation</p>
          </div>

          <ul className="contact-list">
            <li>2, Arokoje Street, Off Conoil Filling Station, Abeokuta, Ogun State. Nigeria</li>
            <li>
              <a className="contact-email-link" href="mailto:bluenodefoundation@gmail.com">
                bluenodefoundation@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+2348104963290">+234 810 496 3290</a>
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              placeholder="Enter full name"
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="Enter email address"
              value={formState.email}
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            Message
            <textarea
              rows="5"
              placeholder="Tell us how you'd like to connect..."
              value={formState.message}
              onChange={(event) => setFormState((current) => ({ ...current, message: event.target.value }))}
              required
            />
          </label>
          {submissionState.note ? (
            <p className={submissionState.status === "error" ? "contact-form-status error" : "contact-form-status"}>
              {submissionState.note}
            </p>
          ) : null}
          <button type="submit" className="submit-btn">
            {submissionState.status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

export function SocialsPage({ socialLinks }) {
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

export function EventsPage({ events }) {
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
                      <p className="events-showcase-pill">Upcoming event</p>
                      <h1>{event.title}</h1>
                      <p className="events-showcase-description">{event.description}</p>
                      <div className="events-showcase-meta">
                        <span>{formatEventDate(event.dateTime)}</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="events-countdown-panel">
                        <p className="events-countdown-label">Countdown to this event</p>
                        <Countdown dateTime={event.dateTime} />
                      </div>
                      <div className="events-slider-controls">
                        <button type="button" className="events-slider-button" onClick={showPreviousEvent}>
                          Previous
                        </button>
                        <button type="button" className="events-slider-button" onClick={showNextEvent}>
                          Next
                        </button>
                        <a className="events-register-btn" href="#contact">
                          Partner for this event
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="events-empty">
          <div className="events-empty-card">
            <p className="section-kicker">Upcoming events</p>
            <h2>No events are currently published.</h2>
            <p>Published events will appear here once they are added from the admin dashboard.</p>
          </div>
        </section>
      )}
    </main>
  );
}

export function ProgramGallery({ program }) {
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

export function EventDetailPage({ event }) {
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
