"use client"

import { useState, useTransition } from "react"
import { upsertBrandKit } from "./actions"
import { TagsInput } from "@/components/ui/tags-input"
import { FontPicker } from "@/components/ui/font-picker"
import { AssetPickerModal, type Asset } from "@/components/dashboard/assets/asset-picker-modal"
import { createClient } from "@/lib/supabase/client"
import { ImagePlus, X, Copy, Check, Info } from "lucide-react"

export function BrandKitForm({ initialData, organizationId }: { initialData: Record<string, unknown>, organizationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const supabase = createClient()

  // General States
  const [name, setName] = useState(initialData?.name || "My Brand")
  const [tagline, setTagline] = useState(initialData?.tagline || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [preferredCta, setPreferredCta] = useState(initialData?.preferred_cta || "")
  
  // AI Guidelines States
  const [toneOfVoice, setToneOfVoice] = useState<string[]>(initialData?.tone_of_voice || [])
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(initialData?.forbidden_words || [])

  // Logo State
  const [logoAsset, setLogoAsset] = useState<Asset | null>(
    initialData?.logo ? {
      id: initialData.logo_asset_id,
      name: "Brand Logo",
      storage_path: initialData.logo.storage_path,
      storage_bucket: initialData.logo.storage_bucket,
    } as Asset : null
  )
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false)

  // Colors State
  const defaultColors = [
    { id: "new_1", name: "Primary", hex_code: "#4F46E5", role: "primary" },
    { id: "new_2", name: "Secondary", hex_code: "#7C3AED", role: "secondary" },
    { id: "new_3", name: "Accent", hex_code: "#06B6D4", role: "accent" }
  ]
  const [colors, setColors] = useState<Record<string, string>[]>(initialData?.brand_colors?.length > 0 ? initialData.brand_colors : defaultColors)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  // Typography State
  const [headingFont, setHeadingFont] = useState(initialData?.brand_fonts?.find((f: Record<string, string>) => f.role === 'heading')?.font_family || "Plus Jakarta Sans")
  const [bodyFont, setBodyFont] = useState(initialData?.brand_fonts?.find((f: Record<string, string>) => f.role === 'body')?.font_family || "Inter")

  const getPublicUrl = (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  const handleAddColor = () => {
    setColors([...colors, { id: `new_${Date.now()}`, name: "Custom", hex_code: "#000000", role: "custom" }])
  }

  const handleRemoveColor = (id: string) => {
    setColors(colors.filter(c => c.id !== id))
  }

  const handleColorChange = (id: string, field: string, value: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    
    const data = {
      name,
      tagline,
      description,
      preferred_cta: preferredCta,
      tone_of_voice: toneOfVoice,
      forbidden_words: forbiddenWords,
      logo_asset_id: logoAsset?.id || null,
      colors: colors.map((c, idx) => ({ ...c, sort_order: idx })),
      fonts: [
        { name: "Heading", role: "heading", font_family: headingFont },
        { name: "Body", role: "body", font_family: bodyFont },
      ]
    }

    startTransition(async () => {
      try {
        const res = await upsertBrandKit(organizationId, data)
        if (res.success) {
          setMessage({ type: "success", text: "Brand settings updated successfully." })
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update brand."
        setMessage({ type: "error", text: errorMessage })
      }
    })
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      {/* Form Area */}
      <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-body-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-error-container text-on-error-container border-error'}`}>
            {message.text}
          </div>
        )}

        <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-headline-sm font-bold text-on-surface">General Identity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-on-surface">Brand Name</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)}
                required 
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-on-surface">Logo</label>
              <div className="flex items-center gap-4">
                {logoAsset ? (
                  <div className="w-32 h-32 relative group rounded-2xl border border-outline-variant/30 bg-white overflow-hidden flex items-center justify-center p-2">
                    <img 
                      src={getPublicUrl(logoAsset.storage_bucket, logoAsset.storage_path)} 
                      alt="Brand Logo"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button type="button" onClick={() => setIsLogoModalOpen(true)} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-semibold hover:bg-neutral-200 transition-colors">
                        Change
                      </button>
                      <button type="button" onClick={() => setLogoAsset(null)} className="text-xs bg-error text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-error/90 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(true)}
                    className="w-32 h-32 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant"
                  >
                    <ImagePlus size={24} />
                    <span className="text-xs font-semibold text-center px-2">Select Logo</span>
                  </button>
                )}
                <div className="text-sm text-on-surface-variant max-w-xs">
                  Upload or select a logo from the Asset Library. PNG or SVG with transparent background is recommended.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Tagline</label>
              <input 
                value={tagline} 
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Just Do It"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Preferred Call-to-Action</label>
              <input 
                value={preferredCta} 
                onChange={e => setPreferredCta(e.target.value)}
                placeholder="e.g. Beli Sekarang, Kunjungi Kami"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-on-surface">Description / Elevator Pitch</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Gambaran umum tentang brand..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface resize-y"
              />
            </div>
          </div>
        </div>

        <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-headline-sm font-bold text-on-surface">AI Brand Guidelines</h3>
            <div className="group relative">
              <Info size={16} className="text-outline hover:text-primary cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-surface-container-highest text-on-surface text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                Aturan ini akan memandu AI saat membuat teks penawaran atau desain untuk brand Anda.
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Tone of Voice</label>
              <p className="text-xs text-on-surface-variant">Gaya komunikasi brand (misal: Profesional, Santai, Edukatif).</p>
              <TagsInput value={toneOfVoice} onChange={setToneOfVoice} placeholder="Ketik lalu Enter..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Forbidden Words</label>
              <p className="text-xs text-on-surface-variant">Kata pantangan yang tidak boleh digunakan AI (misal: Murahan, Diskon Gila).</p>
              <TagsInput value={forbiddenWords} onChange={setForbiddenWords} placeholder="Ketik lalu Enter..." />
            </div>
          </div>
        </div>

        <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm font-bold text-on-surface">Brand Colors</h3>
            <button 
              type="button" 
              onClick={handleAddColor}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary-container/80 text-sm font-semibold transition-colors flex items-center gap-2"
            >
              Add Color
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.id} className="relative group flex flex-col gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-colors shadow-sm">
                <button 
                  type="button" 
                  onClick={() => handleRemoveColor(color.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md hover:scale-110"
                >
                  <X size={14} />
                </button>
                
                <div className="w-full aspect-square rounded-xl shadow-inner border border-outline-variant/20 relative overflow-hidden group/color cursor-pointer" style={{ backgroundColor: color.hex_code }}>
                  <input 
                    type="color" 
                    value={color.hex_code}
                    onChange={(e) => handleColorChange(color.id, "hex_code", e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md text-white flex items-center gap-1 text-xs">
                       Click to edit
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex flex-col flex-1 min-w-0">
                    <input 
                      type="text" 
                      value={color.name}
                      onChange={(e) => handleColorChange(color.id, "name", e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-on-surface outline-none focus:border-b border-primary truncate"
                    />
                    <input 
                      type="text" 
                      value={color.role}
                      onChange={(e) => handleColorChange(color.id, "role", e.target.value)}
                      className="w-full bg-transparent text-xs text-on-surface-variant outline-none focus:border-b border-primary truncate"
                      placeholder="Role (e.g. primary)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHex(color.hex_code)}
                    className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors shrink-0"
                    title="Copy Hex"
                  >
                    {copiedColor === color.hex_code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-headline-sm font-bold text-on-surface">Typography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Heading Font</label>
              <FontPicker
                value={headingFont}
                onChange={setHeadingFont}
                placeholder="Plus Jakarta Sans"
                options={[
                  "Plus Jakarta Sans",
                  "Inter",
                  "Poppins",
                  "Montserrat",
                  "Playfair Display",
                  "Oswald",
                  "Merriweather",
                  "Outfit",
                  "Raleway"
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Body Font</label>
              <FontPicker
                value={bodyFont}
                onChange={setBodyFont}
                placeholder="Inter"
                options={[
                  "Inter",
                  "Roboto",
                  "Open Sans",
                  "Lato",
                  "Nunito",
                  "Work Sans",
                  "Fira Sans",
                  "PT Serif",
                  "Source Sans 3"
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isPending}
            className="clay-button-primary px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            {isPending ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving Changes...
              </>
            ) : (
              "Save Brand Kit"
            )}
          </button>
        </div>
      </form>

      {/* Live Preview Area */}
      <div className="xl:col-span-1 sticky top-8">
        <div className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20 shadow-xl">
          <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Live Preview
            </h4>
          </div>
          
          <div className="p-6 space-y-8 bg-white dark:bg-black/20" style={{ fontFamily: bodyFont }}>
            {/* Header Preview */}
            <div className="text-center space-y-4">
              {logoAsset ? (
                <div className="h-16 flex items-center justify-center">
                  <img 
                    src={getPublicUrl(logoAsset.storage_bucket, logoAsset.storage_path)} 
                    alt="Logo"
                    className="h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto flex items-center justify-center">
                  <ImagePlus className="text-neutral-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: headingFont }}>
                  {name || "Your Brand"}
                </h1>
                {tagline && (
                  <p className="text-sm text-on-surface-variant mt-1 italic">{tagline}</p>
                )}
              </div>
            </div>

            {/* Colors Preview */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-outline uppercase tracking-wider">Color Palette</p>
                <div className="flex h-12 rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
                  {colors.map(c => (
                    <div key={c.id} className="flex-1 transition-all hover:flex-[2]" style={{ backgroundColor: c.hex_code }} title={c.name}></div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Rules Preview */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-outline uppercase tracking-wider">AI Persona</p>
              <div className="bg-surface-container-low p-4 rounded-xl space-y-3 border border-outline-variant/20">
                <div className="flex gap-2 text-sm">
                  <span className="font-medium shrink-0">Tone:</span>
                  <span className="text-on-surface-variant truncate">
                    {toneOfVoice.length > 0 ? toneOfVoice.join(", ") : "Default"}
                  </span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-medium shrink-0 text-error">Avoid:</span>
                  <span className="text-on-surface-variant truncate">
                    {forbiddenWords.length > 0 ? forbiddenWords.join(", ") : "None"}
                  </span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-medium shrink-0 text-primary">CTA:</span>
                  <span className="text-on-surface-variant truncate">
                    {preferredCta || "Default"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* CTA Preview */}
            <div className="flex justify-center pt-2">
              <button 
                type="button"
                className="px-6 py-2.5 rounded-full font-bold shadow-md transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: colors.find(c => c.role === 'primary')?.hex_code || '#4F46E5',
                  color: '#ffffff'
                }}
              >
                {preferredCta || "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AssetPickerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSelectAsset={(asset) => {
          setLogoAsset(asset)
          setIsLogoModalOpen(false)
        }}
        title="Select Brand Logo"
        assetTypeFilter="image"
      />
    </div>
  )
}
