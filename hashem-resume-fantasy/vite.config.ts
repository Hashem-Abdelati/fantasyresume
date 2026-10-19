import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { journalHandler } from "./server/journal-handler";
import { fileStore } from "./server/journal-store";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const handler = journalHandler({
    production: false,
    passwordHash: env.JOURNAL_PASSWORD_HASH,
    secret: env.JOURNAL_SESSION_SECRET,
    store: fileStore(resolve(env.JOURNAL_DATA_FILE || ".journal/entries.json")),
  });
  const middleware = (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
    next: () => void,
  ) => {
    if (req.url?.split("?")[0] === "/api/journal") void handler(req, res);
    else next();
  };
  return {
    plugins: [
      react(),
      {
        name: "local-journal",
        configureServer(server) {
          server.middlewares.use(middleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(middleware);
        },
      },
    ],
    server: {
      fs: {
        deny: [
          ".env",
          ".env.*",
          "**/.git/**",
          "**/.journal/**",
          "**/server/**",
          "**/api/**",
        ],
      },
    },
  };
});
