# MCP Hub - Codex Prompts

## Prompt 1: Foundation Setup

```
Initialize a new Next.js 16 project with Bun in the current directory.

Requirements:
1. Use Next.js 16 with App Router
2. TypeScript with strict mode
3. Tailwind CSS v4 with dark mode support (class-based)
4. Install and configure shadcn/ui with the "slate" base color
5. Set up the project structure:
   - app/(dashboard)/page.tsx - Dashboard home
   - app/layout.tsx with dark theme default
   - components/ui/ for shadcn components
   - lib/utils.ts with cn helper
6. Create a base layout with:
   - Dark background (slate-950)
   - Sidebar navigation (left, 64px wide)
   - Main content area
   - Header with title and theme toggle
7. Install necessary dependencies:
   - lucide-react for icons
   - zustand for state management
   - @tanstack/react-query for data fetching
   - clsx, tailwind-merge for utilities

Use "slate" as the CSS variable prefix for theming.
The design should be developer-focused: clean, minimal, dark mode by default.

After setup, verify by running "bun dev" and ensure it starts without errors.
```

## Prompt 2: Prisma Database Setup

```
Set up Prisma ORM with SQLite database for the MCP Hub project.

Requirements:
1. Install Prisma as dev dependency and @prisma/client
2. Initialize Prisma with: npx prisma init
3. Create the schema in prisma/schema.prisma:
   - MCPServer model with: id, name, description, publisher,
     githubUrl, installUrl, version, category (enum), tags (String[]),
     configSchema (Json), isOfficial, isVerified, downloadCount,
     rating, createdAt, updatedAt
   - MCPInstallation model with: id, serverId (relation),
     status (enum: PENDING, INSTALLING, RUNNING, STOPPED, ERROR, UPDATING),
     config (Json), port, pid, lastPing, isHealthy, errorLog,
     createdAt, updatedAt
   - Enums: Category (FILESYSTEM, DATABASE, API, VERSION_CONTROL,
     COMMUNICATION, SEARCH, AI_SERVICE, DEV_TOOL, OTHER)
4. Create lib/prisma.ts with singleton PrismaClient
5. Run migration: npx prisma migrate dev --name init
6. Create prisma/seed.ts with 10 sample MCP servers:
   - filesystem (official)
   - github (official)
   - postgres (community)
   - slack (community)
   - fetch (official)
   - brave-search (community)
   - sqlite (community)
   - git (community)
   - puppeteer (community)
   - playwright (community)
7. Configure package.json seed script
8. Run: npx prisma db seed

All models must use @id @default(cuid()) for IDs.
```

## Prompt 3: Registry Browser Page

```
Create the Registry Browser page at app/(dashboard)/registry/page.tsx

Requirements:
1. Layout:
   - Header with title "MCP Registry" + search input
   - Sidebar left with category filters (Checkbox list)
   - Main area: Grid of ServerCards (3 columns on desktop)

2. Components to create:
   - components/registry/SearchBar.tsx
     - Input with search icon
     - Debounced search (300ms)
     - Clear button

   - components/registry/CategoryFilter.tsx
     - List of all Category enum values
     - Checkboxes for multi-select
     - "Clear all" link

   - components/registry/ServerCard.tsx
     - Card with: icon (based on category), name,
       publisher (with verified badge if isVerified),
       description (2 lines, truncate), tags (max 3 badges),
       download count, rating stars
     - Hover effect: translateY(-2px), shadow increase
     - Click navigates to detail page

   - components/registry/ServerGrid.tsx
     - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
     - Empty state: "No servers found" with icon

3. Data fetching:
   - Create app/api/mcp-servers/route.ts
   - GET endpoint with query params: search, categories[], sortBy
   - Use Prisma to filter and sort
   - Return JSON with servers array

4. Styling:
   - Cards: bg-slate-900, border-slate-800, rounded-lg
   - Hover: border-violet-500/50
   - Badges: bg-slate-800, text-slate-300
   - Verified badge: violet dot

5. Install @radix-ui/react-checkbox for filters
```

## Prompt 4: Server Detail Page

```
Create the Server Detail page at app/(dashboard)/registry/[id]/page.tsx

Requirements:
1. Layout:
   - Hero section: Large icon, server name, publisher badges
   - Action buttons: "Install" (primary), "View on GitHub" (secondary)
   - Tabs: Overview | Configuration | Versions

2. Components:
   - Tabs using @radix-ui/react-tabs
   - Overview tab:
     * Full description (render markdown if needed)
     * Key features list with checkmarks
     * Installation instructions
   - Configuration tab:
     * JSON Schema viewer (if configSchema exists)
     * Form fields dynamically generated from schema
     * Validation indicators
   - Versions tab:
     * Version history (mock data for now)

3. Install button:
   - POST to /api/mcp-servers/[id]/install
   - Shows loading state
   - On success: redirect to Dashboard with toast

4. API endpoints:
   - GET /api/mcp-servers/[id] - returns single server with full details
   - POST /api/mcp-servers/[id]/install - creates MCPInstallation record

5. Styling:
   - Hero: bg-gradient-to-b from-slate-900 to-slate-950
   - Primary button: bg-violet-600, hover:bg-violet-500
   - Tabs: underline style, active tab has violet underline
```

## Prompt 5: Dashboard Home Page

