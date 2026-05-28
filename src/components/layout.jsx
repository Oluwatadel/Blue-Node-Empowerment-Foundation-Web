import { footerContent, navItems } from "../content/siteContent.js";
import { isExternalLink } from "../lib/siteUtils.js";
import { SocialIcon } from "./shared.jsx";

export function SiteHeader({ activeNavRoute, mobileNavOpen, onToggleMobileNav, isAdminRoute }) {
  if (isAdminRoute) {
    return null;
  }

  return (
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
          onClick={onToggleMobileNav}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export function SocialFooter({ socialLinks }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="socials">
      <div className="footer-copy">
        <p className="section-kicker">{footerContent.eyebrow}</p>
        <h2>{footerContent.title}</h2>
        <p>{footerContent.description}</p>
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
        <p>&copy; {year} {footerContent.copyrightPrefix}. All rights reserved.</p>
        <p>{footerContent.credit}</p>
      </div>
      <p className="footer-login">
        <a href={footerContent.loginHref} className="footer-login-link">
          {footerContent.loginLabel}
        </a>
      </p>
    </footer>
  );
}
