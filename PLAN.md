# MCP Hub - Product Specification

## Vision
Das "App Store & Control Center" für Model Context Protocol (MCP) Server. 
MCP Hub macht die Entdeckung, Installation und Verwaltung von MCP-Servern 
so einfach wie npm packages oder Docker containers.

## Core Value Propositions

1. **Discovery**: Finde MCP-Server aus einer kuratierten Registry
2. **One-Click Install**: Installiere MCP-Server ohne manuelle Config
3. **Unified Management**: Ein Dashboard für alle lokalen MCP-Server
4. **Health Monitoring**: Sehe Status, Logs und Performance aller Server
5. **Config Sync**: Ein Config-File für alle AI Tools (Claude, Cursor, etc.)

## Target Audience
- AI-Native Entwickler (nutzen Claude/Cursor täglich)
- DevOps Engineers (managen AI-Infrastructure)
- AI Tool Builders (erstellen eigene MCP-Server)

## Tech Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript 5.5+
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **State**: Zustand + TanStack Query
- **Database**: SQLite (local) / PostgreSQL (cloud)
- **ORM**: Prisma

### Design System
- **Primary**: Slate/Zinc Farbpalette (Developer-freundlich)
- **Accent**: Violet/Purple (AI/Tech Vibe)
- **Typography**: Inter (Body), JetBrains Mono (Code)
- **Radius**: Medium (8px) für Cards, Small (4px) für Inputs
- **Spacing**: 4px Base Grid (4, 8, 12, 16, 24, 32, 48)

### Icons
- **Lucide React** (konsistent, modern)

## Architecture

### Database Schema (Prisma)

```prisma
// MCP Server Registry (curated list)
model MCPServer {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  publisher   String
  githubUrl   String
  installUrl  String   // npm package or git repo
  version     String
  category    Category
  tags        String[]
  configSchema Json?   // JSON Schema for configuration
  isOfficial  Boolean  @default(false)
  isVerified  Boolean  @default(false)
  downloadCount Int    @default(0)
  rating      Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  installations MCPInstallation[]
}

// Local Installations
model MCPInstallation {
  id          String   @id @default(cuid())
  serverId    String
  server      MCPServer @relation(fields: [serverId], references: [id])
  
  // Local config
  status      ServerStatus @default(PENDING)
  config      Json?        // User's config values
  port        Int?         // If server runs on port
  pid         Int?         // Process ID
  
  // Health tracking
  lastPing    DateTime?
  isHealthy   Boolean   @default(false)
  errorLog    String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Category {
  FILESYSTEM
  DATABASE
  API
  VERSION_CONTROL
  COMMUNICATION
  SEARCH
  AI_SERVICE
  DEV_TOOL
  OTHER
}

enum ServerStatus {
  PENDING
  INSTALLING
  RUNNING
  STOPPED
  ERROR
  UPDATING
}
```

## Feature Specifications

### 1. Registry Browser (/registry)
**Purpose**: Entdecke und suche MCP-Server

**Layout**:
- Header mit Search + Filter
- Sidebar: Kategorien (Filesystem, Database, API, etc.)
- Main: Grid/List von Server Cards

**Server Card**:
- Icon (Category-based)
- Name + Publisher Badge (verified/official)
- Short Description (2 lines max)
- Tags (max 3)
- Download Count + Rating
- "Install" Button
- Click → Detail View

**Interactions**:
- Search: Instant mit Debounce (300ms)
- Filter: Multi-select Categories
- Sort: Downloads | Rating | Recently Added

### 2. Server Detail View (/registry/[id])
**Purpose**: Detaillierte Info + Installation

**Layout**:
- Hero: Icon + Name + Publisher + Action Buttons
- Tabs: Overview | Config | Versions | Docs
- Sidebar: Quick Stats (Downloads, Version, License)

**Overview Tab**:
- Full Description (Markdown)
- Screenshots/GIFs
- Key Features List
- GitHub Link

**Config Tab**:
- JSON Schema visualizer
- Form fields based on schema
- Validation live

**Actions**:
- "Install" → Install Modal
- "Copy Config" → JSON für manuelle Config

### 3. Dashboard (/)
**Purpose**: Management aller installierten Server

**Layout**:
- Stats Row: Total | Running | Stopped | Errors
- Grid: Installed Server Cards
- Empty State: CTA zu Registry

**Installed Server Card**:
- Status Indicator (Green/Yellow/Red dot)
- Server Name + Version
- Last Ping time
- Quick Actions: Start | Stop | Restart | Settings | Logs
- Expand: Live Logs (last 50 lines)

**Interactions**:
- Real-time Status Updates (SSE/WebSocket)
- Bulk Actions: Start All | Stop All
- Drag & Drop to reorder

### 4. Config Manager (/config)
**Purpose**: Unified MCP Config für alle Tools

**Layout**:
- Tool Selector: Claude | Cursor | Windsurf | Generic
- Generated Config Preview (JSON)
- Copy Button
- Export to File

