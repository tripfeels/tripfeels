import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create Neon client
const sql = neon(connectionString)

// Create Drizzle database instance
export const db = drizzle(sql, { schema })

// Export schema for use in other files
export * from './schema'
