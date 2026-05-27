"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/hooks/use-user"

export default function DrivePage() {
    const { loading, displayName } = useUser()

    if (loading) {
        return (
            <main className="flex flex-1 w-full items-center justify-center">
                <Skeleton className="h-9 w-64" />
            </main>
        )
    }

    return (
        <main className="flex flex-1 w-full items-center justify-center">
            <h1 className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 flex gap-2">
                <span>Welcome back,</span>
                <span className="text-primary">
                    {displayName}
                </span>
            </h1>
        </main>
    )
}
