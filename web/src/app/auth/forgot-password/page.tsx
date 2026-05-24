"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        setLoading(false)
        if (error) {
            return toast.error(error.message)
        }
        toast.success("Password reset email sent")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleResetPassword}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                        <Link
                            href="/auth/sign-in"
                            className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
