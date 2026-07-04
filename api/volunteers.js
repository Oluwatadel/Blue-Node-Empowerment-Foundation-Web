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

function normalizeVolunteerRow(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    phoneNumber: row.phone_number || "",
    email: row.email || "",
    status: row.status,
    createdAt: row.created_at
  };
}

async function loadVolunteers(pool) {
  const result = await pool.query(
    "SELECT id, name, location, phone_number, email, status, created_at FROM volunteers ORDER BY created_at DESC"
  );

  return result.rows.map(normalizeVolunteerRow);
}

export default async function handler(req, res) {
  const method = req.method || "GET";

  try {
    const pool = getPool();

    if (method === "GET") {
      const volunteers = await loadVolunteers(pool);
      sendJson(res, 200, { volunteers });
      return;
    }

    if (method === "POST") {
      const body = await readJsonBody(req);
      const name = String(body?.name || "").trim();
      const location = String(body?.location || "").trim();
      const phoneNumber = String(body?.phoneNumber || "").trim();
      const email = String(body?.email || "").trim();

      if (!name || !location || !phoneNumber || !email) {
        sendJson(res, 400, { error: "Name, location, phone number, and email are required." });
        return;
      }

      const id = body?.id || `volunteer-${Date.now()}`;
      const createdAt = body?.createdAt || new Date().toISOString();

      await pool.query(
        `
          INSERT INTO volunteers (id, name, location, phone_number, email, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'new', $6)
        `,
        [id, name, location, phoneNumber, email, createdAt]
      );

      const volunteers = await loadVolunteers(pool);
      sendJson(res, 200, { volunteer: volunteers.find((entry) => entry.id === id) ?? null });
      return;
    }

    if (method === "PATCH") {
      const body = await readJsonBody(req);
      const id = String(body?.id || "").trim();
      const status = String(body?.status || "").trim().toLowerCase();

      if (!id) {
        sendJson(res, 400, { error: "Volunteer id is required." });
        return;
      }

      const nextStatus = status === "converted" ? "converted" : "new";

      await pool.query(
        `
          UPDATE volunteers
          SET status = $2
          WHERE id = $1
        `,
        [id, nextStatus]
      );

      const volunteers = await loadVolunteers(pool);
      sendJson(res, 200, { volunteer: volunteers.find((entry) => entry.id === id) ?? null });
      return;
    }

    if (method === "DELETE") {
      const body = await readJsonBody(req);
      const id = String(body?.id || "").trim();

      if (!id) {
        sendJson(res, 400, { error: "Volunteer id is required." });
        return;
      }

      await pool.query("DELETE FROM volunteers WHERE id = $1", [id]);
      sendJson(res, 200, { success: true });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error"
    });
  }
}
