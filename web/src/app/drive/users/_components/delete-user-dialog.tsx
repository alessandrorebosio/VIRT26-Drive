"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/dialog/confirm-dialog"
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
                toast.success("Account eliminato con successo")
                onSuccess?.()
                onOpenChange(false)
            } else {
                toast.error(result.error || "Errore durante l'eliminazione")
            }
        } catch (error) {
            console.error(error)
            toast.error("Errore di rete")
        } finally {
            setLoading(false)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Are you absolutely sure?"
            description={
                <>
                    This action cannot be undone. This will permanently delete the account of{" "}
                    <strong>{user?.username}</strong> ({user?.email}) and remove their data from our servers.
                </>
            }
            confirmText="Delete Account"
            destructive
            loading={loading}
            onConfirm={handleConfirm}
        />
    )
}
