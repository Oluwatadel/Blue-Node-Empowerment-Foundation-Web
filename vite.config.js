import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { Buffer } from "node:buffer";
import contentHandler from "./api/content.js";

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.DATABASE_URL && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }

  return {
    plugins: [
      react(),
      {
        name: "local-api-content",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            const url = new URL(request.url || "/", "http://localhost");

            if (url.pathname !== "/api/content") {
              next();
              return;
            }

            try {
              const method = request.method || "GET";
              const body = method === "GET" || method === "HEAD" ? undefined : await readRequestBody(request);
              const handlerRequest = new Request(url.toString(), {
                method,
                headers: new Headers(request.headers),
                body
              });
              const handlerResponse = await contentHandler(handlerRequest);

              response.statusCode = handlerResponse.status;
              handlerResponse.headers.forEach((value, key) => {
                response.setHeader(key, value);
              });

              const payload = Buffer.from(await handlerResponse.arrayBuffer());
              response.end(payload);
            } catch (error) {
              response.statusCode = 500;
              response.setHeader("Content-Type", "application/json; charset=utf-8");
              response.end(
                JSON.stringify({
                  error: error instanceof Error ? error.message : "API request failed"
                })
              );
            }
          });
        }
      }
    ]
  };
});
