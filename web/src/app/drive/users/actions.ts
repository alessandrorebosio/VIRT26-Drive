"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Represents the merged user data from Supabase Auth and the profiles table.
 */
export type UserData = {
    id: string;
    email: string | undefined;
    username: string;
    role: string;
    created_at: string;
};

/**
 * Standardized response structure for Server Actions.
 */
type ActionResponse<T = void> =
    | { success: true; data: T; error?: never }
    | { success: false; data?: never; error: string }
    | (T extends void ? { success: true; data?: never; error?: never } : never);

/**
 * Fetches all users from Supabase Auth and merges them with their corresponding 
 * application profiles in an efficient O(N) operation.
 *
 * @async
 * @function getUsersAction
 * @returns {Promise<ActionResponse<UserData[]>>} A promise that resolves to a standardized action response containing the merged user data array or an error message.
 * @throws {Error} Soft-caught via try/catch and returned as a failure response object.
 */
export async function getUsersAction(): Promise<ActionResponse<UserData[]>> {
    try {
        const supabaseAdmin = createAdminClient();

        const [authResult, profileResult] = await Promise.all([
            supabaseAdmin.auth.admin.listUsers({ perPage: 10 }),
            supabaseAdmin.from("profiles").select("id, username, role")
        ]);

        if (authResult.error) throw authResult.error;
        if (profileResult.error) throw profileResult.error;

        const authUsers = authResult.data.users;
        const profiles = profileResult.data;

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        const mergedUsers: UserData[] = authUsers.map((authUser) => {
            const profile = profileMap.get(authUser.id);
            return {
                id: authUser.id,
                email: authUser.email,
                username: profile?.username || "N/A",
                role: profile?.role || "user",
                created_at: authUser.created_at,
            };
        });

        return { success: true, data: mergedUsers };
    } catch (error: any) {
        console.error("Error in getUsersAction:", error);
        return { success: false, error: error.message || "Failed to fetch users" };
    }
}

/**
 * Sends an email invitation to a new user and metadata assignment.
 * Triggers Next.js path revalidation for the users directory upon success.
 *
 * @async
 * @function inviteUserAction
 * @param {string} email - The email address of the user to invite.
 * @param {string} role - The initial application role to assign to the invited user.
 * @returns {Promise<ActionResponse<any>>} A promise that resolves to a success status with invitation data, or an error payload.
 */
export async function inviteUserAction(email: string, role: string): Promise<ActionResponse<any>> {
    try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { role },
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        });

        if (error) throw error;

        revalidatePath("/drive/users");
        return { success: true, data };
    } catch (error: any) {
        console.error("Error in inviteUserAction:", error);
        return { success: false, error: error.message || "Failed to invite user" };
    }
}

/**
 * Permanently deletes a user from Supabase Auth.
 * Triggers Next.js path revalidation for the users directory upon success.
 *
 * @async
 * @function deleteUserAction
 * @param {string} userId - The unique identifier of the user to delete.
 * @returns {Promise<ActionResponse>} A promise that resolves to a standardized success status or an error message.
 */
export async function deleteUserAction(userId: string): Promise<ActionResponse> {
    try {
        const supabaseAdmin = createAdminClient();

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) throw error;

        revalidatePath("/drive/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error in deleteUserAction:", error);
        return { success: false, error: error.message || "Failed to delete user" };
    }
}
