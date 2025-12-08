// Server Entry Point
import { serve } from "bun";
import index from "@/client/index.html";

// Modules
import { initDatabase } from "@/server/db";
import { healthHandler, formsHandlers, formHandlers } from "@/server/routes";
import { websocketHandler } from "@/server/ws";

// Initialize
await initDatabase();

// Server
const server = serve({
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
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
  },

  websocket: websocketHandler,
});

console.log(`🚀 Server running at ${server.url}`);

