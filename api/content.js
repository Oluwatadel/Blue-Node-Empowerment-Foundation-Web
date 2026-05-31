import {
  defaultPrograms,
  defaultSocialLinks,
} from "../src/content/siteContent.js";
import { getPool } from "./_db.js";

const STEP_TIMEOUT_MS = 8000;

function createRequestLogger(requestId) {
  return {
    info(step, details = "") {
      console.info(`[api/content:${requestId}] ${step}${details ? ` ${details}` : ""}`);
    },
    warn(step, details = "") {
      console.warn(`[api/content:${requestId}] ${step}${details ? ` ${details}` : ""}`);
    },
    error(step, error) {
      console.error(
        `[api/content:${requestId}] ${step}`,
        error instanceof Error ? error.stack || error.message : error
      );
    }
  };
}

async function withStepTimeout(label, task, logger) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${STEP_TIMEOUT_MS}ms`));
    }, STEP_TIMEOUT_MS);
  });

  logger.info(label, "start");

  try {
    const result = await Promise.race([task(), timeoutPromise]);
    logger.info(label, "done");
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

function toJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function normalizeGalleryIds(value) {
  if (Array.isArray(value)) {
    return value;
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

async function ensureSchema(pool) {
  console.info("[api/content] ensuring schema");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      date_time TEXT NOT NULL,
      description TEXT NOT NULL,
      flyer_image TEXT NOT NULL DEFAULT ''
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS programs (
      slug TEXT PRIMARY KEY,
      id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image_id TEXT NOT NULL DEFAULT '',
      gallery_image_ids JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_links (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      href TEXT NOT NULL,
      icon TEXT NOT NULL,
      handle TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT ''
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      portfolio TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '',
      phone_number TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      career TEXT NOT NULL DEFAULT ''
    )
  `);
}

async function loadContent(pool) {
  console.info("[api/content] loading content from database");
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

async function migrateLegacyVolunteers(pool) {
  console.info("[api/content] checking legacy volunteers table");
  const usersCountResult = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  if (usersCountResult.rows[0]?.count > 0) {
    return;
  }

  try {
    const legacyResult = await pool.query("SELECT id, name, post, image_id FROM volunteers ORDER BY name ASC");

    if (legacyResult.rows.length === 0) {
      return;
    }

    for (const legacyUser of legacyResult.rows) {
      await pool.query(
        `
          INSERT INTO users (id, name, portfolio, image_url, phone_number, email, career)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [legacyUser.id, legacyUser.name, legacyUser.post, legacyUser.image_id || "", "", "", ""]
      );
    }
  } catch {
    return;
  }
}

async function seedDefaults(pool) {
  console.info("[api/content] seeding defaults if needed");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await loadContent(client);

    if (existing.programs.length === 0) {
      for (const program of defaultPrograms) {
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
            JSON.stringify(program.galleryImageIds || [])
          ]
        );
      }
    }

    if (existing.socialLinks.length === 0) {
      for (const link of defaultSocialLinks) {
        await client.query(
          `
            INSERT INTO social_links (id, name, href, icon, handle, description)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [link.id, link.name, link.href, link.icon, link.handle || "", link.description || ""]
        );
      }
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

async function ensureDefaults(pool) {
  console.info("[api/content] verifying default content");
  const [programsResult, socialLinksResult] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM programs"),
    pool.query("SELECT COUNT(*)::int AS count FROM social_links")
  ]);

  const shouldSeedPrograms = programsResult.rows[0]?.count === 0;
  const shouldSeedSocialLinks = socialLinksResult.rows[0]?.count === 0;

  if (!shouldSeedPrograms && !shouldSeedSocialLinks) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (shouldSeedPrograms) {
      for (const program of defaultPrograms) {
        await client.query(
          `
            INSERT INTO programs (slug, id, title, body, image_id, gallery_image_ids)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (slug) DO NOTHING
          `,
          [
            program.slug,
            program.id || program.slug,
            program.title,
            program.body,
            program.imageId || "",
            JSON.stringify(program.galleryImageIds || [])
          ]
        );
      }
    }

    if (shouldSeedSocialLinks) {
      for (const link of defaultSocialLinks) {
        await client.query(
          `
            INSERT INTO social_links (id, name, href, icon, handle, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
          `,
          [link.id, link.name, link.href, link.icon, link.handle || "", link.description || ""]
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function replaceContent(pool, content) {
  console.info("[api/content] replacing content payload");
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
          JSON.stringify(program.galleryImageIds || [])
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

export default async function handler(request) {
  const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const logger = createRequestLogger(requestId);
  const method = request.method || "GET";
  logger.info("request received", method);

  try {
    const pool = getPool();
    logger.info("database pool ready");
    await withStepTimeout("ensureSchema", () => ensureSchema(pool), logger);

    if (method === "GET") {
      await withStepTimeout("migrateLegacyVolunteers", () => migrateLegacyVolunteers(pool), logger);
      await withStepTimeout("ensureDefaults", () => ensureDefaults(pool), logger);
      const content = await withStepTimeout("loadContent", () => loadContent(pool), logger);
      logger.info("request complete", "200");
      return toJsonResponse(content);
    }

    if (method === "PUT") {
      logger.info("parsing request body");
      const body = await request.json();
      const content = await withStepTimeout("replaceContent", () => replaceContent(pool, body), logger);
      logger.info("request complete", "200");
      return toJsonResponse(content);
    }

    logger.warn("unsupported method", method);
    return toJsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    logger.error("request failed", error);
    return toJsonResponse(
      {
        error: error instanceof Error ? error.message : "Unexpected server error"
      },
      500
    );
  }
}
