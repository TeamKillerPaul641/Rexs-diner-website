"use client"

import { useEffect } from "react"
import { clearDiscordSessionLocal } from "@/lib/discord-session"

/**
 * Clears Discord session cookies when the user closes the tab or navigates
 * away from the site entirely.
 *
 * Uses the `pagehide` event (reliable on all modern browsers including Safari)
 * combined with `persisted === false` so we only clear when the page is truly
 * being discarded — not when the user just switches tabs or uses back/forward
 * cache.
 */
export function DiscordSessionGuard() {
  useEffect(() => {
    function handlePageHide(e: PageTransitionEvent) {
      // persisted === true means the page is going into bfcache (back-forward
      // cache) and will be reused — don't wipe cookies in that case.
      if (!e.persisted) {
        clearDiscordSessionLocal()
      }
    }

    window.addEventListener("pagehide", handlePageHide)
    return () => window.removeEventListener("pagehide", handlePageHide)
  }, [])

  return null
}
