import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailOtpType } from '@supabase/supabase-js'

/**
 * Server-side callback handler for Supabase authentication events.
 * * This route processes two primary authentication flows:
 * 1. **OAuth2 / PKCE Flow:** Exchanges a temporary `code` for a permanent user session.
 * 2. **OTP / Magic Link Flow:** Verifies a `token_hash` and `type` to authenticate the user.
 * * On successful verification, the session tokens are automatically persisted into cookies 
 * by the Supabase client, and the user is redirected to the intended destination.
 * * **Expected URL Query Parameters:**
 * - `code` *(string, optional)*: The authorization code returned by a third-party OAuth provider.
 * - `token_hash` *(string, optional)*: The hashed token sent via email for passwordless login.
 * - `type` *(EmailOtpType, optional)*: The verification type (e.g., 'signup', 'invite', 'magiclink').
 * - `next` *(string, optional)*: The path to redirect to after successful auth. Defaults to `/`.
 *
 * @param {NextRequest} request - The incoming Next.js server request object containing the URL and search params.
 * @returns {Promise<NextResponse>} A `NextResponse.redirect` to the `next` destination on success, or to `/auth/sign-in` with an appended `error` string on failure.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    const supabase = await createClient()
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            const errorParam = encodeURIComponent(error.message)
            return NextResponse.redirect(new URL(`/auth/sign-in?error=${errorParam}`, request.url))
        }
    } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ type, token_hash })
        if (error) {
            const errorParam = encodeURIComponent(error.message)
            return NextResponse.redirect(new URL(`/auth/sign-in?error=${errorParam}`, request.url))
        }
    }

    return NextResponse.redirect(new URL(next, request.url))
}
