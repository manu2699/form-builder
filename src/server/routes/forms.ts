// API Route Handlers
import { FormQueries, isDbConnected } from "../db";

// Health check
export async function healthHandler() {
    return Response.json({
        status: "ok",
        timestamp: Date.now(),
        db: isDbConnected(),
    });
}

// Forms handlers
export const formsHandlers = {
    async getAll() {
        try {
            const forms = await FormQueries.getAll();
            return Response.json(forms);
        } catch (e) {
            console.error("Error fetching forms:", e);
            return new Response("Internal Server Error", { status: 500 });
        }
    },

    async create(req: Request) {
        try {
            const body = await req.json();
            const { id, name } = body;

            if (!id || !name) {
                return new Response("Missing id or name", { status: 400 });
            }

            const form = await FormQueries.create(id, name);
            return Response.json(form);
        } catch (e) {
            console.error("Error creating form:", e);
            return new Response("Internal Server Error", { status: 500 });
        }
    },
};

// Single form handlers
export const formHandlers = {
    async get(req: Request & { params: { id: string } }) {
        try {
            const form = await FormQueries.getById(req.params.id);
            if (!form) {
                return new Response("Not Found", { status: 404 });
            }
            return Response.json(form);
        } catch (e) {
            console.error("Error fetching form:", e);
            return new Response("Internal Server Error", { status: 500 });
        }
    },

    async update(req: Request & { params: { id: string } }) {
        try {
            const body = await req.json();
            const { layout, schema } = body;

            const form = await FormQueries.update(req.params.id, layout, schema);
            if (!form) {
                return new Response("Not Found", { status: 404 });
            }
            return Response.json(form);
        } catch (e) {
            console.error("Error updating form:", e);
            return new Response("Internal Server Error", { status: 500 });
        }
    },

    async delete(req: Request & { params: { id: string } }) {
        try {
            const deleted = await FormQueries.delete(req.params.id);
            if (!deleted) {
                return new Response("Not Found", { status: 404 });
            }
            return new Response(null, { status: 204 });
        } catch (e) {
            console.error("Error deleting form:", e);
            return new Response("Internal Server Error", { status: 500 });
        }
    },
};
