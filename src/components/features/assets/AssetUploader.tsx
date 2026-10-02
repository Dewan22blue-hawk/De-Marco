/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useCallback, useRef } from "react"
import { ImagePlus, Loader2, CheckCircle2, X, UploadCloud, AlertCircle, RefreshCw, FileIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { saveAssetMetadata } from "@/app/dashboard/assets/actions"
import { useRouter } from "next/navigation"
import { CustomSelect } from "@/components/ui/custom-select"

interface UploadFile {
  id: string
  file: File
  status: "queued" | "uploading" | "done" | "error"
  error?: string
  previewUrl?: string
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export function AssetUploader({ categories = [] }: { categories?: Array<{id: string, name: string, slug: string}> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploading = files.some(f => f.status === "uploading")
  const hasFiles = files.length > 0

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = (file: File) => {
    if (file.size > MAX_SIZE) return "File exceeds 50MB limit"
    // Relaxed type checking to allow most files, but we can enforce ALLOWED_TYPES if needed.
    // We will allow all for now but show error if backend rejects.
    return null
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const toAdd = Array.from(newFiles).map(file => {
      const error = validateFile(file)
      return {
        id: crypto.randomUUID(),
        file,
        status: error ? "error" : "queued",
        error,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      } as UploadFile
    })
    setFiles(prev => [...prev, ...toAdd])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFile = async (upload: UploadFile) => {
    setFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: "uploading", error: undefined } : f))

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const fileExt = upload.file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('assets')
        .upload(fileName, upload.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError
      
      let width, height
      if (upload.file.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(upload.file)
        width = dimensions.width
        height = dimensions.height
      }

      let assetType: 'image' | 'document' | 'font' | 'video' | 'audio' | 'archive' | 'other' = 'other'
      if (upload.file.type.startsWith('image/')) assetType = 'image'
      else if (upload.file.type.startsWith('video/')) assetType = 'video'
      else if (upload.file.type.startsWith('audio/')) assetType = 'audio'
      else if (upload.file.type.includes('pdf') || upload.file.type.includes('document')) assetType = 'document'
      else if (upload.file.type.includes('zip') || upload.file.type.includes('tar') || upload.file.type.includes('archive')) assetType = 'archive'

      await saveAssetMetadata({
        name: upload.file.name,
        mime_type: upload.file.type || 'application/octet-stream',
        file_size: upload.file.size,
        storage_bucket: 'assets',
        storage_path: storageData.path,
        asset_type: assetType,
        category_id: selectedCategory || undefined,
        width,
        height
      })

      setFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: "done" } : f))
    } catch (err) {
      console.error(err)
      const errorObj = err as Error
      setFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: "error", error: errorObj.message || 'Upload failed' } : f))
    }
  }

  const startUpload = async () => {
    const queuedFiles = files.filter(f => f.status === "queued" || f.status === "error")
    for (const file of queuedFiles) {
      await uploadFile(file)
    }
    router.refresh()
  }

  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => resolve({ width: 0, height: 0 })
      img.src = URL.createObjectURL(file)
    })
  }

  const closeDialog = () => {
    if (isUploading) return
    setIsOpen(false)
    if (files.some(f => f.status === "done")) {
      router.refresh()
    }
    setFiles([])
    setSelectedCategory("")
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="clay-button-primary px-5 py-2.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
      >
        <UploadCloud size={20} />
        <span className="hidden sm:inline">Upload Assets</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDialog} />
          
          <div className="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface z-10 sticky top-0 rounded-t-3xl">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">Upload Assets</h2>
                <p className="text-sm text-on-surface-variant mt-1">Upload multiple files up to 50MB each.</p>
              </div>
              <button onClick={closeDialog} disabled={isUploading} className="p-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {!isUploading && (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-outline-variant/40 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                  } cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    multiple
                    className="hidden" 
                    onChange={handleFileInput}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <UploadCloud size={32} />
                  </div>
                  <span className="text-body-lg font-bold text-on-surface">Click to browse or drag files here</span>
                  <span className="text-sm text-outline mt-1">Supports images, videos, audio, and documents</span>
                </div>
              )}

              {hasFiles && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-on-surface">Selected Files ({files.length})</h3>
                    {!isUploading && (
                      <div className="w-48">
                        <CustomSelect
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          placeholder="No Category"
                          options={[
                            { value: "", label: "No Category" },
                            ...categories.map(c => ({ value: c.id, label: c.name }))
                          ]}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-outline shrink-0 overflow-hidden">
                          {f.previewUrl ? (
                            <img src={f.previewUrl} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            f.file.type.startsWith('image/') ? <ImagePlus size={20} /> : <FileIcon size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{f.file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-outline">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <span className="text-[10px] text-outline">•</span>
                            {f.status === "queued" && <span className="text-xs text-outline font-medium">Queued</span>}
                            {f.status === "uploading" && <span className="text-xs text-primary font-medium flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Uploading...</span>}
                            {f.status === "done" && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={10} /> Complete</span>}
                            {f.status === "error" && <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertCircle size={10} /> {f.error}</span>}
                          </div>
                        </div>
                        {!isUploading && f.status !== "done" && (
                          <button onClick={() => removeFile(f.id)} className="p-2 text-outline hover:text-red-600 rounded-lg transition-colors">
                            <X size={16} />
                          </button>
                        )}
                        {f.status === "error" && !isUploading && (
                          <button onClick={() => uploadFile(f)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Retry">
                            <RefreshCw size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest rounded-b-3xl flex justify-end gap-3">
              <button 
                onClick={closeDialog}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                {files.some(f => f.status === "done") ? "Done" : "Cancel"}
              </button>
              {hasFiles && files.some(f => f.status === "queued" || f.status === "error") && (
                <button 
                  onClick={startUpload}
                  disabled={isUploading}
                  className="clay-button-primary px-6 py-2.5 rounded-xl text-white font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading && <Loader2 size={16} className="animate-spin" />}
                  {isUploading ? "Uploading..." : "Start Upload"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}