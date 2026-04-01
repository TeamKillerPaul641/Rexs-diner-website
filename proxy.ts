import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // Check maintenance mode by fetching from API
  // Skip maintenance check for admin, maintenance page, api routes, and static assets
  const pathname = request.nextUrl.pathname
  const shouldCheckMaintenance = !pathname.startsWith('/admin') &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')

  if (shouldCheckMaintenance) {
    try {
      // Fetch maintenance status from the public JSON file
      const maintenanceUrl = new URL('/maintenance.json', request.url)
      const response = await fetch(maintenanceUrl)
      if (response.ok) {
        const maintenance = await response.json()
        if (maintenance.active) {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      }
    } catch (error) {
      // If fetch fails, continue normally
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}