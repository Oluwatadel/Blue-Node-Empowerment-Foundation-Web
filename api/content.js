import { Buffer } from "node:buffer";
import { getPool } from "./_db.js";

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(payload);
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

async function loadContent(pool) {
  const [eventsResult, programsResult, socialLinksResult, usersResult] = await Promise.all([
    pool.query("SELECT id, title, location, date_time, description, flyer_image FROM events ORDER BY date_time ASC"),
    pool.query("SELECT slug, id, title, body, image_id, gallery_image_ids FROM programs ORDER BY title ASC"),
    pool.query("SELECT id, name, href, icon, handle, description FROM social_links ORDER BY name ASC"),
    pool.query("SELECT id, name, portfolio, image_url, phone_number, email, career FROM users ORDER BY name ASC")
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
    users: usersResult.rows.map((row) => ({
      id: row.id,
      user: {
        name: row.name,
        portfolio: row.portfolio,
        imageUrl: row.image_url || "",
        phoneNumber: row.phone_number || "",
        email: row.email || "",
        career: row.career || ""
      }
    }))
  };
}

async function replaceContent(pool, content) {
  const events = Array.isArray(content?.events) ? content.events : [];
  const programs = Array.isArray(content?.programs) ? content.programs : [];
  const socialLinks = Array.isArray(content?.socialLinks) ? content.socialLinks : [];
  const users = Array.isArray(content?.users) ? content.users : [];
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE events, programs, social_links, users");

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

    for (const userEntry of users) {
      const user = userEntry.user ?? userEntry;
      await client.query(
        `
          INSERT INTO users (id, name, portfolio, image_url, phone_number, email, career)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          userEntry.id,
          user.name,
          user.portfolio,
          user.imageUrl || "",
          user.phoneNumber || "",
          user.email || "",
          user.career || ""
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

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error"
    });
  }
}
