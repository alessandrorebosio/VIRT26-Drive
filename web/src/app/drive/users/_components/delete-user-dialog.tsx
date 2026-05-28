"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { deleteUserAction, UserData } from "../actions"

interface DeleteUserDialogProps {
    user: UserData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteUserDialog({ user, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        if (!user) return

        setLoading(true)
        try {
            const result = await deleteUserAction(user.id)
            if (result.success) {
                toast.success("Account deleted successfully")
                onSuccess?.()
                onOpenChange(false)
            } else {
                toast.error(result.error || "An error occurred while deleting the account")
            }
        } catch (error) {
            console.error(error)
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the account of{" "}
                        <strong>{user?.username}</strong> ({user?.email}) and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:space-x-0">
                    <AlertDialogCancel
                        disabled={loading}
                        className="w-full mt-0 hover:cursor-pointer"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleConfirm()
                        }}
                        className={cn(
                            "w-full hover:cursor-pointer",
                            "bg-destructive! text-destructive-foreground hover:bg-destructive/70!"
                        )}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Account
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
