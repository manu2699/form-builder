import { serve } from "bun";
import { join, dirname } from "path";

import { initDatabase } from "@/server/db";
import { healthHandler, formsHandlers, formHandlers } from "@/server/routes";
import { websocketHandler } from "@/server/ws";

await initDatabase();

const isProduction = process.env.NODE_ENV === 'production';

const projectRoot = dirname(dirname(import.meta.dir));
const distPath = join(projectRoot, 'dist');

const server = serve({
  port: process.env.PORT || 3000,
  hostname: '0.0.0.0',
  routes: {
    "/api/health": {
      GET: healthHandler,
    },

    // Forms collection
    "/api/forms": {
      GET: formsHandlers.getAll,
      POST: formsHandlers.create,
    },

    // Single form
    "/api/forms/:id": {
      GET: formHandlers.get,
      PUT: formHandlers.update,
      DELETE: formHandlers.delete,
    },

    // WebSocket with room name (y-websocket format: /ws/:roomName)
    "/ws/:roomName": {
      async GET(req, server) {
        const roomName = req.params.roomName;
        const success = server.upgrade(req, {
          data: { formId: roomName }
        });
        if (success) return undefined;
        return new Response("WebSocket upgrade failed", { status: 400 });
      },
    },

    // Fallback WebSocket (for direct /ws connections)
    "/ws": {
      async GET(req, server) {
        const url = new URL(req.url);
        const roomName = url.searchParams.get('room') || 'default';
        const success = server.upgrade(req, {
          data: { formId: roomName }
        });
        if (success) return undefined;
        return new Response("WebSocket upgrade failed", { status: 400 });
      },
    },

    // SPA fallback
    "/*": !isProduction ? (await import("@/client/index.html")).default : {
      GET: async (req) => {
        const url = new URL(req.url);
        const filePath = join(distPath, url.pathname);
        const file = Bun.file(filePath);
        if (await file.exists()) {
          return new Response(file);
        }
        return new Response(Bun.file(join(distPath, 'index.html')));
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
  },

  websocket: websocketHandler,
});

console.log(`🚀 Server running at ${server.url}`);
