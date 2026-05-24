"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { User } from "@supabase/supabase-js"

/**
 * Custom React hook to manage authentication user state and corresponding profile data.
 * Automatically fetches data on mount and provides a manual refresh trigger.
 * * @returns {Object} An object containing the authentication and profile states.
 * @returns {User | null} return.user - The Supabase Auth user object, or null if unauthenticated.
 * @returns {{ username: string | null; role: string } | null} return.profile - The user's profile information from the database.
 * @returns {boolean} return.loading - Flag indicating whether the data fetching is in progress.
 * @returns {string} return.displayName - A fallback-safe user-friendly name resolved from profile, metadata, or email.
 * @returns {() => Promise<void>} return.refresh - Function to manually re-fetch user and profile data.
 */
export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<{ username: string | null; role: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    /**
     * Fetches the current authenticated user and their profile data from Supabase.
     * * @async
     * @function getUser
     * @returns {Promise<void>}
     */
    const getUser = useCallback(async (isRefresh = false) => {
        if (isRefresh) setLoading(true)
        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
            
            if (authError) throw authError

            if (authUser) {
                setUser(authUser)
                
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("username, role")
                    .eq("id", authUser.id)
                    .single()
                
                if (!profileError) {
                    setProfile(profileData)
                }
            } else {
                setUser(null)
                setProfile(null)
            }
        } catch (error) {
            console.error("Error fetching user/profile:", error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        Promise.resolve().then(() => {
            getUser()
        })
    }, [getUser])

    /**
     * Resolves a user-friendly display name.
     */
    const displayName = profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"

    return { user, profile, loading, displayName, refresh: () => getUser(true) }
}
