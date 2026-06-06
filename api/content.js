import { Buffer } from "node:buffer";
import { getPool } from "./_db.js";

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(payload);
}

function sendError(res, statusCode, message, code = "content_save_failed") {
  sendJson(res, statusCode, { error: true, message, code });
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function normalizeGalleryIds(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizePortfolioCategories(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      id: String(item?.id || item?.portfolioId || `portfolio-${index + 1}`),
      label: String(item?.label || item?.name || "").trim(),
      displayOrder: Number.parseInt(String(item?.displayOrder ?? item?.order ?? index + 1), 10) || index + 1
    }));
  }

  return [];
}

async function loadContent(pool) {
  const [eventsResult, programsResult, socialLinksResult, usersResult, portfoliosResult] = await Promise.all([
    pool.query("SELECT id, title, location, date_time, description, flyer_image FROM events ORDER BY date_time ASC"),
    pool.query("SELECT slug, id, title, body, image_id, gallery_image_ids FROM programs ORDER BY title ASC"),
    pool.query("SELECT id, name, href, icon, handle, description FROM social_links ORDER BY name ASC"),
    pool.query("SELECT id, name, portfolio_id, portfolio, image_url, phone_number, email, career, display_order FROM users ORDER BY name ASC"),
    pool.query("SELECT id, label, display_order FROM portfolio_categories ORDER BY display_order ASC, label ASC")
  ]);

  return {
    events: eventsResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      location: row.location,
      dateTime: row.date_time,
      description: row.description,
      flyerImage: row.flyer_image || ""
    })),
    programs: programsResult.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      body: row.body,
      imageId: row.image_id || "",
      galleryImageIds: normalizeGalleryIds(row.gallery_image_ids)
    })),
    socialLinks: socialLinksResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      href: row.href,
      icon: row.icon,
      handle: row.handle || "",
      description: row.description || ""
    })),
    portfolios: portfoliosResult.rows.map((row) => ({
      id: row.id,
      label: row.label,
      displayOrder: row.display_order
    })),
    users: usersResult.rows.map((row) => ({
      id: row.id,
      user: {
        name: row.name,
        portfolioId: row.portfolio_id || "",
        portfolio: row.portfolio,
        imageUrl: row.image_url || "",
        phoneNumber: row.phone_number || "",
        email: row.email || "",
        career: row.career || "",
        displayOrder: row.display_order
      }
    }))
  };
}

async function replaceContent(pool, content) {
  const events = Array.isArray(content?.events) ? content.events : [];
  const programs = Array.isArray(content?.programs) ? content.programs : [];
  const socialLinks = Array.isArray(content?.socialLinks) ? content.socialLinks : [];
  const portfolios = normalizePortfolioCategories(content?.portfolios);
  const users = Array.isArray(content?.users) ? content.users : [];
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE events, programs, social_links, users, portfolio_categories");

    for (const event of events) {
      await client.query(
        `
          INSERT INTO events (id, title, location, date_time, description, flyer_image)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [event.id, event.title, event.location, event.dateTime, event.description, event.flyerImage || ""]
      );
    }

    for (const program of programs) {
      await client.query(
        `
          INSERT INTO programs (slug, id, title, body, image_id, gallery_image_ids)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          program.slug,
          program.id || program.slug,
          program.title,
          program.body,
          program.imageId || "",
          JSON.stringify(normalizeGalleryIds(program.galleryImageIds))
        ]
      );
    }

    for (const link of socialLinks) {
      await client.query(
        `
          INSERT INTO social_links (id, name, href, icon, handle, description)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [link.id, link.name, link.href, link.icon, link.handle || "", link.description || ""]
      );
    }

    for (const portfolio of portfolios) {
      await client.query(
        `
          INSERT INTO portfolio_categories (id, label, display_order)
          VALUES ($1, $2, $3)
        `,
        [portfolio.id, portfolio.label, portfolio.displayOrder]
      );
    }

    for (const userEntry of users) {
      const user = userEntry.user ?? userEntry;
      await client.query(
        `
          INSERT INTO users (id, name, portfolio_id, portfolio, image_url, phone_number, email, career, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          userEntry.id,
          user.name,
          user.portfolioId || "",
          user.portfolio,
          user.imageUrl || "",
          user.phoneNumber || "",
          user.email || "",
          user.career || "",
          Number.isFinite(Number.parseInt(String(user.displayOrder), 10)) ? Number.parseInt(String(user.displayOrder), 10) : 1
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return loadContent(pool);
}

export default async function handler(req, res) {
  const method = req.method || "GET";

  try {
    const pool = getPool();

    if (method === "GET") {
      const content = await loadContent(pool);
      sendJson(res, 200, content);
      return;
    }

    if (method === "PUT") {
      const body = await readJsonBody(req);
      const content = await replaceContent(pool, body);
      sendJson(res, 200, content);
      return;
    }

    sendError(res, 405, "Method not allowed", "method_not_allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    sendError(res, 500, "Could not save site content right now. Please try again.", "content_save_failed");
    console.error(`[api/content] ${message}`);
  }
}
