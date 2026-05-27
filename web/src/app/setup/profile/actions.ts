"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a new administrator account in Supabase Auth and provisions 
 * an associated admin profile in the database using the admin service client.
 *
 * @param {string} input.username - The username for the admin profile.
 * @param {string} input.email - The email address for the auth account.
 * @param {string} input.password - The password for the auth account.
 * @returns {Promise<AdminAccountResponse>} An object indicating either operation success or an error message.
 * * @example
 * const result = await createAdminAccount({ username: "Admin", email: "admin@example.com", password: "secretPassword" });
 * if (result.error) {
 * console.error(result.error);
 * } else {
 * console.log("Account created!");
 * }
 */
export async function createAdminAccount({ username, email, password }: {
    username: string;
    email: string;
    password: string;
}) {
    const supabaseAdmin = createAdminClient();

    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (authError || !userData.user) {
        return { error: authError?.message || "An error occurred while creating the user account." };
    }

    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
            id: userData.user.id,
            username: username,
            role: "admin",
        });

    if (profileError) {
        return { error: profileError.message };
    }

    return { success: true };
}
