"use client"

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/input/password-input";
import { Button } from "@/components/ui/button";
import { createAdminAccount } from "./actions";

export default function SetupPage() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    
    const router = useRouter()

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createAdminAccount({ username, email, password });
        setLoading(false)

        if (result.error) {
            return toast.error(result.error)
        }
        toast.success("Administrator account created successfully!");
        router.push("/auth/sign-in")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Initial Setup</CardTitle>
                <CardDescription>
                    Create the main administrator account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSetup}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="text-sm font-medium leading-none">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Admin"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">
                                Password
                            </label>
                            <PasswordInput
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
                            {loading ? "Setting up..." : "Complete Setup"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
