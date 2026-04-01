import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const redirectTo = new URL("/", request.url)

  try {
    const body = await request.json().catch(() => ({}))
    if (body.redirectTo) {
      redirectTo.pathname = body.redirectTo
    }
  } catch {
    // ignore – default redirect to "/"
  }

  const response = NextResponse.json({ success: true })

  // Delete every discord_ cookie that was sent with the request
  const deleteOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  }

  for (const [name] of request.cookies) {
    if (name.startsWith("discord_")) {
      response.cookies.set(name, "", deleteOptions)
    }
  }

  return response
}
