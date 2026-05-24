"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/data-table"
import { getColumns } from "./columns"
import { getUsersAction, UserData } from "./actions"
import { useUser } from "@/hooks/use-user"
import { InviteUserDialog } from "./_components/invite-user-dialog"
import { DeleteUserDialog } from "./_components/delete-user-dialog"

export default function UsersPage() {
    const { user: currentUser, profile: currentProfile } = useUser()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)

    const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const isAdmin = currentProfile?.role === "admin"

    const fetchUsers = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true)
        try {
            const response = await getUsersAction()
            if (response.success) {
                setUsers(response.data)
            } else {
                toast.error(response.error || "Failed to load users")
            }
        } catch (error) {
            console.error(error)
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleDeleteClick = (user: UserData) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const columns = getColumns(handleDeleteClick, currentUser?.id, isAdmin)

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <main className="flex flex-col flex-1 w-full p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Registered Users</h1>
                    <p className="text-muted-foreground">
                        Manage registered users and their permissions.
                    </p>
                </div>

                {isAdmin && (
                    <InviteUserDialog onSuccess={() => fetchUsers(true)} />
                )}
            </div>

            <DataTable columns={columns} data={users} />

            <DeleteUserDialog
                user={userToDelete}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={() => fetchUsers(true)}
            />
        </main>
    )
}
