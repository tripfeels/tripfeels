import { pgTable, text, timestamp, uuid, jsonb, varchar, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Travellers table
export const travellers = pgTable('travellers', {
  id: uuid('id').defaultRandom().primaryKey(),
  ptc: varchar('ptc', { length: 10 }).notNull(), // Adult, Child, Infant
  givenName: varchar('given_name', { length: 100 }).notNull(),
  surname: varchar('surname', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }).notNull(), // Male, Female, Other
  birthdate: date('birthdate').notNull(),
  nationality: varchar('nationality', { length: 3 }).notNull(), // Country code (BD, US, etc.)
  
  // Contact Information
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  countryDialingCode: varchar('country_dialing_code', { length: 5 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  
  // Identity Document
  documentType: varchar('document_type', { length: 50 }).notNull(), // Passport, National ID, etc.
  documentId: varchar('document_id', { length: 100 }).notNull(),
  documentExpiryDate: date('document_expiry_date').notNull(),
  
  // Special Service Requests (SSR)
  ssrCodes: jsonb('ssr_codes').$type<string[]>().default([]),
  ssrRemarks: jsonb('ssr_remarks').$type<Record<string, string>>().default({}),
  
  // Loyalty Program
  loyaltyAirlineCode: varchar('loyalty_airline_code', { length: 10 }).default(''),
  loyaltyAccountNumber: varchar('loyalty_account_number', { length: 50 }).default(''),
  
  // Metadata
  createdBy: varchar('created_by', { length: 50 }).notNull(), // User role who created
  createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(), // User ID who created
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const travellersRelations = relations(travellers, ({ one }) => ({
  // Add relations here if needed (e.g., to users table)
}))

// Export types
export type Traveller = typeof travellers.$inferSelect
export type NewTraveller = typeof travellers.$inferInsert
