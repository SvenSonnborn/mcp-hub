import { prisma } from '../lib/prisma'
import { Category } from '@prisma/client'

const sampleServers = [
  {
    name: 'filesystem',
    description: 'Secure file system operations with configurable access controls. Read, write, and manage files with fine-grained permissions.',
    publisher: 'Anthropic',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    installUrl: 'npm:@modelcontextprotocol/server-filesystem',
    version: '1.0.0',
    category: Category.FILESYSTEM,
    tags: 'official,filesystem,tools',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Allowed file system paths',
        },
      },
      required: ['paths'],
    }),
    isOfficial: true,
    isVerified: true,
    downloadCount: 125000,
    rating: 4.8,
  },
  {
    name: 'github',
    description: 'GitHub integration for repository management, issues, pull requests, and code search. Full API access with secure authentication.',
    publisher: 'Anthropic',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    installUrl: 'npm:@modelcontextprotocol/server-github',
    version: '1.0.0',
    category: Category.VERSION_CONTROL,
    tags: 'official,github,api',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'GitHub Personal Access Token',
        },
      },
      required: ['token'],
    }),
    isOfficial: true,
    isVerified: true,
    downloadCount: 89000,
    rating: 4.7,
  },
  {
    name: 'postgres',
    description: 'PostgreSQL database integration with read-only and read-write modes. Execute queries with parameterized inputs for security.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    installUrl: 'npm:@modelcontextprotocol/server-postgres',
    version: '1.0.0',
    category: Category.DATABASE,
    tags: 'database,postgres,sql',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        connectionString: {
          type: 'string',
          description: 'PostgreSQL connection string',
        },
      },
      required: ['connectionString'],
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 45000,
    rating: 4.5,
  },
  {
    name: 'slack',
    description: 'Slack workspace integration for sending messages, managing channels, and accessing conversation history.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    installUrl: 'npm:@modelcontextprotocol/server-slack',
    version: '1.0.0',
    category: Category.COMMUNICATION,
    tags: 'slack,communication,api',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Slack Bot Token',
        },
      },
      required: ['token'],
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 32000,
    rating: 4.3,
  },
  {
    name: 'fetch',
    description: 'HTTP client for making web requests with configurable timeouts, retries, and response parsing.',
    publisher: 'Anthropic',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    installUrl: 'npm:@modelcontextprotocol/server-fetch',
    version: '1.0.0',
    category: Category.API,
    tags: 'official,api,http',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        maxResponseSize: {
          type: 'number',
          default: 10000,
          description: 'Maximum response size in bytes',
        },
      },
    }),
    isOfficial: true,
    isVerified: true,
    downloadCount: 78000,
    rating: 4.6,
  },
  {
    name: 'brave-search',
    description: 'Brave Search API integration for web search with privacy-focused results. Includes image and news search.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    installUrl: 'npm:@modelcontextprotocol/server-brave-search',
    version: '1.0.0',
    category: Category.SEARCH,
    tags: 'search,brave,api',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        apiKey: {
          type: 'string',
          description: 'Brave Search API Key',
        },
      },
      required: ['apiKey'],
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 28000,
    rating: 4.4,
  },
  {
    name: 'sqlite',
    description: 'SQLite database operations with support for complex queries, transactions, and schema management.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    installUrl: 'npm:@modelcontextprotocol/server-sqlite',
    version: '1.0.0',
    category: Category.DATABASE,
    tags: 'database,sqlite,sql',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        dbPath: {
          type: 'string',
          description: 'Path to SQLite database file',
        },
      },
      required: ['dbPath'],
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 35000,
    rating: 4.5,
  },
  {
    name: 'git',
    description: 'Git operations for repository management, commit history, branch operations, and diffs.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
    installUrl: 'npm:@modelcontextprotocol/server-git',
    version: '1.0.0',
    category: Category.VERSION_CONTROL,
    tags: 'git,version-control,dev-tool',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        repositoryPath: {
          type: 'string',
          description: 'Path to Git repository',
        },
      },
      required: ['repositoryPath'],
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 41000,
    rating: 4.4,
  },
  {
    name: 'puppeteer',
    description: 'Browser automation with Puppeteer for web scraping, screenshots, and PDF generation.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    installUrl: 'npm:@modelcontextprotocol/server-puppeteer',
    version: '1.0.0',
    category: Category.DEV_TOOL,
    tags: 'browser,automation,scraping',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        headless: {
          type: 'boolean',
          default: true,
          description: 'Run browser in headless mode',
        },
      },
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 22000,
    rating: 4.2,
  },
  {
    name: 'playwright',
    description: 'Browser automation with Playwright for cross-browser testing and web automation.',
    publisher: 'Community',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/playwright',
    installUrl: 'npm:@modelcontextprotocol/server-playwright',
    version: '1.0.0',
    category: Category.DEV_TOOL,
    tags: 'browser,automation,testing',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        browser: {
          type: 'string',
          enum: ['chromium', 'firefox', 'webkit'],
          default: 'chromium',
          description: 'Browser to use',
        },
      },
    }),
    isOfficial: false,
    isVerified: true,
    downloadCount: 19000,
    rating: 4.3,
  },
]

async function main() {
  console.log('Start seeding...')

  for (const server of sampleServers) {
    const created = await prisma.mCPServer.upsert({
      where: { name: server.name },
      update: server,
      create: server,
    })
    console.log(`Created/Updated server: ${created.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
