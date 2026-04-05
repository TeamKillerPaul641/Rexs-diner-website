import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const returnTo = searchParams.get("returnTo") || "/bestellen"

  // Use service role to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Datenbankverbindung fehlgeschlagen." }, { status: 500 })
  }
  
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const { data, error } = await supabase
    .from("website_config")
    .select("config_value")
    .eq("config_key", "discord_bot")
    .single()

  console.log("[v0] Discord auth - config query result:", JSON.stringify(data), "error:", JSON.stringify(error))

  if (error || !data) {
    return NextResponse.json({ error: "Discord Bot Konfiguration nicht gefunden." }, { status: 500 })
  }

  let discordBotConfig = data.config_value
  if (typeof discordBotConfig === "string") {
    try {
      discordBotConfig = JSON.parse(discordBotConfig)
    } catch {
      return NextResponse.json({ error: "Ungültige Discord Bot Konfiguration." }, { status: 500 })
    }
  }

  const clientId = discordBotConfig?.clientId

  if (!clientId) {
    return NextResponse.json({ error: "Discord Client ID nicht konfiguriert. Bitte in der Admin-Seite unter Discord Bot eintragen." }, { status: 500 })
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/discord/callback`
  const scope = "identify"

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${encodeURIComponent(returnTo)}`

  return NextResponse.redirect(discordAuthUrl)
}
