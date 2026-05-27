import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, type NextResponse } from "next/server";

/**
 * Proxies incoming Next.js server requests to update or refresh the Supabase session.
 * This ensures that user authentication states remain synchronized across requests.
 *
 * @param {NextRequest} request - The incoming Next.js server request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the Next.js response object, 
 * potentially containing updated session headers or cookies.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
    return await updateSession(request);
}

/**
 * Next.js Middleware configuration object.
 * Defines which routes should trigger the session proxy logic.
 */
export const config = {
    /**
     * Route matcher pattern to filter incoming requests.
     * * Matches all request paths EXCEPT:
     * - `_next/static` (static files)
     * - `_next/image` (image optimization files)
     * - `favicon.ico` (favicon file)
     * - Common image extensions (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
