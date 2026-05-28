"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

/**
 * A custom React hook that automatically detects, displays, and clears error messages from the URL.
 * 
 * It checks both URL search parameters (`?error=...`) and hash fragments (`#error=...`) 
 * for common error keys (`error_description`, `error`, `message`). If an error is found, 
 * it triggers a toast notification and strips the error keys from the URL to keep it clean 
 * and prevent the toast from reappearing on page refresh.
 * 
 * Perfect for handling authentication redirects (e.g., Supabase, Auth0, OAuth).
 *
 * @example
 * // Just call it at the top level of a client component or layout
 * useErrorToast();
 * 
 * @returns {void}
 */
export function useErrorToast() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const hash = new URLSearchParams(window.location.hash.substring(1))
        const keys = ["error_description", "error", "message"]

        const error = keys.map(k => searchParams.get(k) || hash.get(k)).find(Boolean)
        if (!error) return

        toast.error(decodeURIComponent(error.replace(/\+/g, " ")))

        const url = new URL(window.location.href)
        keys.forEach(k => {
            url.searchParams.delete(k)
            hash.delete(k)
        })

        url.hash = hash.toString()
        window.history.replaceState(null, "", url.toString())
    }, [searchParams])
}
