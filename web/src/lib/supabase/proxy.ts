import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates and refreshes the Supabase authentication session within the Next.js Middleware/Proxy layer.
 * This function intercepts incoming requests, reads/writes auth tokens via cookies, protects private routes, 
 * and ensures the client and server states remain perfectly synchronized.
 * * **CRITICAL RULES FOR MAINTENANCE:**
 * 1. **Do not cache this client:** In serverless or Fluid compute environments, never store this client instance in a global variable. Always create a fresh instance per request.
 * 2. **Authentication Guard:** Do not run any code between `createServerClient` and `supabase.auth.getClaims()`. Altering this execution order can cause hard-to-debug issues where users are randomly logged out.
 * 3. **Session Synchronization:** If you modify this function to return a custom response instead of `supabaseResponse`, you **must** manually forward the request object and clone the cookies using `myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())` to avoid terminating user sessions prematurely.
 * * @param {NextRequest} request - The incoming Next.js server request object.
 * @returns {Promise<NextResponse>} A promise that resolves to a `NextResponse` object containing the updated session cookies or a redirection to the login page.
 */
export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	// With Fluid compute, don't put this client in a global environment
	// variable. Always create a new one on each request.
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				/**
				 * Retrieves all cookies from the current incoming request.
				 * @returns {Array<{ name: string; value: string }>} An array of request cookies.
				 */
				getAll() {
					return request.cookies.getAll();
				},
				/**
				 * Synchronizes updated session cookies across the request lifecycle and the final response.
				 * @param {Array<{ name: string; value: string; options: any }>} cookiesToSet - The list of auth cookies to persist.
				 */
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getClaims(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: If you remove getClaims() and you use server-side rendering
	// with the Supabase client, your users may be randomly logged out.
	const { data } = await supabase.auth.getClaims();
	const user = data?.claims;

	if (
		request.nextUrl.pathname !== "/" &&
		!user &&
		!request.nextUrl.pathname.startsWith("/auth")
	) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = "/auth/sign-in";
		return NextResponse.redirect(url);
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
}
