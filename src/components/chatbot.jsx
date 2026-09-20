import { useEffect, useMemo, useRef, useState } from "react";
import { aboutCards, impactStats, volunteerBenefits } from "../content/siteContent.js";

const GREETING =
  "Hi! I'm the Blue Node assistant. Ask me about our programs, upcoming events, volunteering, or donating — or tap a topic below.";
const DEFAULT_WHATSAPP = "https://wa.me/2348104963290";
const AUTO_OPEN_DELAY_MS = 1200;

function findWhatsAppLink(socialLinks) {
  const match = (socialLinks || []).find((link) => link.icon === "whatsapp");
  return match?.href || DEFAULT_WHATSAPP;
}

function formatEventDate(dateTime) {
  try {
    return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(dateTime)
    );
  } catch {
    return "";
  }
}

function buildTopics({ programs, events, socialLinks }) {
  const waLink = findWhatsAppLink(socialLinks);
  const waCta = { label: "Chat on WhatsApp", href: waLink, external: true };
  const upcoming = (events || [])
    .filter((event) => new Date(event.dateTime).getTime() > Date.now())
    .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime))
    .slice(0, 3);

  return {
    programs: {
      label: "Our programs",
      cta: { label: "View programs", href: "/programs" },
      reply() {
        if (!programs?.length) {
          return "We're updating our programs list right now — the Programs page will have the latest, or ask our team on WhatsApp.";
        }

        const list = programs
          .slice(0, 6)
          .map((program) => `• ${program.title}`)
          .join("\n");
        return `Here's what we're currently running:\n${list}\n\nOpen the Programs page for photos and details on each one.`;
      }
    },
    events: {
      label: "Upcoming events",
      cta: { label: "View events", href: "/events" },
      reply() {
        if (!upcoming.length) {
          return "There are no upcoming events published right now — check back soon, or ask us on WhatsApp about what's next.";
        }

        const list = upcoming
          .map((event) => `• ${event.title} — ${formatEventDate(event.dateTime)}`)
          .join("\n");
        return `Coming up:\n${list}`;
      }
    },
    impact: {
      label: "Our impact",
      cta: { label: "See the Impact page", href: "/impact" },
      reply() {
        return impactStats.map((stat) => `• ${stat.value} ${stat.label}`).join("\n");
      }
    },
    volunteer: {
      label: "How to volunteer",
      cta: { label: "Open volunteer form", href: "/volunteer" },
      reply() {
        const benefit = volunteerBenefits[0]?.body || "";
        return `We'd love your help! ${benefit} Fill out the volunteer form and our team will reach out.`;
      }
    },
    donate: {
      label: "Donate or partner",
      cta: waCta,
      reply() {
        return "You can support Blue Node Foundation by donating, partnering on an outreach, or sponsoring a program. Our team can share account and payment details directly.";
      }
    },
    about: {
      label: "About Blue Node",
      cta: { label: "Read more", href: "/about" },
      reply() {
        return aboutCards.map((card) => `• ${card.title}: ${card.body}`).join("\n\n");
      }
    },
    contact: {
      label: "Contact us",
      cta: waCta,
      reply() {
        return "You can reach us by email, on our social channels, or directly on WhatsApp for the fastest response.";
      }
    },
    human: {
      label: "Talk to someone",
      cta: waCta,
      reply() {
        return "Sure — tap below to continue this conversation with our team on WhatsApp.";
      }
    }
  };
}

function matchTopicKey(text) {
  const value = text.toLowerCase();

  if (/whatsapp|human|agent|real person|talk to (someone|a person)/.test(value)) {
    return "human";
  }

  if (/donat|sponsor|partner|fund|support financially/.test(value)) {
    return "donate";
  }

  if (/volunteer|join (the|your) team|help out/.test(value)) {
    return "volunteer";
  }

  if (/event|outreach date|when is|next outreach/.test(value)) {
    return "events";
  }

  if (/program|outreach area|what do you do/.test(value)) {
    return "programs";
  }

  if (/impact|stats|numbers|families|achieve/.test(value)) {
    return "impact";
  }

  if (/about|who are you|mission|vision|history/.test(value)) {
    return "about";
  }

  if (/contact|email|phone|reach you|address/.test(value)) {
    return "contact";
  }

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(value)) {
    return "greeting";
  }

  return "fallback";
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="chat-toggle-icon">
      <path d="M14 4C7.9 4 3 8.2 3 13.4c0 2.8 1.4 5.3 3.7 7L6 24l4.2-2.1c1.2.3 2.5.5 3.8.5 6.1 0 11-4.2 11-9.4S20.1 4 14 4Z" />
      <circle cx="9.2" cy="13.4" r="1.5" fill="#fff" />
      <circle cx="14" cy="13.4" r="1.5" fill="#fff" />
      <circle cx="18.8" cy="13.4" r="1.5" fill="#fff" />
    </svg>
  );
}

export function ChatWidget({ programs, events, socialLinks }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: "bot", text: GREETING }]);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);
  const topics = useMemo(() => buildTopics({ programs, events, socialLinks }), [programs, events, socialLinks]);
  const waLink = findWhatsAppLink(socialLinks);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), AUTO_OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  function pushBotReply(text, cta) {
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: "bot", text, cta }]);
    }, 350);
  }

  function handleTopic(key) {
    const topic = topics[key];
    if (!topic) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: topic.label }]);
    pushBotReply(topic.reply(), topic.cta);
  }

  function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text }]);
    setDraft("");

    const key = matchTopicKey(text);
    if (key === "greeting") {
      pushBotReply("Hi there! Tap a topic below or ask me about programs, events, volunteering, or donating.");
      return;
    }

    if (key === "fallback") {
      pushBotReply(
        "I don't have a direct answer for that yet — let's continue on WhatsApp so our team can help.",
        { label: "Open WhatsApp", href: waLink, external: true }
      );
      return;
    }

    const topic = topics[key];
    pushBotReply(topic.reply(), topic.cta);
  }

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-panel" role="dialog" aria-label="Blue Node assistant">
          <div className="chat-panel-header">
            <div className="chat-panel-heading">
              <strong>Blue Node Assistant</strong>
              <span>Usually replies instantly</span>
            </div>
            <button type="button" className="chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              &times;
            </button>
          </div>

          <div className="chat-messages" ref={listRef}>
            {messages.map((message, index) => (
              <div className={`chat-bubble ${message.role}`} key={index}>
                <p>{message.text}</p>
                {message.cta ? (
                  <a
                    className="chat-cta"
                    href={message.cta.href}
                    target={message.cta.external ? "_blank" : undefined}
                    rel={message.cta.external ? "noreferrer" : undefined}
                  >
                    {message.cta.label}
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="chat-topics">
            {Object.entries(topics).map(([key, topic]) => (
              <button type="button" key={key} className="chat-topic-chip" onClick={() => handleTopic(key)}>
                {topic.label}
              </button>
            ))}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message…"
              aria-label="Type a message"
            />
            <button type="submit" aria-label="Send message">
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="chat-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <span className="chat-toggle-close">&times;</span> : <ChatIcon />}
      </button>
    </div>
  );
}
