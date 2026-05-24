"use client"

import { ReactNode } from "react"
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


interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string | ReactNode
    description: string | ReactNode
    cancelText?: string
    confirmText?: string
    onConfirm: () => void
    loading?: boolean
    destructive?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelText = "Cancel",
    confirmText = "Confirm",
    onConfirm,
    loading = false,
    destructive = false,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:space-x-0">
                    <AlertDialogCancel
                        disabled={loading}
                        className="w-full mt-0"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        className={cn(
                            "w-full",
                            destructive
                                ? "bg-destructive! text-destructive-foreground hover:bg-destructive/70!"
                                : ""
                        )}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
