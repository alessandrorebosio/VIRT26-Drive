import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates and initializes a Supabase client for Server-Side environments in Next.js 
 * (Server Components, Server Actions, Route Handlers, and Middleware).
 * * This client automatically manages user authentication sessions by reading and writing 
 * HTTP-only cookies directly through Next.js headers.
 * * **CRITICAL SECURITY NOTE:** Especially important if using Fluid compute or serverless environments: 
 * Do not store this client instance in a global variable. Always invoke `createClient()` 
 * to generate a fresh instance within each function or scope where it is required.
 * * @example
 * ```ts
 * // Using inside a Server Component or Server Action
 * import { createClient } from "@/lib/supabase/server";
 * * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 * * @returns {Promise<ReturnType<typeof createServerClient>>} A promise that resolves to the initialized Supabase server client instance.
 */
export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
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
			 * @returns {Array<{ name: string; value: string }>} An array of cookie objects.
			 */
			getAll() {
				return cookieStore.getAll();
			},
			/**
			 * Sets or updates cookies in the current response context.
			 * * @note The `catch` block safely suppresses exceptions when this method is implicitly 
			 * called from a Server Component (where mutating cookies is forbidden by Next.js architecture). 
			 * This behavior is safe to ignore if you have a middleware/proxy refreshing user sessions.
			 * * @param {Array<{ name: string; value: string; options: any }>} cookiesToSet - Array of cookies to persist.
			 */
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options),
					);
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have proxy refreshing
					// user sessions.
				}
			},
		},
	});
}
