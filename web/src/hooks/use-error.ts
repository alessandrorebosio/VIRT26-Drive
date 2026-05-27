"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

/**
 * Custom React hook that listens for error parameters in both the URL query string 
 * and URL hash fragment. If an error is detected, it displays a toast notification 
 * and automatically cleans up the URL parameters to prevent repeated toasts on refresh.
 *
 * @returns {void}
 */
export function useErrorToast(): void {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const errorKeys = ["error_description", "error", "message", "error_code"];

        let rawError = "";
        for (const key of errorKeys) {
            const val = searchParams.get(key) || hashParams.get(key);
            if (val) { rawError = val; break; }
        }

        if (!rawError) return;

        const message = decodeURIComponent(rawError.replace(/\+/g, " "));
        toast.error(message);

        const url = new URL(window.location.href);
        errorKeys.forEach(key => {
            url.searchParams.delete(key);
            hashParams.delete(key);
        });

        const newHash = hashParams.toString();
        url.hash = newHash ? `#${newHash}` : "";

        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        
    }, [searchParams, pathname]);
}
