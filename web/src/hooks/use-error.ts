"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

/**
 * Custom React hook that listens to specific URL search parameters (`error` or `message`),
 * triggers a client-side toast notification if found, and cleanly strips those parameters
 * from the browser's URL bar without triggering a page reload.
 * * @example
 * // If URL is: /dashboard?error=Access%20Denied
 * useErrorToast();
 * // Action: Shows toast.error("Access Denied") and updates URL to /dashboard
 * * @returns {void} This hook does not return any value.
 */
export function useErrorToast(): void {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const hashParams = new URLSearchParams(typeof window !== "undefined" ? window.location.hash.slice(1) : "");

		const finalError =
			searchParams.get("error_description") || searchParams.get("error") || searchParams.get("message") ||
			hashParams.get("error_description") || hashParams.get("error") || hashParams.get("message");

		if (!finalError) return;

		console.error(finalError)
		toast.error(decodeURIComponent(finalError.replace(/\+/g, " ")));

		const cleanParams = new URLSearchParams(searchParams.toString());
		["error", "message", "error_description", "error_code"].forEach(p => cleanParams.delete(p));

		const queryString = cleanParams.toString();
		const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

		window.history.replaceState(null, "", newUrl);
		router.refresh();

	}, [searchParams, router, pathname]);
}
