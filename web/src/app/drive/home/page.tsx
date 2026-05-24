"use client"

import { useEffect, useState, useCallback } from "react"
import { useFiles, FileRecord } from "@/hooks/use-files"
import { DataTable } from "@/components/data-table"
import { getColumns } from "./columns"
import { cn } from "@/lib/utils"
import { Upload, ChevronRight, Home } from "lucide-react"
import { CreateFolderDialog } from "./_components/create-folder-dialog"
import { toast } from "sonner"

export default function HomePage() {
    const { files, fetchFiles, uploadFile, moveToTrash, downloadFile, createFolder } = useFiles()
    const [isDragging, setIsDragging] = useState(false)
    const [currentPath, setCurrentPath] = useState<{ id: string, name: string }[]>([])

    const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null

    useEffect(() => {
        fetchFiles(currentFolderId)
    }, [fetchFiles, currentFolderId])

    const handleNavigate = (folder: FileRecord) => {
        setCurrentPath([...currentPath, { id: folder.id, name: folder.name }])
    }

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setCurrentPath([])
        } else {
            setCurrentPath(currentPath.slice(0, index + 1))
        }
    }

    const uploadEntry = useCallback(async (entry: any, parentId: string | null) => {
        if (entry.isFile) {
            return new Promise<void>((resolve) => {
                entry.file(async (file: File) => {
                    await uploadFile(file, parentId, true)
                    resolve()
                })
            })
        } else if (entry.isDirectory) {
            const folder = await createFolder(entry.name, parentId, true)
            if (folder) {
                const dirReader = entry.createReader()
                const entries = await new Promise<any[]>((resolve) => {
                    dirReader.readEntries((entries: any[]) => resolve(entries))
                })
                for (const childEntry of entries) {
                    await uploadEntry(childEntry, folder.id)
                }
            }
        }
    }, [uploadFile, createFolder])

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

        const items = e.dataTransfer.items
        if (items) {
            const uploadPromises = []
            for (let i = 0; i < items.length; i++) {
                const item = items[i].webkitGetAsEntry()
                if (item) {
                    uploadPromises.push(uploadEntry(item, currentFolderId))
                }
            }
            
            if (uploadPromises.length > 0) {
                toast.promise(Promise.all(uploadPromises), {
                    loading: 'Uploading items...',
                    success: () => {
                        fetchFiles(currentFolderId)
                        return 'All items uploaded successfully'
                    },
                    error: 'Failed to upload some items',
                })
            }
        }
    }

    const columns = getColumns(moveToTrash, downloadFile, handleNavigate)

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
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Home
                    </h1>
                    <nav className="flex items-center text-sm text-muted-foreground">
                        <button 
                            onClick={() => handleBreadcrumbClick(-1)}
                            className="flex items-center hover:text-primary transition-colors cursor-pointer"
                        >
                            <Home className="h-4 w-4" />
                        </button>
                        {currentPath.map((folder, index) => (
                            <div key={folder.id} className="flex items-center">
                                <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
                                <button
                                    onClick={() => handleBreadcrumbClick(index)}
                                    className={cn(
                                        "hover:text-primary transition-colors cursor-pointer truncate max-w-37.5",
                                        index === currentPath.length - 1 && "text-foreground font-medium pointer-events-none"
                                    )}
                                >
                                    {folder.name}
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>
                <CreateFolderDialog onCreate={(name) => createFolder(name, currentFolderId).then(() => {})} />
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
