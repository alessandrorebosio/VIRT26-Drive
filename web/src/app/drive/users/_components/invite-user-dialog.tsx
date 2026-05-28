"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviteUserAction } from "../actions"

interface InviteUserDialogProps {
    onSuccess?: () => void
}

export function InviteUserDialog({ onSuccess }: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [inviting, setInviting] = useState(false)
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("user")

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviting(true)
        try {
            const result = await inviteUserAction(email, role, window.location.origin)
            if (result.success) {
                toast.success("Invitation sent successfully!")
                setOpen(false)
                setEmail("")
                setRole("user")
                onSuccess?.()
            } else {
                toast.error(result.error || "Error sending invitation")
            }
        } catch (error) {
            console.error(error)
            toast.error("Errore di rete")
        } finally {
            setInviting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="hover:cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleInvite}>
                    <DialogHeader>
                        <DialogTitle>Invite a new user</DialogTitle>
                        <DialogDescription>
                            Enter the email address and assign a role. An invitation link will be sent.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            We will send an official invitation link to this email.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={inviting} className="w-full hover:cursor-pointer">
                            {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
