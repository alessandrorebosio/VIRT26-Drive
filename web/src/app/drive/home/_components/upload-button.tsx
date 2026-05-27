"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

interface UploadButtonProps {
    onUpload: (files: FileList) => Promise<void>
}

export function UploadButton({ onUpload }: UploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            await onUpload(files)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
            />
            <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="gap-2 hover:cursor-pointer"
            >
                {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
            </Button>
        </div>
    )
}
