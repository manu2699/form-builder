// WebSocket Handler for Yjs Collaboration
import type { ServerWebSocket } from "bun";

interface WebSocketData {
    formId: string;
    userId?: string;
}

// Connected clients per form room
const rooms = new Map<string, Set<ServerWebSocket<WebSocketData>>>();

export const websocketHandler = {
    open(ws: ServerWebSocket<WebSocketData>) {
        // formId comes from the room name set by y-websocket (e.g., "form-abc123")
        const formId = ws.data.formId;

        if (formId) {
            // Join room
            if (!rooms.has(formId)) {
                rooms.set(formId, new Set());
            }
            rooms.get(formId)!.add(ws);
            console.log(`🔌 Client joined room: ${formId} (${rooms.get(formId)!.size} clients)`);
        }
    },

    message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
        const formId = ws.data.formId;
        if (!formId) return;

        // Broadcast Yjs message to all other clients in the room
        const room = rooms.get(formId);
        if (room) {
            for (const client of room) {
                if (client !== ws && client.readyState === 1) {
                    client.send(message);
                }
            }
        }
    },

    close(ws: ServerWebSocket<WebSocketData>) {
        const formId = ws.data.formId;

        if (formId && rooms.has(formId)) {
            rooms.get(formId)!.delete(ws);
            const remaining = rooms.get(formId)!.size;
            console.log(`🔌 Client left room: ${formId} (${remaining} clients remaining)`);

            if (remaining === 0) {
                rooms.delete(formId);
            }
        }
    },
};

// Get room stats (for debugging)
export function getRoomStats() {
    const stats: Record<string, number> = {};
    rooms.forEach((clients, formId) => {
        stats[formId] = clients.size;
    });
    return stats;
}
