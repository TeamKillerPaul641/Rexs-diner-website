import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function middleware(request: NextRequest) {
  // Check maintenance mode
  try {
    const filePath = path.join(process.cwd(), 'public', 'maintenance.json')
    const data = fs.readFileSync(filePath, 'utf8')
    const maintenance = JSON.parse(data)
    if (maintenance.active && !request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/maintenance') && !request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  } catch (error) {
    // If file doesn't exist or error, continue
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
