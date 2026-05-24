"use client"

import { useEffect, useState } from "react"
import { useFiles } from "@/hooks/use-files"
import { DataTable } from "@/components/data-table"
import { getColumns } from "./columns"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

export default function HomePage() {
    const { files, fetchFiles, uploadFile, moveToTrash, downloadFile } = useFiles()
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchFiles()
        })
    }, [fetchFiles])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files)
            for (const file of droppedFiles) {
                await uploadFile(file)
            }
        }
    }

    const columns = getColumns(moveToTrash, downloadFile)

    return (
        <main
            className={cn(
                "flex flex-col flex-1 w-full p-8 transition-colors relative",
                isDragging && "bg-accent/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Home
                </h1>
            </div>

            {isDragging && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-4 p-12 rounded-xl border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm shadow-2xl transition-transform animate-in zoom-in-95 duration-200">
                        <Upload className="h-12 w-12 text-primary animate-bounce" />
                        <p className="text-xl font-semibold">Drop files to upload</p>
                    </div>
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <DataTable columns={columns} data={files} />
            </div>
        </main>
    )
}
