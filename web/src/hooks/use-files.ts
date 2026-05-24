"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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
}

/**
 * A custom React hook for managing file operations with Supabase Storage and Database.
 * * Provides state and methods to upload, download, list, soft-delete (move to trash),
 * restore, and permanently delete files.
 * * @returns An object containing file states, loading indicators, and file management functions.
 */
export function useFiles() {
    const [files, setFiles] = useState<FileRecord[]>([])
    const [trashFiles, setTrashFiles] = useState<FileRecord[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    /**
     * Fetches all active (non-deleted) files belonging to the current user context,
     * ordered by creation date descending. Updates the `files` state.
     * * @async
     * @returns {Promise<void>}
     */
    const fetchFiles = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("files")
                .select("*")
                .is("deleted_at", null)
                .order("created_at", { ascending: false })

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
     * Fetches all soft-deleted files (files in the trash) belonging to the current user context,
     * ordered by deletion date descending. Updates the `trashFiles` state.
     * * @async
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
            setTrashFiles(data || [])
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch trash"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    /**
     * Uploads a file to Supabase storage and creates a corresponding database record.
     * Handles cleanup by removing the uploaded storage object if the database insertion fails.
     * * @async
     * @param {File} file - The native DOM File object to be uploaded.
     * @returns {Promise<void>}
     */
    const uploadFile = async (file: File) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error("You must be logged in to upload files")
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
                user_id: user.id
            })

            if (dbError) {
                // Cleanup
                await supabase.storage.from("files").remove([storagePath])
                throw dbError
            }

            toast.success(`${file.name} uploaded successfully`)
            fetchFiles()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload file"
            toast.error(message)
        }
    }

    /**
     * Soft-deletes a file by moving its storage path to a `trash/` subdirectory
     * and setting the `deleted_at` timestamp in the database.
     * * @async
     * @param {FileRecord} file - The file record to move to trash.
     * @returns {Promise<void>}
     */
    const moveToTrash = async (file: FileRecord) => {
        const newPath = file.storage_path.replace(`${file.user_id}/`, `${file.user_id}/trash/`)
        
        try {
            const { error: moveError } = await supabase.storage
                .from("files")
                .move(file.storage_path, newPath)

            if (moveError) throw moveError

            const { error: dbError } = await supabase
                .from("files")
                .update({ 
                    storage_path: newPath,
                    deleted_at: new Date().toISOString()
                })
                .eq("id", file.id)

            if (dbError) throw dbError

            toast.success(`${file.name} moved to trash`)
            fetchFiles()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to move to trash"
            toast.error(message)
        }
    }

    /**
     * Restores a soft-deleted file by moving its storage path back to the root user directory
     * and resetting the `deleted_at` timestamp to null in the database.
     * * @async
     * @param {FileRecord} file - The file record to restore from trash.
     * @returns {Promise<void>}
     */
    const restoreFromTrash = async (file: FileRecord) => {
        const newPath = file.storage_path.replace(`${file.user_id}/trash/`, `${file.user_id}/`)
        
        try {
            const { error: moveError } = await supabase.storage
                .from("files")
                .move(file.storage_path, newPath)

            if (moveError) throw moveError

            const { error: dbError } = await supabase
                .from("files")
                .update({ 
                    storage_path: newPath,
                    deleted_at: null
                })
                .eq("id", file.id)

            if (dbError) throw dbError

            toast.success(`${file.name} restored`)
            fetchTrashFiles()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to restore file"
            toast.error(message)
        }
    }

    /**
     * Permanently deletes a file from both Supabase Storage and the database.
     * **Warning:** This action is irreversible.
     * * @async
     * @param {FileRecord} file - The file record to permanently delete.
     * @returns {Promise<void>}
     */
    const deletePermanently = async (file: FileRecord) => {
        try {
            const { error: storageError } = await supabase.storage
                .from("files")
                .remove([file.storage_path])

            if (storageError) throw storageError

            const { error: dbError } = await supabase
                .from("files")
                .delete()
                .eq("id", file.id)

            if (dbError) throw dbError

            toast.success(`${file.name} deleted permanently`)
            fetchTrashFiles()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete file"
            toast.error(message)
        }
    }

    /**
     * Downloads a file from Supabase storage using a temporary object URL created in the browser.
     * Triggers a native browser download interaction.
     * * @async
     * @param {FileRecord} file - The file record to download.
     * @returns {Promise<void>}
     */
    const downloadFile = async (file: FileRecord) => {
        try {
            const { data, error } = await supabase.storage
                .from("files")
                .download(file.storage_path)

            if (error) throw error

            const url = window.URL.createObjectURL(data)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', file.name)
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to download file"
            toast.error(message)
        }
    }

    return {
        files,
        trashFiles,
        loading,
        fetchFiles,
        fetchTrashFiles,
        uploadFile,
        moveToTrash,
        restoreFromTrash,
        deletePermanently,
        downloadFile
    }
}
