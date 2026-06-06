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

function normalizeMessageRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    readAt: row.read_at || ""
  };
}

async function loadMessages(pool) {
  const result = await pool.query(
    "SELECT id, name, email, message, status, created_at, read_at FROM contact_messages ORDER BY created_at DESC"
  );

  return result.rows.map(normalizeMessageRow);
}

export default async function handler(req, res) {
  const method = req.method || "GET";

  try {
    const pool = getPool();

    if (method === "GET") {
      const messages = await loadMessages(pool);
      sendJson(res, 200, { messages });
      return;
    }

    if (method === "POST") {
      const body = await readJsonBody(req);
      const name = String(body?.name || "").trim();
      const email = String(body?.email || "").trim();
      const message = String(body?.message || "").trim();

      if (!name || !message) {
        sendJson(res, 400, { error: "Name and message are required." });
        return;
      }

      const id = body?.id || `message-${Date.now()}`;
      const createdAt = body?.createdAt || new Date().toISOString();

      await pool.query(
        `
          INSERT INTO contact_messages (id, name, email, message, status, created_at, read_at)
          VALUES ($1, $2, $3, $4, 'new', $5, NULL)
        `,
        [id, name, email, message, createdAt]
      );

      const messages = await loadMessages(pool);
      sendJson(res, 200, { message: messages.find((entry) => entry.id === id) ?? null });
      return;
    }

    if (method === "PATCH") {
      const body = await readJsonBody(req);
      const id = String(body?.id || "").trim();
      const status = String(body?.status || "").trim().toLowerCase();

      if (!id) {
        sendJson(res, 400, { error: "Message id is required." });
        return;
      }

      if (status === "deleted") {
        await pool.query("DELETE FROM contact_messages WHERE id = $1", [id]);
        sendJson(res, 200, { success: true });
        return;
      }

      const nextStatus = status === "read" ? "read" : status === "archived" ? "archived" : "new";
      const readAt = nextStatus === "new" ? null : new Date().toISOString();

      await pool.query(
        `
          UPDATE contact_messages
          SET status = $2, read_at = $3
          WHERE id = $1
        `,
        [id, nextStatus, readAt]
      );

      const messages = await loadMessages(pool);
      sendJson(res, 200, { message: messages.find((entry) => entry.id === id) ?? null });
      return;
    }

    if (method === "DELETE") {
      const body = await readJsonBody(req);
      const id = String(body?.id || "").trim();

      if (!id) {
        sendJson(res, 400, { error: "Message id is required." });
        return;
      }

      await pool.query("DELETE FROM contact_messages WHERE id = $1", [id]);
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
