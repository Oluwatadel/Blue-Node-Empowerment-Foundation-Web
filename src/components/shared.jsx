import { useEffect, useMemo, useState } from "react";
import { getImageSources } from "../lib/siteUtils.js";

export function ManagedImage({ source, alt, className }) {
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

export function DriveImage({ fileId, alt, className }) {
  return <ManagedImage source={fileId} alt={alt} className={className} />;
}

export function Countdown({ dateTime }) {
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

export function PageShell({ kicker, title, body, children }) {
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

export function AutoPlayCarousel({ items, renderItem, className, isMobile, ariaLabel, autoPlayMs = 4500 }) {
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

export function SocialIcon({ type }) {
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
