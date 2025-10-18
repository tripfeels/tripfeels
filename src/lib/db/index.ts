import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL environment variable is not set. Database features will be unavailable.')
}

// Create Neon client only if connection string exists
const sql = connectionString ? neon(connectionString) : null

// Create Drizzle database instance
export const db = sql ? drizzle(sql, { schema }) : null

// Export schema for use in other files
export * from './schema'