```
Create the Dashboard at app/(dashboard)/page.tsx

Requirements:
1. Layout:
   - Stats row at top: 4 cards showing:
     * Total Installations
     * Running Servers
     * Stopped Servers
     * Errors (if any, show in red)
   - Grid of Installed Server Cards below

2. Components:
   - components/dashboard/StatsRow.tsx
     * 4 stat cards with icons
     * Large numbers, small labels
     * Error count shows red badge if > 0

   - components/dashboard/InstalledCard.tsx
     * Status indicator: colored dot (pulse animation if running)
     * Server name, version
     * Last ping time ("2 min ago" format)
     * Action buttons: Play (start), Square (stop), RotateCw (restart),
       Settings (gear), FileText (logs)
     * Expandable section for logs (last 50 lines)

   - components/dashboard/StatusBadge.tsx
     * Running: emerald-500 dot + "Running" text
     * Stopped: slate-500 dot + "Stopped"
     * Error: rose-500 dot + "Error"
     * Loading: blue-500 animated dot + "Loading"

3. Real-time updates:
   - Create app/api/installations/route.ts
   - GET: list all installations with server details
   - PATCH /[id]: update status (start/stop)
   - Use React Query with refetchInterval: 5000 (5s)

4. Empty state:
   - Illustration + "No servers installed"
   - CTA button: "Browse Registry" linking to /registry

5. Styling:
   - Stats cards: bg-slate-900, border border-slate-800
   - Installed cards: hover:bg-slate-800/50 transition
   - Action buttons: ghost variant, hover:bg-slate-800
```

## Prompt 6: Config Manager Page

```
Create the Config Manager at app/(dashboard)/config/page.tsx

Requirements:
1. Layout:
   - Two columns:
     * Left: Tool selector (Claude, Cursor, Windsurf, Generic)
     * Right: Generated config preview

2. Components:
   - components/config/ToolSelector.tsx
     * Radio cards for each tool
     * Icons for each tool
     * Selected tool highlighted with violet border

   - components/config/ConfigPreview.tsx
     * Syntax-highlighted JSON (use prism-react-renderer or similar)
     * Line numbers
     * Copy button (copies to clipboard, shows checkmark briefly)
     * Download button (downloads as mcp.json)

3. Config generation:
   - Create lib/config-generator.ts
   - Function generateConfig(tool: string, installations: Installation[])
   - Different formats per tool:
     * Claude: claude_desktop_config.json format
     * Cursor: .cursor/mcp.json format
     * Windsurf: windsurf/mcp.json format
     * Generic: standard MCP config

4. API endpoint:
   - GET /api/config?tool=claude
   - Fetches running installations
   - Returns formatted config object

5. Additional features:
   - Toggle to include stopped servers
   - Validation indicator (green check if valid MCP config)
   - Help tooltip explaining each tool's config location

6. Styling:
   - Code preview: bg-slate-950, font-mono, syntax highlighting
   - Tool cards: border-2, selected:border-violet-500
```

## Prompt 7: Navigation & Layout Polish

```
Polish the application layout and navigation.

Requirements:
1. Sidebar component (components/layout/Sidebar.tsx):
   - Fixed left, 64px wide (icon only) or 240px (expanded)
   - Navigation items: Dashboard, Registry, Config, Monitor
   - Active state: violet background highlight
   - Hover: slate-800 background
   - Collapse/expand toggle

2. Header component (components/layout/Header.tsx):
   - Breadcrumb navigation
   - Page title
   - Right side: Notifications bell, User avatar dropdown

3. Theme toggle:
   - Sun/Moon icon toggle
   - Persist preference in localStorage
   - System preference detection

4. Page transitions:
   - Smooth fade-in on route change
   - Loading states for data fetching

5. Toast notifications:
   - Install success/error
   - Server start/stop confirmations
   - Copy to clipboard success
   - Use sonner or similar library

6. Error boundaries:
   - Global error boundary with fallback UI
   - "Something went wrong" with retry button

7. Install missing shadcn components:
   - button, card, input, badge, tabs, checkbox,
     dropdown-menu, avatar, skeleton, tooltip, separator

8. Final verification:
   - All pages load without errors
   - Navigation works between all routes
   - Responsive on mobile/tablet/desktop
```

## Prompt 8: Health Monitor & Final Polish

```
Create the Health Monitor page and finalize the application.

Requirements:
1. Health Monitor at app/(dashboard)/monitor/page.tsx:
   - Server selector dropdown (all installed servers)
   - Stats cards: Uptime, Avg Response Time, Requests/min, Error Rate
   - Simple chart placeholder (use recharts for mock data)
   - Logs section:
     * Filter by level (INFO, WARN, ERROR)
     * Search input
     * Virtualized list for performance (if many logs)
     * Auto-scroll to bottom

2. API endpoints:
   - GET /api/health/[id] - returns health metrics
   - GET /api/health/[id]/logs - returns recent logs

3. Animations:
   - Add framer-motion for smooth animations
   - Page transitions: fade + slide up
   - Card hover: subtle lift
   - Status changes: smooth color transition

4. Final touches:
   - Loading skeletons for all data grids
   - Error states with retry buttons
   - Empty states for all lists
   - Keyboard shortcuts (Cmd+K for search, etc.)

5. Build verification:
   - Run "bun run build"
   - Fix any TypeScript errors
   - Ensure all routes work

6. Git setup:
   - Initialize git if not exists
   - Create .gitignore (node_modules, .next, .env)
   - Commit all changes with message "feat: initial MCP Hub implementation"

7. README.md:
   - Project description
   - Installation instructions
   - Development setup
   - Screenshot placeholders
```

## Execution Order

1. Prompt 1 (Foundation) - blocking, others depend on it
2. Prompt 2 (Database) - blocking, needed for data
3. Prompts 3-6 (Pages) - can run sequentially
4. Prompt 7 (Layout) - after pages exist
5. Prompt 8 (Polish) - final step

## Codex Execution Notes

For each prompt:

- Use --sandbox workspace-write for file operations
- Use --model gpt-5.1-codex-mini for cost efficiency
- Verify each step completes before next
- If errors occur, fix incrementally
