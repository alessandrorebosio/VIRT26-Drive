"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordInput } from "@/components/input/password-input"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match")
        }
        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({
            password: password,
        })
        setLoading(false)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Password updated successfully")
            router.push("/auth/sign-in")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Set Password</CardTitle>
                <CardDescription>
                    Please enter your new password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdatePassword}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">
                                New Password
                            </label>
                            <PasswordInput
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                                Confirm Password
                            </label>
                            <PasswordInput
                                id="confirmPassword"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
