/**
 * Drizzle ORM Schema for Better Auth
 *
 * Define database tables that Better Auth requires.
 * These tables are shared with the backend FastAPI app.
 *
 * IMPORTANT: Better Auth stores passwords in the 'accounts' table, NOT in the 'users' table!
 */

import { pgTable, uuid, varchar, boolean, timestamp, text, index } from "drizzle-orm/pg-core";

// Users table - NO password field here!
export const user = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email").notNull().unique(),
  name: varchar("name", { length: 100 }), // Nullable - Better Auth may not provide name
  emailVerified: boolean("email_verified").notNull().default(false),
  image: varchar("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table
export const session = pgTable("sessions", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("sessions_userId_idx").on(table.userId),
]);

// Account table (for Better Auth OAuth providers and email/password)
export const account = pgTable("accounts", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"), // Hashed password for email/password authentication
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("accounts_userId_idx").on(table.userId),
]);

// Verification table (for email verification tokens)
export const verification = pgTable("verifications", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  identifier: varchar("identifier").notNull(),
  value: varchar("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// JWKS table (for JWT public/private key pairs)
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey().notNull(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
