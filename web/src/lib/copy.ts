import { toast } from "sonner"

/**
 * Copies a string to the clipboard and shows a success toast notification.
 * 
 * @param {string} text - The text to be copied to the clipboard.
 * @param {string} [successMessage="Copied to clipboard!"] - The message to display in the toast notification upon success.
 * @returns {Promise<void>} A promise that resolves when the text has been copied.
 */
export const copyToClipboard = async (text: string, successMessage: string = "Copied to clipboard!"): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text)
        toast.success(successMessage)
    } catch (error) {
        console.error("Failed to copy text: ", error)
        toast.error("Failed to copy to clipboard")
    }
}
