import { z } from 'zod'

export const CreateServerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  publisher: z.string().min(1).max(100),
  githubUrl: z.string().url(),
  installUrl: z.string().url(),
  version: z.string().min(1).max(50).default('1.0.0'),
  category: z.enum([
    'FILESYSTEM',
    'DATABASE',
    'API',
    'VERSION_CONTROL',
    'COMMUNICATION',
    'SEARCH',
    'AI_SERVICE',
    'DEV_TOOL',
    'OTHER',
  ]),
  tags: z.array(z.string()).min(1).max(5),
})

export type CreateServerInput = z.infer<typeof CreateServerSchema>
