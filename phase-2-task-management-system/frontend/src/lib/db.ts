/**
 * Drizzle Database Connection for Neon PostgreSQL
 *
 * Connects to the Neon PostgreSQL database for Better Auth.
 * Better Auth stores user accounts, sessions, and verification tokens here.
 *
 * Note: This is the SAME Neon database as the backend FastAPI app uses.
 * Both frontend (Better Auth) and backend (FastAPI) share the same database.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./db-schema";

// Get database URL from environment
const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create Neon HTTP client (optimized for serverless/edge)
const sql = neon(connectionString);

// Create Drizzle instance with Neon HTTP adapter and schema
export const db = drizzle(sql, { schema });
