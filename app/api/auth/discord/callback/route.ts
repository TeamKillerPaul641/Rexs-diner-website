import { type NextRequest, NextResponse } from "next/server"
import { getWebsiteConfig } from "@/lib/user-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state") || "/bestellen"

  // common cookie options for clearing data
  const deleteOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  }

  // clear any discord-related cookie present in the request
  const clearCookies = (res: NextResponse) => {
    for (const [name] of request.cookies) {
      if (name.startsWith("discord_")) {
        res.cookies.set(name, "", deleteOptions)
      }
    }
  }

  if (!code) {
    const res = NextResponse.redirect(new URL(`${state}?error=no_code`, request.url))
    clearCookies(res)
    return res
  }


  const config = await getWebsiteConfig()
  const clientId = config.discordBot?.clientId
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = `${new URL(request.url).origin}/api/auth/discord/callback`

  if (!clientId || !clientSecret) {
    const res = NextResponse.redirect(new URL(`${state}?error=not_configured`, request.url))
    clearCookies(res)
    return res
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Discord token error:", errorText)
      const res = NextResponse.redirect(new URL(`${state}?error=token_failed`, request.url))
      clearCookies(res)
      return res
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      const res = NextResponse.redirect(new URL(`${state}?error=user_failed`, request.url))
      clearCookies(res)
      return res
    }

    const userData = await userResponse.json()

    const avatarUrl = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : ""

    // if we have bot credentials, check membership and add if missing
    const botToken = config.discordBot?.token
    const guildId = config.discordBot?.guildId
    const DISCORD_API = "https://discord.com/api/v10"

    if (botToken && guildId) {
      try {
        // check if user is already a member
        const memberRes = await fetch(
          `${DISCORD_API}/guilds/${guildId}/members/${userData.id}`,
          {
            headers: { Authorization: `Bot ${botToken}` },
          }
        )

        if (memberRes.status === 404) {
          // not in guild yet, attempt to add
          const joinRes = await fetch(
            `${DISCORD_API}/guilds/${guildId}/members/${userData.id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bot ${botToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ access_token: tokenData.access_token }),
            }
          )

          if (!joinRes.ok) {
            console.error("Discord guild join failed:", await joinRes.text())
          } else {
            console.log("Discord user added to guild", guildId)
          }
        }
      } catch (err) {
        console.error("Error checking/adding guild member:", err)
      }
    }

    const redirectUrl = new URL(state, request.url)
    const response = NextResponse.redirect(redirectUrl)

    // before setting new cookies take a fresh suffix and wipe the previous ones

    // Short-lived cookies (12 h). Pure session cookies (no maxAge) are
    // unreliable because modern browsers restore them via "Continue where
    // you left off" / session-restore.  A finite maxAge guarantees they
    // expire even when the browser keeps them across restarts.
    const TWELVE_HOURS = 60 * 60 * 12
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: TWELVE_HOURS,
    }

    clearCookies(response)
    const newSuffix = Date.now().toString()
    response.cookies.set("discord_current_suffix", newSuffix, cookieOptions)

    // set discord data cookies for client
    response.cookies.set(`discord_id_${newSuffix}`, userData.id, cookieOptions)
    response.cookies.set(`discord_username_${newSuffix}`, userData.username, cookieOptions)
    response.cookies.set(`discord_avatar_${newSuffix}`, avatarUrl, cookieOptions)

    return response
  } catch (error) {
    console.error("Discord OAuth error:", error)
    const res = NextResponse.redirect(new URL(`${state}?error=server_error`, request.url))
    clearCookies(res)
    return res
  }
}
