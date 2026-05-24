"use client"

import { useErrorToast } from "@/hooks/use-error"
import { Suspense } from "react"

/**
 * Internal listener component that executes the custom error toast hook.
 * It is isolated to prevent the entire provider or layout from re-rendering
 * when URL search parameters change.
 * * @private
 * @returns {null} Renders no visual DOM elements.
 */
function ErrorToastListener(): null {
    useErrorToast()
    return null 
}

/**
 * Global Error Toast Provider component.
 * Wraps the URL listener inside a React `<Suspense>` boundary. This is critical in Next.js 
 * App Router to isolate client-side dynamic hooks (`useSearchParams`) and prevent them 
 * from de-optimizing server-side static page generation (SSR/SSG).
 * * @component
 * @example
 * return (
 * <ErrorToastProvider />
 * )
 */
export function ErrorToastProvider(): React.JSX.Element {
    return (
        <Suspense fallback={null}>
            <ErrorToastListener />
        </Suspense>
    )
}
