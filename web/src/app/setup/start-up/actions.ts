"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates the required 'files' storage bucket if it doesn't already exist.
 * This is the final step of the initial system setup.
 * 
 * @returns {Promise<{ success?: boolean, error?: string }>} An object indicating success or error.
 */
export async function createFilesBucket() {
    const supabaseAdmin = createAdminClient();

    const { data: bucket, error: checkError } = await supabaseAdmin.storage.getBucket("files");

    if (bucket && !checkError) {
        return { success: true };
    }

    const { error: createError } = await supabaseAdmin.storage.createBucket("files", {
        public: false,
    });

    if (createError) {
        return { error: createError.message };
    }

    return { success: true };
}
