# MCP Hub

Your gateway to the Model Context Protocol ecosystem. Discover, evaluate, and integrate MCP servers for your AI applications.

## Features

- **Server Discovery**: Browse 8+ official MCP servers with detailed information
- **Type-Safe Data**: Zod-validated JSON data layer with full TypeScript support
- **Responsive UI**: Built with Next.js 16, Tailwind CSS v4, and shadcn/ui
- **Search & Filter**: Find servers by name, description, or tags
- **Static Export**: Optimized for static hosting (Vercel, Netlify, GitHub Pages)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix + Tailwind)
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

### Build for Production

```bash
npm run build
```

The static export will be in the `dist` folder.

## Project Structure

```
mcp-hub/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with server grid
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── data/                  # JSON data files
│   └── servers.json      # MCP server data
├── lib/                   # Utility functions
│   ├── data.ts           # Data access layer
│   ├── schemas.ts        # Zod schemas & types
│   └── utils.ts          # Helper utilities
├── public/               # Static assets
└── next.config.ts        # Next.js configuration
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

- [x] Task 1: UI Foundation with server grid
- [x] Task 2: JSON data layer with type safety
- [ ] Task 3: Static detail pages for each server
- [ ] Task 4: Search functionality with filtering
- [ ] Task 5: Submit server form

## License

MIT

## Disclaimer

Not affiliated with Anthropic. MCP is a trademark of Anthropic.
