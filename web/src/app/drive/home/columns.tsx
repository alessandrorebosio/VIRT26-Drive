"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FileRecord } from "@/hooks/use-files"
import { Button } from "@/components/ui/button"
import { Trash2, FileText, Download } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const getColumns = (
    onMoveToTrash: (file: FileRecord) => void,
    onDownload: (file: FileRecord) => void,
): ColumnDef<FileRecord>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate max-w-50" title={row.getValue("name")}>
                        {row.getValue("name")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => {
            return <div className="text-muted-foreground">{formatBytes(row.getValue("size"))}</div>
        },
    },
    {
        accessorKey: "created_at",
        header: "Uploaded At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"))
            return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const file = row.original

            return (
                <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:cursor-pointer"
                                    onClick={() => onDownload(file)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer"
                                    onClick={() => onMoveToTrash(file)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move to Trash</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
        },
    },
]
