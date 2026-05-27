"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserData } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Copy } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyToClipboard } from "@/lib/copy"

export const getColumns = (
    onDelete: (user: UserData) => void,
    currentUserId: string | undefined,
    isAdmin: boolean
): ColumnDef<UserData>[] => {
    const cols: ColumnDef<UserData>[] = [
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }) => {
                return <div className="font-medium">{row.getValue("username")}</div>
            },
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                return (
                    <Badge variant={role === "admin" ? "default" : "secondary"}>
                        {role}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
            },
        },
    ]

    if (isAdmin) {
        cols.push({
            id: "actions",
            cell: ({ row }) => {
                const user = row.original
                const isSelf = currentUserId === user.id

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => copyToClipboard(user.id, "User ID copied to clipboard!")}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy ID
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                disabled={isSelf}
                                onClick={() => onDelete(user)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        })
    }

    return cols
}
