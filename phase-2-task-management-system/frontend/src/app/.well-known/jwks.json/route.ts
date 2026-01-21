/**
 * JWKS Endpoint
 *
 * Exposes public keys for JWT verification.
 * Backend uses this endpoint to verify JWT tokens.
 *
 * URL: /.well-known/jwks.json
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db-schema";

export async function GET() {
  try {
    // Fetch all JWKS keys from database
    const keys = await db.select().from(schema.jwks);

    // Format as JWKS (JSON Web Key Set)
    const jwksResponse = {
      keys: keys.map((key) => {
        const publicKey = JSON.parse(key.publicKey);
        return {
          ...publicKey,
          kid: key.id, // Key ID
        };
      }),
    };

    // Return with caching headers
    return NextResponse.json(jwksResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Failed to fetch JWKS:", error);
    return NextResponse.json(
      { error: "Failed to fetch JWKS" },
      { status: 500 }
    );
  }
}