**Features**:
- Auto-generate config aus installierten Servern
- Per-Tool presets (verschiedene Formate)
- Validation gegen MCP Spec

### 5. Health Monitor (/monitor)
**Purpose**: Deep-dive in Server Performance

**Layout**:
- Server Selector Dropdown
- Charts: Response Time | Request Rate | Error Rate
- Logs: Searchable, Filterable (Level, Time)
- Alerts: Configure thresholds

## UI/UX Design Principles

### Dark Mode First
- Primary Background: `slate-950`
- Card Background: `slate-900`
- Border: `slate-800`
- Text Primary: `slate-100`
- Text Secondary: `slate-400`
- Accent: `violet-500` (primary), `violet-400` (hover)

### Status Colors
- Running: `emerald-500`
- Stopped: `slate-500`
- Error: `rose-500`
- Warning: `amber-500`
- Loading: `blue-500`

### Animations
- Page Transitions: 200ms ease-out
- Card Hover: translateY(-2px) + shadow increase
- Status Pulse: Subtle animation for "Running"
- Loading: Skeleton screens, nicht Spinner

### Responsive Breakpoints
- Mobile: < 640px (Single Column)
- Tablet: 640px - 1024px (2 Columns)
- Desktop: > 1024px (3-4 Columns)

## File Structure

```
app/
├── (dashboard)/
│   ├── page.tsx                    # Dashboard Home
│   ├── layout.tsx                  # Dashboard Layout
│   ├── registry/
│   │   ├── page.tsx               # Registry Browser
│   │   └── [id]/
│   │       └── page.tsx           # Server Detail
│   ├── config/
│   │   └── page.tsx               # Config Manager
│   └── monitor/
│       └── page.tsx               # Health Monitor
├── api/
│   ├── mcp-servers/
│   │   ├── route.ts               # CRUD Registry
│   │   └── [id]/
│   │       └── install/route.ts   # Install endpoint
│   └── installations/
│       └── route.ts               # Manage local instances
├── layout.tsx                      # Root Layout
└── globals.css                     # Tailwind + Theme

components/
├── ui/                            # shadcn components
├── registry/
│   ├── ServerCard.tsx
│   ├── ServerGrid.tsx
│   ├── CategoryFilter.tsx
│   └── SearchBar.tsx
├── dashboard/
│   ├── InstalledCard.tsx
│   ├── StatusBadge.tsx
│   ├── LogViewer.tsx
│   └── StatsRow.tsx
├── config/
│   ├── ConfigPreview.tsx
│   └── ToolSelector.tsx
└── layout/
    ├── Sidebar.tsx
    ├── Header.tsx
    └── ThemeToggle.tsx

lib/
├── prisma.ts                      # Database client
├── mcp.ts                         # MCP operations
├── config-generator.ts            # Config generation
└── utils.ts                       # Helpers

prisma/
└── schema.prisma                  # Database schema

public/
└── icons/                         # Category icons
```

## API Endpoints

### Registry
```
GET    /api/mcp-servers              # List all (with filters)
GET    /api/mcp-servers/[id]         # Single server details
POST   /api/mcp-servers              # Add new (admin)
```

### Installations
```
GET    /api/installations            # List local installations
POST   /api/installations            # Install server
PATCH  /api/installations/[id]       # Update (start/stop/config)
DELETE /api/installations/[id]       # Uninstall
```

### Config
```
GET    /api/config/[tool]            # Generate config for tool
```

### Health
```
GET    /api/health/[id]              # Server health status
GET    /api/health/[id]/logs         # Server logs
```

## Phase 1 Implementation Plan

### Milestone 1: Foundation (Day 1)
1. Next.js 16 + Tailwind v4 setup
2. Prisma schema + SQLite setup
3. Base layout (Sidebar + Header)
4. Theme configuration (Dark mode)
5. Shadcn/ui component library setup

### Milestone 2: Registry Browser (Day 1-2)
1. Database seed with sample MCP servers
2. Registry page with Grid/List view
3. Search + Filter functionality
4. Server Card component
5. Server Detail page

### Milestone 3: Dashboard (Day 2-3)
1. Installation system
2. Dashboard with installed servers
3. Start/Stop functionality
4. Status indicators
5. Basic logs viewer

### Milestone 4: Config Manager (Day 3)
1. Config generator
2. Tool presets (Claude, Cursor)
3. Copy/Export functionality

### Milestone 5: Polish (Day 4)
1. Health monitoring page
2. Animations + Micro-interactions
3. Error handling
4. Loading states
5. Responsive design

## Success Metrics

- Installation < 30 Sekunden
- Server start < 5 Sekunden
- Page load < 1 Sekunde
- 100% TypeScript coverage
- Lighthouse Score > 90

## Future Features (Post-MVP)

- Team collaboration (share configs)
- Cloud MCP hosting
- Auto-updates for servers
- Plugin system für custom integrations
- MCP Server Builder (generate from OpenAPI)
