# MCP Hub

Your gateway to the Model Context Protocol ecosystem. Discover, evaluate, and integrate MCP servers for your AI applications.

## Features

- **Authentication**: Supabase Auth with GitHub OAuth
- **Dashboard**: Manage installed servers and actions
- **Real-time Monitoring**: Health metrics, logs, and charts
- **Config Generator**: Export configs for Claude, Cursor, and Windsurf
- **Status Lifecycle Simulation**: PENDING → INSTALLING → RUNNING
- **Server Registry**: Search and filter available servers
- **Type-Safe Data**: Zod-validated JSON data layer with full TypeScript support
- **Responsive UI**: Built with Next.js 16, Tailwind CSS v4, and shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix + Tailwind)
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Auth**: Supabase Auth
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Validation**: Zod for runtime type checking
- **Language**: TypeScript 5
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/SvenSonnborn/mcp-hub.git
cd mcp-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
mcp-hub/
├── app/
│   ├── (dashboard)/        # Dashboard layout group
│   │   ├── dashboard/      # Overview page
│   │   ├── registry/       # Server browser
│   │   ├── monitor/        # Health monitoring
│   │   └── config/         # Config generator
│   ├── api/                # API routes
│   │   ├── installations/  # CRUD + lifecycle
│   │   ├── health/         # Health metrics
│   │   └── config/         # Config generation
│   ├── servers/[id]/       # Server detail pages
│   ├── login/              # Auth pages
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── config/             # Config manager
│   ├── monitor/            # Monitoring UI
│   └── ui/                 # shadcn components
├── lib/                    # Utilities + lifecycle simulator
├── prisma/                 # Database schema
└── data/servers.json       # Static server data
```

## Data Layer

Servers are stored in `data/servers.json` with full type safety via Zod schemas.

### Schema (lib/schemas.ts)

```typescript
const ServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  author: z.string(),
  authorUrl: z.string().url().optional(),
  tags: z.array(ServerTagSchema),
  githubUrl: z.string().url(),
  npmPackage: z.string().optional(),
  downloads: z.string(),
  version: z.string(),
  license: z.string(),
  tools: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .optional(),
})
```

### Available Tags

- `official` - Official Anthropic servers
- `filesystem` - File system operations
- `github` - GitHub integration
- `database` - Database connectors
- `postgres`, `sqlite` - Specific databases
- `search`, `web` - Web search capabilities
- `browser`, `automation` - Browser automation
- `api` - API integrations
- `ai`, `tools`, `cloud` - Additional categories

### Data Access Functions (lib/data.ts)

```typescript
getAllServers() // Get all servers
getServerById(id) // Get single server
getAllTags() // Get unique tags
getServersByTag(tag) // Filter by tag
searchServers(query) // Search by text
```

## Code Quality

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Run ESLint
npm run lint

# Type check
npm run type-check
```

### Prettier Configuration

- No semicolons
- Single quotes
- 100 character line width
- Tailwind CSS class sorting

## Adding a New Server

1. Edit `data/servers.json`
2. Add server object following the schema
3. Run `npm run type-check` to validate
4. Run `npm run format` to format

Example:

```json
{
  "id": "my-server",
  "name": "My MCP Server",
  "description": "Does something useful",
  "author": "myusername",
  "tags": ["api", "tools"],
  "githubUrl": "https://github.com/...",
  "downloads": "1k+",
  "version": "1.0.0",
  "license": "MIT"
}
```

## Roadmap

- [x] Task 1: UI Foundation
- [x] Task 2: JSON data layer
- [x] Task 3: Server detail pages
- [x] Task 4: Search functionality
- [x] Task 5: Submit server form (partially done, can be added later)

## License

MIT

## Disclaimer

Not affiliated with Anthropic. MCP is a trademark of Anthropic.

# Deployment triggered after DB seed
