"use client"

import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { useState, useCallback } from "react"
import { toast } from "sonner"

/**
 * Custom React hook to manage user account operations, such as 
 * updating profile information, handling email change flows, and updating passwords.
 * * @returns {Object} An object containing account state and mutation functions.
 * @returns {User | null} return.user - The currently authenticated user object from `useUser`.
 * @returns {{ username: string | null; role: string } | null} return.profile - The user's profile data from `useUser`.
 * @returns {boolean} return.loading - Loading state indicating if the initial user data is being fetched.
 * @returns {boolean} return.isUpdatingProfile - Form submission state indicating if a profile update operation is in progress.
 * @returns {boolean} return.isUpdatingPassword - Form submission state indicating if a password update operation is in progress.
 * @returns {(newUsername: string, newEmail: string) => Promise<void>} return.updateProfile - Function to update username and/or email address.
 * @returns {(password: string) => Promise<void>} return.updatePassword - Function to securely update the user's password.
 * @returns {() => Promise<void>} return.refresh - Function to manually re-authenticate and refresh the user session.
 * @returns {string | undefined} return.pendingEmail - The new email address awaiting confirmation, if a change is pending.
 */
export function useAccount() {
    const { user, profile, loading } = useUser()
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const supabase = createClient()

    /**
     * Refreshes the current Supabase authentication session and user profile.
     * * @async
     * @function refresh
     * @returns {Promise<void>}
     */
    const refresh = useCallback(async () => {
        try {
            await supabase.auth.getUser()
        } catch (error) {
            console.error("Error refreshing session:", error)
        }
    }, [supabase])

    /**
     * Updates the user's profile data in the database and handles email updates via Supabase Auth.
     * If the email has changed, a confirmation link will be sent to the new email address.
     * * @async
     * @function updateProfile
     * @param {string} newUsername - The new username to set for the profile.
     * @param {string} newEmail - The new email address to update in authentication.
     * @throws {Error} Throws an error if either the auth update or profile update fails.
     * @returns {Promise<void>}
     */
    const updateProfile = async (newUsername: string, newEmail: string) => {
        if (!user) return

        setIsUpdatingProfile(true)
        try {
            if (newEmail !== user.email) {
                const { error: authError } = await supabase.auth.updateUser({ email: newEmail }, {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                })
                if (authError) throw authError
                toast.info("A confirmation email has been sent to your new email address.")
            }

            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    username: newUsername,
                })

            if (profileError) throw profileError

            toast.success("Profile updated successfully")
            await refresh()
        } catch (error) {
            const err = error as Error
            console.error("Profile update error:", err)
            toast.error(err.message || "Failed to update profile")
            throw err
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    /**
     * Updates the authenticated user's password using Supabase Auth.
     * * @async
     * @function updatePassword
     * @param {string} password - The new password string (minimum required length depends on Supabase config, typically 6+ characters).
     * @throws {Error} Throws an error if the password update operation fails on the server.
     * @returns {Promise<void>}
     */
    const updatePassword = async (password: string) => {
        setIsUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            toast.success("Password updated successfully")
        } catch (error) {
            const err = error as Error
            console.error("Password update error:", err)
            toast.error(err.message || "Failed to update password")
            throw err
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    return {
        user,
        profile,
        loading,
        isUpdatingProfile,
        isUpdatingPassword,
        updateProfile,
        updatePassword,
        refresh,
        pendingEmail: user?.new_email
    }
}
