"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import JSZip from "jszip"

/**
 * Represents a file or folder record stored in the database.
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
 * Custom hook for managing file and folder operations within a Supabase-backed storage system.
 * Handles fetching, uploading, creating folders, soft-deletion (trash), and ZIP downloads.
 * 
 * @returns An object containing the current file state and operations to manipulate them.
 */
export function useFiles() {
    const [files, setFiles] = useState<FileRecord[]>([])
    const [trashFiles, setTrashFiles] = useState<FileRecord[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    /**
     * Fetches active (not deleted) files and folders for a specific parent directory.
     * Results are ordered by type (folders first) and then by creation date (newest first).
     * 
     * @param parentId - The ID of the parent folder to fetch items from. If null, fetches root items.
     * @returns A promise that resolves when the fetch operation completes.
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

            const { data, error } = await query
                .order("is_folder", { ascending: false })
                .order("created_at", { ascending: false })

            if (error) throw error
            setFiles(data || [])
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch files")
        } finally {
            setLoading(false)
        }
    }, [supabase])

    /**
     * Fetches all items currently in the trash.
     * Filters the results to only show top-level trashed items to avoid redundant display of nested items.
     * 
     * @returns A promise that resolves when the trash fetch operation completes.
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

            const allTrash = data || []
            const trashIds = new Set(allTrash.map(f => f.id))
            const topLevelTrash = allTrash.filter(f => !f.parent_id || !trashIds.has(f.parent_id))

            setTrashFiles(topLevelTrash)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch trash")
        } finally {
            setLoading(false)
        }
    }, [supabase])

    /**
     * Creates a new logical folder in the database.
     * 
     * @param name - The name of the new folder.
     * @param parentId - The ID of the parent folder. Defaults to null for root.
     * @param silent - If true, prevents toast notifications from appearing.
     * @returns A promise resolving to the created FileRecord, or null if creation failed.
     */
    const createFolder = async (name: string, parentId: string | null = null, silent = false) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            if (!silent) toast.error("You must be logged in to create folders")
            return null
        }

        try {
            let checkQuery = supabase
                .from("files")
                .select("*")
                .eq("user_id", user.id)
                .eq("name", name)
                .eq("is_folder", true)
                .is("deleted_at", null)

            if (parentId) {
                checkQuery = checkQuery.eq("parent_id", parentId)
            } else {
                checkQuery = checkQuery.is("parent_id", null)
            }

            const { data: existingFolder, error: checkError } = await checkQuery.maybeSingle()

            if (checkError) throw checkError
            if (existingFolder) {
                if (!silent) {
                    toast.info(`Merged into existing folder "${name}"`)
                    fetchFiles(parentId)
                }
                return existingFolder as FileRecord
            }

            const folderPath = `${user.id}/folders/${Date.now()}-${name}`
            const { data, error } = await supabase.from("files").insert({
                name,
                size: 0,
                type: "folder",
                storage_path: folderPath,
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
            if (!silent) toast.error(error instanceof Error ? error.message : "Failed to handle folder")
            if (silent) throw error
            return null
        }
    }

    /**
     * Uploads a file to Supabase Storage and creates a corresponding database record.
     * 
     * @param file - The browser File object to upload.
     * @param parentId - The ID of the destination folder. Defaults to null for root.
     * @param silent - If true, prevents toast notifications from appearing.
     * @returns A promise that resolves when the upload and DB insertion are complete.
     */
    const uploadFile = async (file: File, parentId: string | null = null, silent = false) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            const msg = "You must be logged in to upload files"
            if (!silent) toast.error(msg)
            throw new Error(msg)
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
            if (!silent) toast.error(error instanceof Error ? error.message : "Failed to upload file")
            if (silent) throw error
        }
    }

    /**
     * Performs a soft-delete by moving the item to the trash.
     * For physical files, it also moves the file within the storage bucket to a 'trash/' prefix.
     * 
     * @param file - The FileRecord to move to trash.
     * @returns A promise that resolves when the move operation is complete.
     */
    /**
     * Performs a soft-delete by moving the item to the trash.
     * If a folder with the same name already exists in the trash, it renames it using a suffix like (1), (2), etc.
     * For physical files, it also moves the file within the storage bucket to a 'trash/' prefix.
     * * @param file - The FileRecord to move to trash.
     * @returns A promise that resolves when the move operation is complete.
     */
    const moveToTrash = async (file: FileRecord) => {
        try {
            const now = new Date().toISOString()
            let finalName = file.name

            if (file.is_folder) {
                const { data: trashedFolders, error: searchError } = await supabase
                    .from("files")
                    .select("name")
                    .eq("user_id", file.user_id)
                    .eq("is_folder", true)
                    .not("deleted_at", "is", null)
                    .like("name", `${file.name}%`)

                if (searchError) throw searchError

                if (trashedFolders && trashedFolders.length > 0) {
                    const existingNames = trashedFolders.map(f => f.name)
                    if (existingNames.includes(file.name)) {
                        let counter = 1
                        while (existingNames.includes(`${file.name} (${counter})`)) {
                            counter++
                        }
                        finalName = `${file.name} (${counter})`
                    }
                }
            }

            if (!file.is_folder && file.storage_path) {
                const newPath = file.storage_path.replace(`${file.user_id}/`, `${file.user_id}/trash/`)
                await supabase.storage.from("files").move(file.storage_path, newPath)

                await supabase.from("files")
                    .update({ storage_path: newPath, deleted_at: now })
                    .eq("id", file.id)
            } else {
                await supabase.from("files")
                    .update({
                        name: finalName,
                        deleted_at: now
                    })
                    .eq("id", file.id)
            }

            const successMessage = finalName !== file.name
                ? `Moved to trash as "${finalName}"`
                : `${file.name} moved to trash`

            toast.success(successMessage)
            fetchFiles(file.parent_id)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to move to trash")
        }
    }

    /**
     * Restores a soft-deleted item from the trash back to its original location.
     * Reverts the storage bucket path for physical files.
     * 
     * @param file - The FileRecord to restore.
     * @returns A promise that resolves when the restoration is complete.
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
            toast.error(error instanceof Error ? error.message : "Failed to restore file")
        }
    }

    /**
     * Permanently deletes a file or folder.
     * Recursively identifies all child files in a folder and removes them from physical storage
     * before deleting the database record (which triggers a CASCADE delete for children in DB).
     * 
     * @param file - The FileRecord to permanently delete.
     * @returns A promise that resolves when the physical and logical deletion is complete.
     */
    const deletePermanently = async (file: FileRecord) => {
        setLoading(true)
        try {
            const { data: allUserFiles, error: fetchError } = await supabase
                .from("files")
                .select("id, storage_path, parent_id, is_folder")
                .eq("user_id", file.user_id)

            if (fetchError) throw fetchError
            const filesList = allUserFiles || []

            const pathsToDelete: string[] = []

            const findPhysicalPaths = (currentId: string) => {
                const children = filesList.filter(f => f.parent_id === currentId)
                for (const child of children) {
                    if (child.is_folder) {
                        findPhysicalPaths(child.id)
                    } else if (child.storage_path) {
                        pathsToDelete.push(child.storage_path)
                    }
                }
            }

            if (file.is_folder) {
                findPhysicalPaths(file.id)
            } else if (file.storage_path) {
                pathsToDelete.push(file.storage_path)
            }

            if (pathsToDelete.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from("files")
                    .remove(pathsToDelete)

                if (storageError) throw storageError
            }

            const { error: dbError } = await supabase
                .from("files")
                .delete()
                .eq("id", file.id)

            if (dbError) throw dbError

            toast.success(`${file.name} deleted permanently`)
            fetchTrashFiles()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete permanently")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Downloads a file or a folder.
     * If a folder is selected, it recursively bundles all nested files and subfolders into a ZIP file.
     * 
     * @param file - The FileRecord to download.
     * @returns A promise that resolves when the download process (and potential ZIP generation) finishes.
     */
    const downloadFile = async (file: FileRecord) => {
        setLoading(true)
        try {
            if (file.is_folder) {
                const zip = new JSZip()

                const { data: allFiles, error: fetchError } = await supabase
                    .from("files")
                    .select("*")
                    .eq("user_id", file.user_id)
                    .is("deleted_at", null)

                if (fetchError) throw fetchError
                const filesList = allFiles || []

                const compileZip = async (currentFolderId: string, currentZipFolder: JSZip) => {
                    const items = filesList.filter(item => item.parent_id === currentFolderId)

                    for (const item of items) {
                        if (item.is_folder) {
                            const nextZipFolder = currentZipFolder.folder(item.name)
                            if (nextZipFolder) {
                                await compileZip(item.id, nextZipFolder)
                            }
                        } else if (item.storage_path) {
                            const { data, error } = await supabase.storage.from("files").download(item.storage_path)
                            if (error) console.error(`Error downloading ${item.name}:`, error)
                            if (data) {
                                currentZipFolder.file(item.name, data)
                            }
                        }
                    }
                }

                await compileZip(file.id, zip)

                const content = await zip.generateAsync({ type: "blob" })
                triggerBinaryDownload(content, `${file.name}.zip`)
                toast.success(`Folder "${file.name}" downloaded as ZIP`)
            } else {
                if (!file.storage_path) return
                const { data, error } = await supabase.storage.from("files").download(file.storage_path)
                if (error) throw error
                if (data) {
                    triggerBinaryDownload(data, file.name)
                }
            }
        } catch (error) {
            console.error("Download failed:", error)
            toast.error("Failed to download")
        } finally {
            setLoading(false)
        }
    }

    /**
     * Internal helper to trigger a browser download of a binary blob.
     * 
     * @param blob - The binary data to download.
     * @param filename - The name to save the file as.
     */
    const triggerBinaryDownload = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    return {
        /** List of active files in the current view */
        files,
        /** List of top-level items in the trash */
        trashFiles,
        /** Loading state for file operations */
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
