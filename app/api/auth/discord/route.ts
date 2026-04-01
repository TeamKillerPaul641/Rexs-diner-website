import { NextResponse } from "next/server"
import { getWebsiteConfig } from "@/lib/user-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const returnTo = searchParams.get("returnTo") || "/bestellen"

  const config = await getWebsiteConfig()
  const clientId = config.discordBot?.clientId

  if (!clientId) {
    return NextResponse.json({ error: "Discord Client ID nicht konfiguriert. Bitte in der Admin-Seite unter Discord Bot eintragen." }, { status: 500 })
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/discord/callback`
  const scope = "identify"

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${encodeURIComponent(returnTo)}`

  return NextResponse.redirect(discordAuthUrl)
}
