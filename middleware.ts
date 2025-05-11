import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Default Next.js middleware to allow all requests
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

/**
 * The following code enables authentication with Clerk
 */
const isProtectedRoute = createRouteMatcher(['/protected'])

export default clerkMiddleware(async (_auth, req) => {
    if (isProtectedRoute(req)) {
      // Handle protected routes check here
      return NextResponse.redirect(req.nextUrl.origin)
    }

    return NextResponse.next()
}) 

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api/webhooks).*)",
  ],
}