import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Next.js Route Handler that manages the OAuth authentication callback.
 * It exchanges the temporary authorization `code` for a Supabase session
 * and handles secure redirection based on the outcome.
 *
 * @param {Request} request - The incoming HTTP request object.
 * @returns {Promise<NextResponse>} A redirect response to either the dashboard or sign-in page.
 */
export async function GET(request: Request): Promise<NextResponse> {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/drive'

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host
    const proto = request.headers.get('x-forwarded-proto') || (requestUrl.protocol === 'https:' ? 'https' : 'http')
    const origin = `${proto}://${host}`

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            const redirectUrl = new URL(`${origin}/auth/sign-in`)
            redirectUrl.searchParams.set('error_description', error.message)

            return NextResponse.redirect(redirectUrl.toString())
        }
    }

    return NextResponse.redirect(`${origin}${next}`)
}
