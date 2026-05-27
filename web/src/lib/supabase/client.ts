import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates and initializes a Supabase client for use in browser-based (client-side) environments.
 * This client utilizes the `@supabase/ssr` package to automatically handle session sync 
 * via cookies within Next.js Client Components.
 * * @example
 * ```tsx
 * "use client";
 * import { createClient } from "@/lib/supabase/client";
 * * const supabase = createClient();
 * const { data } = await supabase.from("todos").select("*");
 * ```
 * * @returns {ReturnType<typeof createBrowserClient>} An initialized Supabase browser client instance.
 * @throws {Error} If the required environment variables are missing during runtime initialization.
 */
export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
	);
}
