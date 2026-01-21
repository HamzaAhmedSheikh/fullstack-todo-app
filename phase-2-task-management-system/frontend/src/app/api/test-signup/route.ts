/**
 * Test Signup Route - Debug Better Auth signup issues
 */

import { auth } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📝 Signup request:", { email: body.email, name: body.name });

    // Try to create user directly with Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
      asResponse: true,
    });

    console.log("✅ Signup successful:", result.status);
    return result;
  } catch (error: any) {
    console.error("❌ Signup error details:", {
      message: error?.message,
      cause: error?.cause,
      stack: error?.stack,
      name: error?.name,
      full: error,
    });

    return NextResponse.json(
      {
        error: error?.message || "Unknown error",
        details: error?.cause || error?.stack || String(error),
      },
      { status: 500 }
    );
  }
}
