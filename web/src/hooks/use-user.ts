"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

/**
 * Object returned by the `useUser` hook.
 * * @typedef {Object} UseUserResult
 * @property {User | null} user - The authenticated Supabase user object, or null if not logged in.
 * @property {boolean} loading - Indicates whether the authentication state is currently being fetched.
 * @property {string} displayName - A user-friendly name derived from metadata, email, or a default fallback.
 */

/**
 * Custom React hook to retrieve and manage the current authenticated user's state.
 * Encapsulates Supabase authentication logic, loading states, and provides
 * a formatted display name for the user.
 * * @returns {UseUserResult} An object containing the user object, loading status, and display name.
 */
export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        /**
         * Fetches the current session user from Supabase auth.
         * Updates the user state and terminates the loading phase.
         * * @async
         * @returns {Promise<void>}
         */
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (!error) {
                setUser(user)
            }
            setLoading(false)
        }

        getUser()
    }, [])

    /**
     * Resolves a user-friendly display name from metadata or email.
     * Fallback order: full_name -> email prefix -> "User"
     * * @type {string}
     */
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"

    return { user, loading, displayName }
}
