import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ path: '.env.local' })
config() // fallback to .env

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
})
