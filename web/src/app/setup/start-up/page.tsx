"use client"

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createFilesBucket } from "./actions";

export default function StartUpPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStartUp = async () => {
        setLoading(true);
        const result = await createFilesBucket();
        setLoading(false)

        if (result.error) {
            return toast.error(result.error)
        }
        
        toast.success("System initialized successfully!");
        router.push("/auth/sign-in")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Finalize Setup</CardTitle>
                <CardDescription>
                    Initialize the storage system to start using the drive
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        This will create the necessary storage buckets for your files and folders.
                    </p>
                    <Button 
                        onClick={handleStartUp} 
                        className="w-full hover:cursor-pointer" 
                        disabled={loading}
                    >
                        {loading ? "Initializing..." : "Complete Setup"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
