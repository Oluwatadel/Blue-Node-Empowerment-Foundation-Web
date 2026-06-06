import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";
import { defaultPortfolioCategories, defaultPrograms, defaultSocialLinks } from "../src/content/siteContent.js";

function parseEnvFile(raw) {
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  try {
    const envPath = resolve(process.cwd(), ".env");
    const raw = await readFile(envPath, "utf8");
    const parsed = parseEnvFile(raw);
    if (parsed.DATABASE_URL) {
      return parsed.DATABASE_URL;
    }
  } catch {
    // Ignore missing .env files and fall through to the error below.
  }

  throw new Error("DATABASE_URL is not set. Add it to your environment or .env file.");
}

async function main() {
  const databaseUrl = await loadDatabaseUrl();
  const sqlPath = resolve(process.cwd(), "migrations", "001_init.sql");
  const sql = await readFile(sqlPath, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    try {
      for (const statement of statements) {
        await client.query(statement);
      }

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

      for (const portfolio of defaultPortfolioCategories) {
        await client.query(
          `
            INSERT INTO portfolio_categories (id, label, display_order)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING
          `,
          [portfolio.id, portfolio.label, portfolio.displayOrder]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }

    console.log(
      `Migration complete: ${statements.length} statement(s) applied from migrations/001_init.sql, ${defaultPrograms.length} program record(s) seeded, ${defaultPortfolioCategories.length} portfolio category record(s) seeded, and ${defaultSocialLinks.length} social link record(s) seeded`
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
});
