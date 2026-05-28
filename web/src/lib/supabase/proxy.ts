import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "./admin";

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
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
		global: {
			fetch: (url, options) => {
				if
					(process.env.SUPABASE_INTERNAL_URL) {
					return fetch(
						url.toString().replace(
							process.env.NEXT_PUBLIC_SUPABASE_URL!,
							process.env.SUPABASE_INTERNAL_URL
						),
						options,
					);
				} return fetch(url, options);
			},
		},
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
	});

	// Do not run code between createServerClient and
	// supabase.auth.getClaims(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: If you remove getClaims() and you use server-side rendering
	// with the Supabase client, your users may be randomly logged out.
	const { data } = await supabase.auth.getClaims();
	const user = data?.claims;
	const pathname = request.nextUrl.pathname;

	if (!user) {
		const supabaseAdmin = createAdminClient();

		const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
		if (!users?.length || error) {
			if (pathname !== "/setup/profile") {
				return NextResponse.redirect(new URL("/setup/profile", request.url));
			}
			return NextResponse.next();
		}

		const { data: bucket, error: bucketError } = await supabaseAdmin.storage.getBucket("files");
		if (!bucket || bucketError) {
			if (pathname !== "/setup/start-up") {
				return NextResponse.redirect(new URL("/setup/start-up", request.url));
			}
			return NextResponse.next();
		}

		if (!pathname.startsWith("/auth")) {
			return NextResponse.redirect(new URL("/auth/sign-in", request.url));
		}
	} else {
		if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/setup")) {
			return NextResponse.redirect(new URL("/drive", request.url));
		}
	}

	return supabaseResponse;
}
