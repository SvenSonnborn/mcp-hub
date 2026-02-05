import { describe, expect, it } from 'vitest'
import { CreateServerSchema } from '@/lib/validators/servers'

const validPayload = {
  name: 'Acme MCP',
  description: 'A helpful MCP server for testing purposes.',
  publisher: 'Acme Labs',
  githubUrl: 'https://github.com/acme/mcp',
  installUrl: 'https://npmjs.com/package/acme-mcp',
  version: '1.0.0',
  category: 'API',
  tags: ['api', 'tools'],
}

describe('CreateServerSchema', () => {
  it('accepts valid data', () => {
    const result = CreateServerSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('fails when required fields are missing', () => {
    const result = CreateServerSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails on invalid URL', () => {
    const result = CreateServerSchema.safeParse({
      ...validPayload,
      githubUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('fails when description is too short', () => {
    const result = CreateServerSchema.safeParse({
      ...validPayload,
      description: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('fails when description is too long', () => {
    const result = CreateServerSchema.safeParse({
      ...validPayload,
      description: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('fails when too many tags are provided', () => {
    const result = CreateServerSchema.safeParse({
      ...validPayload,
      tags: ['1', '2', '3', '4', '5', '6'],
    })
    expect(result.success).toBe(false)
  })

  it('fails when no tags are provided', () => {
    const result = CreateServerSchema.safeParse({
      ...validPayload,
      tags: [],
    })
    expect(result.success).toBe(false)
  })

  it('fails when category is invalid', () => {
    const result = CreateServerSchema.safeParse({
      ...validPayload,
      category: 'INVALID',
    })
    expect(result.success).toBe(false)
  })
})
