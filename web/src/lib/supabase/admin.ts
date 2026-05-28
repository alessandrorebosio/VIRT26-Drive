import { createClient } from "@supabase/supabase-js";

/**
 * Creates and initializes a Supabase administrative client for use strictly in server-side environments.
 * This client utilizes the `SUPABASE_SERVICE_ROLE_KEY` to bypass all Row Level Security (RLS) policies.
 * * @warning This client must NEVER be used on the client-side ('use client') or exposed to the browser, 
 * as it grants full root access to your entire Supabase database and authentication system.
 * * @example
 * ```typescript
 * // Inside a Server Action or Route Handler (API)
 * "use server";
 * import { createAdminClient } from "@/lib/supabase/admin";
 * * const supabaseAdmin = createAdminClient();
 * // e.g., Invite a user by email bypassing standard registration flows
 * await supabaseAdmin.auth.admin.inviteUserByEmail("user@example.com");
 * ```
 * * @returns {ReturnType<typeof createClient>} An initialized Supabase admin client instance.
 * @throws {Error} If the secret service role environment variable is missing or evaluated on the client-side.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
