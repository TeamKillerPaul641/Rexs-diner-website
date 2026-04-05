export type DiscordSession = {
  id: string
  username: string
  avatar: string
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  if (match) {
    try {
      return decodeURIComponent(match[2])
    } catch {
      return match[2]
    }
  }
  return ""
}

function getCurrentSuffix(): string {
  const suffix = getCookie("discord_current_suffix")
  console.log("[v0] getCurrentSuffix - suffix:", suffix)
  return suffix
}

export function getDiscordSession(): DiscordSession | null {
  const suffix = getCurrentSuffix()
  console.log("[v0] getDiscordSession - suffix:", suffix)
  if (!suffix) return null
  const id = getCookie(`discord_id_${suffix}`)
  console.log("[v0] getDiscordSession - id:", id)
  if (!id) return null

  return {
    id,
    username: getCookie(`discord_username_${suffix}`),
    avatar: getCookie(`discord_avatar_${suffix}`),
  }
}

export function clearDiscordSessionLocal(): void {
  if (typeof document === "undefined") return
  // Remove every discord_ cookie we can see from JS
  const all = document.cookie.split(";")
  for (const c of all) {
    const name = c.split("=")[0].trim()
    if (name.startsWith("discord_")) {
      document.cookie = `${name}=; path=/; max-age=0`
      document.cookie = `${name}=; path=/; max-age=0; secure`
      document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
      document.cookie = `${name}=; path=/; max-age=0; secure; samesite=lax`
    }
  }
}

/**
 * Clears all discord session cookies both client-side and via the server
 * (the server Set-Cookie headers guarantee correct attribute matching).
 */
export async function clearDiscordSession(): Promise<void> {
  // 1. Immediate client-side wipe so the UI can react synchronously
  clearDiscordSessionLocal()

  // 2. Server-side wipe – the response Set-Cookie headers will clear cookies
  //    even when attribute matching prevented the client-side deletion.
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch {
    // If the server call fails, the client-side wipe above is our best effort
  }
}
