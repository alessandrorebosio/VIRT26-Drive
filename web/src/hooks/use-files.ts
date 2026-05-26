"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import JSZip from "jszip"

/**
 * Represents a file record stored in the database.
 */
export type FileRecord = {
    id: string
    name: string
    size: number
    type: string
    storage_path: string
    user_id: string
    created_at: string
    deleted_at: string | null
    is_folder: boolean
    parent_id: string | null
}

/**
 * A custom React hook for managing file operations with Supabase Storage and Database.
 * Provides state and methods to upload, download, list, soft-delete (move to trash),
 * restore, and permanently delete files and folders.
 * @returns An object containing file states, loading indicators, and file management functions.
 */
export function useFiles() {
    const [files, setFiles] = useState<FileRecord[]>([])
    const [trashFiles, setTrashFiles] = useState<FileRecord[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    /**
     * Fetches all active (non-deleted) files belonging to the current user context
     * within a specific folder. Updates the `files` state.
     * @async
     * @param {string | null} parentId - The ID of the folder to fetch contents from.
     * @returns {Promise<void>}
     */
    const fetchFiles = useCallback(async (parentId: string | null = null) => {
        setLoading(true)
        try {
            let query = supabase
                .from("files")
                .select("*")
                .is("deleted_at", null)

            if (parentId) {
                query = query.eq("parent_id", parentId)
            } else {
                query = query.is("parent_id", null)
            }

            const { data, error } = await query.order("is_folder", { ascending: false }).order("created_at", { ascending: false })

            if (error) throw error
            setFiles(data || [])
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch files"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    /**
     * Fetches top-level soft-deleted items to show only the main deleted folders/files in Trash.
     * @async
     * @returns {Promise<void>}
     */
    const fetchTrashFiles = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("files")
                .select("*")
                .not("deleted_at", "is", null)
                .order("deleted_at", { ascending: false })

            if (error) throw error
            
            // Show only items whose parent is not also in the trash list
            const allTrash = data || []
            const trashIds = new Set(allTrash.map(f => f.id))
            const topLevelTrash = allTrash.filter(f => !f.parent_id || !trashIds.has(f.parent_id))
            
            setTrashFiles(topLevelTrash)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch trash"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    /**
     * Creates a new folder in the database.
     * @async
     * @param {string} name - The name of the folder.
     * @param {string | null} parentId - The parent folder ID.
     * @param {boolean} silent - Whether to suppress toast notifications.
     * @returns {Promise<FileRecord | null>}
     */
    const createFolder = async (name: string, parentId: string | null = null, silent = false) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            if (!silent) toast.error("You must be logged in to create folders")
            return null
        }

        try {
            const { data, error } = await supabase.from("files").insert({
                name,
                size: 0,
                type: "folder",
                storage_path: "", 
                user_id: user.id,
                is_folder: true,
                parent_id: parentId
            }).select().single()

            if (error) throw error

            if (!silent) {
                toast.success(`Folder "${name}" created`)
                fetchFiles(parentId)
            }
            return data as FileRecord
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create folder"
            if (!silent) toast.error(message)
            if (silent) throw error
            return null
        }
    }

    /**
     * Uploads a file to Supabase storage and creates a corresponding database record.
     * @async
     * @param {File} file - The native DOM File object to be uploaded.
     * @param {string | null} parentId - The parent folder ID.
     * @param {boolean} silent - Whether to suppress toast notifications.
     * @returns {Promise<void>}
     */
    const uploadFile = async (file: File, parentId: string | null = null, silent = false) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            const msg = "You must be logged in to upload files"
            if (!silent) toast.error(msg)
            if (silent) throw new Error(msg)
            return
        }

        const fileName = `${Date.now()}-${file.name}`
        const storagePath = `${user.id}/${fileName}`

        try {
            const { error: uploadError } = await supabase.storage
                .from("files")
                .upload(storagePath, file)

            if (uploadError) throw uploadError

            const { error: dbError } = await supabase.from("files").insert({
                name: file.name,
                size: file.size,
                type: file.type,
                storage_path: storagePath,
                user_id: user.id,
                is_folder: false,
                parent_id: parentId
            })

            if (dbError) {
                await supabase.storage.from("files").remove([storagePath])
                throw dbError
            }

            if (!silent) {
                toast.success(`${file.name} uploaded successfully`)
                fetchFiles(parentId)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload file"
            if (!silent) toast.error(message)
            if (silent) throw error
        }
    }

    /**
     * Soft-deletes a file or folder.
     * @async
     * @param {FileRecord} file - The record to move to trash.
     * @returns {Promise<void>}
     */
    const moveToTrash = async (file: FileRecord) => {
        try {
            const now = new Date().toISOString()
            
            if (!file.is_folder && file.storage_path) {
                const newPath = file.storage_path.replace(`${file.user_id}/`, `${file.user_id}/trash/`)
                await supabase.storage.from("files").move(file.storage_path, newPath)
                await supabase.from("files").update({ storage_path: newPath, deleted_at: now }).eq("id", file.id)
            } else {
                await supabase.from("files").update({ deleted_at: now }).eq("id", file.id)
            }

            toast.success(`${file.name} moved to trash`)
            fetchFiles(file.parent_id)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to move to trash"
            toast.error(message)
        }
    }

    /**
     * Restores a soft-deleted file or folder.
     * @async
     * @param {FileRecord} file - The record to restore from trash.
     * @returns {Promise<void>}
     */
    const restoreFromTrash = async (file: FileRecord) => {
        try {
            if (!file.is_folder && file.storage_path) {
                const newPath = file.storage_path.replace(`${file.user_id}/trash/`, `${file.user_id}/`)
                await supabase.storage.from("files").move(file.storage_path, newPath)
                await supabase.from("files").update({ storage_path: newPath, deleted_at: null }).eq("id", file.id)
            } else {
                await supabase.from("files").update({ deleted_at: null }).eq("id", file.id)
            }

            toast.success(`${file.name} restored`)
            fetchTrashFiles()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to restore file"
            toast.error(message)
        }
    }

    /**
     * Permanently deletes a file or folder.
     * @async
     * @param {FileRecord} file - The record to permanently delete.
     * @returns {Promise<void>}
     */
    const deletePermanently = async (file: FileRecord) => {
        try {
            if (file.is_folder) {
                const { error: dbError } = await supabase.from("files").delete().eq("id", file.id)
                if (dbError) throw dbError
            } else {
                await supabase.storage.from("files").remove([file.storage_path])
                await supabase.from("files").delete().eq("id", file.id)
            }
            toast.success(`${file.name} deleted permanently`)
            fetchTrashFiles()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete file"
            toast.error(message)
        }
    }

    /**
     * Downloads a file or a folder (as ZIP).
     * @async
     * @param {FileRecord} file - The record to download.
     * @returns {Promise<void>}
     */
    const downloadFile = async (file: FileRecord) => {
        setLoading(true)
        try {
            if (file.is_folder) {
                const zip = new JSZip()
                
                const addFolderToZip = async (folder: FileRecord, currentZip: JSZip) => {
                    const { data: contents } = await supabase
                        .from("files")
                        .select("*")
                        .eq("parent_id", folder.id)
                        .is("deleted_at", null)
                    
                    if (contents) {
                        for (const item of contents) {
                            if (item.is_folder) {
                                const subZip = currentZip.folder(item.name)
                                if (subZip) await addFolderToZip(item, subZip)
                            } else {
                                const { data } = await supabase.storage.from("files").download(item.storage_path)
                                if (data) currentZip.file(item.name, data)
                            }
                        }
                    }
                }

                await addFolderToZip(file, zip)
                const content = await zip.generateAsync({ type: "blob" })
                const url = window.URL.createObjectURL(content)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${file.name}.zip`)
                document.body.appendChild(link)
                link.click()
                link.parentNode?.removeChild(link)
                window.URL.revokeObjectURL(url)
                toast.success(`Folder "${file.name}" downloaded as ZIP`)
            } else {
                const { data } = await supabase.storage.from("files").download(file.storage_path)
                if (data) {
                    const url = window.URL.createObjectURL(data)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', file.name)
                    document.body.appendChild(link)
                    link.click()
                    link.parentNode?.removeChild(link)
                    window.URL.revokeObjectURL(url)
                }
            }
        } catch (error) {
            toast.error("Failed to download")
        } finally {
            setLoading(false)
        }
    }

    return {
        files,
        trashFiles,
        loading,
        fetchFiles,
        fetchTrashFiles,
        createFolder,
        uploadFile,
        moveToTrash,
        restoreFromTrash,
        deletePermanently,
        downloadFile
    }
}
