"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/input/password-input"
import { useAccount } from "@/hooks/use-account"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, User as UserIcon, Shield, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function AccountPage() {
    const { user, profile, loading, isUpdatingProfile, isUpdatingPassword, updateProfile, updatePassword, pendingEmail } = useAccount()
    const [username, setUsername] = useState<string | undefined>(undefined)
    const [newEmail, setNewEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const currentUsername = username ?? profile?.username ?? ""

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const targetEmail = newEmail || user?.email || ""
        await updateProfile(currentUsername, targetEmail)
        window.location.reload()
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match")
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters")
        }
        await updatePassword(password)
        window.location.reload()
    }

    if (loading) {
        return (
            <main className="flex flex-1 w-full items-center justify-center p-6">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex flex-1 w-full items-center justify-center p-6 bg-background/50">
            <Card className="w-full max-w-lg shadow-sm border-sidebar-border">
                <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <UserIcon className="size-6 text-primary" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>
                        Update your personal information and account security.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            <Mail className="size-4" />
                            General Information
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            {pendingEmail && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="font-semibold underline">Confirmation required</p>
                                        <p className="opacity-90 mt-0.5">Please check <strong>{pendingEmail}</strong> to verify your new email address.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Username
                                    </label>
                                    <Input
                                        id="username"
                                        placeholder="Your username"
                                        value={currentUsername}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none opacity-70">
                                        Account Role
                                    </label>
                                    <Input
                                        value={profile?.role || "user"}
                                        disabled
                                        className="bg-muted h-10 font-mono text-xs uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none opacity-70">
                                    Current Email
                                </label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted h-10 cursor-default"
                                />
                                <p className="text-[10px] text-muted-foreground italic pl-1">
                                    This is your verified primary email address.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="new-email" className="text-sm font-medium leading-none">
                                    Change Email
                                </label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    placeholder="new-address@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    disabled={!!pendingEmail}
                                    className={pendingEmail ? "bg-muted cursor-not-allowed h-10" : "h-10"}
                                />
                                {!pendingEmail && (
                                    <p className="text-[10px] text-muted-foreground italic pl-1">
                                        Leave empty if you only want to change your username.
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full h-10 font-semibold hover:cursor-pointer" disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? "Processing..." : "Save Changes"}
                            </Button>
                        </form>
                    </section>

                    <Separator className="bg-sidebar-border/50" />

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            <Shield className="size-4" />
                            Security & Password
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="new-password" className="text-sm font-medium leading-none">New Password</label>
                                    <PasswordInput
                                        id="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="confirm-password" className="text-sm font-medium leading-none">Confirm</label>
                                    <PasswordInput
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                        className="h-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="secondary" className="w-full h-10 font-semibold border hover:cursor-pointer" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? "Updating..." : "Update Security"}
                            </Button>
                        </form>
                    </section>
                </CardContent>
            </Card>
        </main>
    )
}
