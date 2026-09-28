"use client"

import { useState, useCallback } from "react"
import { ImagePlus, Loader2, CheckCircle2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { saveAssetMetadata } from "@/app/(main)/assets/actions"
import { useRouter } from "next/navigation"

export function AssetUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(10)

    try {
      const supabase = createClient()
      
      // 1. Get current user session for organization mapping
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}` // We can prefix with org_id later if needed
      
      setUploadProgress(40)

      // 2. Upload to Supabase Storage 'assets' bucket
      // Note: You must ensure 'assets' bucket is created in Supabase Dashboard
      const { data: storageData, error: storageError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError
      
      setUploadProgress(80)

      // 3. Save metadata to DB
      await saveAssetMetadata({
        name: file.name,
        mime_type: file.type,
        file_size: file.size,
        storage_bucket: 'assets',
        storage_path: storageData.path,
        asset_type: file.type.startsWith('image/') ? 'image' : 'document'
      })

      setUploadProgress(100)
      setSuccess(true)
      
      // Refresh page to show new asset
      setTimeout(() => {
        setSuccess(false)
        setUploadProgress(0)
        router.refresh()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to upload asset')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      uploadFile(file)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      uploadFile(file)
    }
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
        isDragging 
          ? 'border-blue-500 bg-blue-50/50' 
          : 'border-neutral-300 bg-neutral-100 hover:bg-neutral-200/50'
      } ${
        isUploading ? 'pointer-events-none opacity-80' : 'cursor-pointer'
      }`}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
        onChange={handleFileInput}
        disabled={isUploading}
        accept="image/*,.pdf,.doc,.docx"
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center text-blue-600">
          <Loader2 size={32} className="animate-spin mb-2" />
          <span className="text-sm font-medium">Uploading... {uploadProgress}%</span>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center text-green-600">
          <CheckCircle2 size={32} className="mb-2" />
          <span className="text-sm font-medium">Upload Complete!</span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-neutral-500 group-hover:text-neutral-700 pointer-events-none">
          <ImagePlus size={32} className="mb-2 transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium">Drag & Drop file</span>
          <span className="text-xs text-neutral-400 mt-1">or click to browse</span>
        </div>
      )}

      {error && (
        <div className="absolute -bottom-10 left-0 right-0 flex items-center p-2 bg-red-100 text-red-700 rounded-lg text-xs z-10 shadow-sm border border-red-200">
          <X size={14} className="mr-1 flex-shrink-0" />
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto underline font-bold px-1">Clear</button>
        </div>
      )}
    </div>
  )
}
