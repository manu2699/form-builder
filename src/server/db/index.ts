import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL || "postgres://localhost/formbuilder");

// In-Memory Fallback
const inMemoryForms = new Map<string, Form>();
let dbConnected = false;

// Types
export interface Form {
    id: string;
    name: string;
    layout: any;
    schema: any;
    created_at: string;
}

// Initialize database table
export async function initDatabase(): Promise<boolean> {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS forms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                layout JSONB DEFAULT '[]',
                schema JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        dbConnected = true;
        console.log("✅ Connected to Postgres");
        return true;
    } catch (e) {
        console.warn("⚠️ Failed to connect to Postgres. Using In-Memory Storage.", e);
        dbConnected = false;
        return false;
    }
}

// Check if using database
export function isDbConnected(): boolean {
    return dbConnected;
}

// Form Queries
export const FormQueries = {
    async getAll(): Promise<Form[]> {
        if (dbConnected) {
            return await sql<Form[]>`SELECT * FROM forms ORDER BY created_at DESC`;
        }
        return Array.from(inMemoryForms.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    },

    async getById(id: string): Promise<Form | null> {
        if (dbConnected) {
            const [form] = await sql<Form[]>`SELECT * FROM forms WHERE id = ${id}`;
            return form || null;
        }
        return inMemoryForms.get(id) || null;
    },

    async create(id: string, name: string): Promise<Form> {
        if (dbConnected) {
            const [form] = await sql<Form[]>`
                INSERT INTO forms (id, name, layout, schema)
                VALUES (${id}, ${name}, '[]', '[]')
                RETURNING *
            `;
            return form;
        }
        const form: Form = {
            id,
            name,
            layout: [],
            schema: [],
            created_at: new Date().toISOString(),
        };
        inMemoryForms.set(id, form);
        return form;
    },

    async update(id: string, layout: any, schema: any): Promise<Form | null> {
        if (dbConnected) {
            const [form] = await sql<Form[]>`
                UPDATE forms 
                SET layout = ${JSON.stringify(layout)}, schema = ${JSON.stringify(schema)}
                WHERE id = ${id}
                RETURNING *
            `;
            return form || null;
        }
        const existing = inMemoryForms.get(id);
        if (!existing) return null;
        const updated = { ...existing, layout, schema };
        inMemoryForms.set(id, updated);
        return updated;
    },

    async delete(id: string): Promise<boolean> {
        if (dbConnected) {
            const result = await sql`DELETE FROM forms WHERE id = ${id}`;
            return result.count > 0;
        }
        return inMemoryForms.delete(id);
    },
};
