import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import contentHandler from "./api/content.js";
import messagesHandler from "./api/messages.js";
import volunteersHandler from "./api/volunteers.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.DATABASE_URL && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }

  return {
    plugins: [
      react(),
      {
        name: "local-api-node-handlers",
        configureServer(server) {
          const routes = {
            "/api/content": contentHandler,
            "/api/messages": messagesHandler,
            "/api/volunteers": volunteersHandler
          };

          server.middlewares.use(async (request, response, next) => {
            const url = new URL(request.url || "/", "http://localhost");
            const handler = routes[url.pathname];

            if (!handler) {
              next();
              return;
            }

            try {
              await handler(request, response);
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
