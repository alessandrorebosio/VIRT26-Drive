"use client"

import { useEffect } from "react"
import { useFiles } from "@/hooks/use-files"
import { DataTable } from "@/components/data-table"
import { getColumns } from "./columns"

export default function TrashPage() {
    const { trashFiles, fetchTrashFiles, restoreFromTrash, deletePermanently } = useFiles()

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchTrashFiles()
        })
    }, [fetchTrashFiles])

    const columns = getColumns(restoreFromTrash, deletePermanently)

    return (
        <main className="flex flex-col flex-1 w-full p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Trash
                </h1>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <DataTable columns={columns} data={trashFiles} />
            </div>
        </main>
    )
}
