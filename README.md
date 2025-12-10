# HyperForms

A canvas-based form builder.

## Features

- **Canvas-Based Editor** - Drag, pan, and zoom on an infinite canvas
- **Multiple Forms** - Edit multiple forms simultaneously as nodes on the canvas
- **Drag & Drop Fields** - Add input, number, and button fields from the sidebar
- **Field Properties** - Configure labels, placeholders, validation, and styling
- **Visibility Rules** - Show/hide fields based on other field values
- **Real-Time Collaboration** - See other users' cursors and edits via Yjs/WebSocket
- **Presence Indicators** - View who's editing which form with avatar indicators

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | [Bun](https://bun.sh) |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (per-form stores) |
| Drag & Drop | @dnd-kit |
| Real-Time | Yjs + y-websocket |
| Database | PostgreSQL |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL 15+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd form-builder

# Install dependencies
bun install

# Set up PostgreSQL
createdb formbuilder
echo "DATABASE_URL=postgres://localhost/formbuilder" > .env
```

### Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
bun run build
bun start
```

## Project Structure

```
src/
├── client/
│   ├── components/
│   │   ├── canvas/        # Canvas pan/zoom
│   │   ├── form/          # Form nodes, grid, provider
│   │   ├── fields/        # Field types (input, number, button)
│   │   ├── properties/    # Property panel
│   │   ├── collaboration/ # Presence avatars
│   │   └── ui/            # Button, Input, Modal
│   ├── store/
│   │   └── formStore.ts   # Zustand store factory
│   ├── lib/
│   │   ├── collaboration.ts  # Presence/awareness
│   │   └── user.ts           # User identity
│   └── pages/
│       ├── HyperFormsPage.tsx  # Main canvas page
│       └── PreviewPage.tsx     # Form preview
├── server/
│   ├── db/                # PostgreSQL queries
│   ├── routes/            # API handlers
│   └── ws/                # WebSocket handler
└── index.ts               # Server entry
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms` | List all forms |
| POST | `/api/forms` | Create a form |
| GET | `/api/forms/:id` | Get form by ID |
| PUT | `/api/forms/:id` | Update form |
| DELETE | `/api/forms/:id` | Delete form |
| GET | `/api/health` | Health check |
| WS | `/ws/:roomName` | WebSocket for Yjs sync |

