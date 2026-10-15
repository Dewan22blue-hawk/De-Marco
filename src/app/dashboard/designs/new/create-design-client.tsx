"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LayoutTemplate, ImagePlus, CheckCircle2, ChevronRight, Wand2, Sparkles, Send, FileText } from "lucide-react"
import { AssetPickerModal } from "@/components/dashboard/assets/asset-picker-modal"
import { createDesignFromTemplate, magicFillDesignVariables, generateAIDesignDraft, createDesignFromAIDraft } from "../actions"
import { saveAssetMetadata } from "@/app/dashboard/assets/actions"
import { InteractiveStage, scaleFor } from "./interactive-stage"
import { CustomSelect } from "@/components/ui/custom-select"
import { buildDesignPromptFromContent, dimensionForContent, readDesignBrief, clearDesignBrief, type ContentBrief } from "@/lib/design/content-brief"

export function CreateDesignClient({ 
  templates, 
  brandKit, 
  assets = [],
  campaigns = [],
  canLinkCampaigns = false
}: { 
  templates: any[]
  brandKit: any
  assets?: any[]
  campaigns?: { id: string; name: string }[]
  canLinkCampaigns?: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  
  // Base State
  const [mode, setMode] = useState<'select' | 'template' | 'ai'>('select')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Template Mode State
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, any>>({})
  const [assetPickerVariableId, setAssetPickerVariableId] = useState<string | null>(null)
  const [designName, setDesignName] = useState("")
  const [isMagicFilling, setIsMagicFilling] = useState(false)
  const [magicPrompt, setMagicPrompt] = useState("")
  const [showMagicPrompt, setShowMagicPrompt] = useState(false)

  // AI Mode State
  const [aiDimension, setAiDimension] = useState<string>('auto')
  const [campaignId, setCampaignId] = useState<string>("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiOutput, setAiOutput] = useState<any | null>(null)
  const [aiAssetMap, setAiAssetMap] = useState<Record<string, { url: string }>>({})

  // Content Library hand-off
  const [contentBrief, setContentBrief] = useState<ContentBrief | null>(null)
  const briefApplied = useRef(false)

  useEffect(() => {
    if (briefApplied.current) return
    briefApplied.current = true

    const brief = readDesignBrief()
    if (!brief) return
    clearDesignBrief()

    setContentBrief(brief)
    setMode('ai')
    setStep(2)
    setAiPrompt(buildDesignPromptFromContent(brief))
    setAiDimension(dimensionForContent(brief))
    if (brief.title?.trim()) setDesignName(brief.title.trim())
    if (brief.campaign_id && canLinkCampaigns) setCampaignId(brief.campaign_id)
  }, [canLinkCampaigns])

  const campaignOptions = [
    { value: "", label: "No campaign" },
    ...(campaigns || []).map((c) => ({ value: c.id, label: c.name })),
  ]

  // Utilities
  const getPublicUrl = (asset: any) => {
    if (!asset) return null
    return supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path).data.publicUrl
  }

  // --- TEMPLATE FLOW HANDLERS ---
  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template)
    setDesignName(`${template.name} - Custom`)
    const initialVars: Record<string, any> = {}
    template.template_variables?.forEach((v: any) => {
      if (v.default_value) initialVars[v.id] = v.default_value
    })
    setVariableValues(initialVars)
    setMode('template')
    setStep(2)
  }

  const handleVariableChange = (id: string, value: any) => {
    setVariableValues(prev => ({ ...prev, [id]: value }))
  }

  const handleMagicFill = async () => {
    if (!selectedTemplate || !magicPrompt.trim()) return
    setIsMagicFilling(true)
    setError(null)
    try {
      const generatedValues = await magicFillDesignVariables(selectedTemplate.id, magicPrompt)
      setVariableValues(prev => ({ ...prev, ...generatedValues }))
      setShowMagicPrompt(false)
    } catch (err: any) {
      setError(err.message || "Failed to perform Magic Fill")
    } finally {
      setIsMagicFilling(false)
    }
  }

  const handleGenerateTemplate = () => {
    if (!selectedTemplate) return
    if (!designName.trim()) {
      setError("Please provide a design name.")
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await createDesignFromTemplate({
          templateId: selectedTemplate.id,
          name: designName,
          variableValues
        })
        if (res.success) {
          router.push(`/dashboard/designs/${res.design.id}`)
        }
      } catch (err: any) {
        setError(err.message || "Failed to generate design")
      }
    })
  }


  // --- AI FLOW HANDLERS ---
  const DIMENSION_PRESETS = [
    { label: 'Let AI Decide', value: 'auto' },
    { label: 'Social Post (1080x1080)', value: '1080x1080' },
    { label: 'Story (1080x1920)', value: '1080x1920' },
    { label: 'Banner (1200x628)', value: '1200x628' },
    { label: 'Flyer A4 (1240x1754)', value: '1240x1754' },
    { label: 'Poster (2480x3508)', value: '2480x3508' },
  ]

  const buildAssetMap = (assetIds: string[]) => {
    const map: Record<string, { url: string }> = {}
    if (brandKit?.logo_asset_id) {
       const logo = assets.find(a => a.id === brandKit.logo_asset_id)
       if (logo) {
         map[logo.id] = { url: getPublicUrl(logo) || '' }
       }
    }
    assetIds.forEach(id => {
      const asset = assets.find(a => a.id === id)
      if (asset) {
        map[id] = { url: getPublicUrl(asset) || '' }
      }
    })
    return map
  }

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return
    setError(null)
    setAiOutput(null)
    
    startTransition(async () => {
      try {
        let dimension = undefined
        if (aiDimension !== 'auto') {
          const [w, h] = aiDimension.split('x').map(Number)
          dimension = { width: w, height: h }
        }

        const draft = await generateAIDesignDraft({
          prompt: aiPrompt,
          dimension,
          campaignId: canLinkCampaigns && campaignId ? campaignId : undefined
        })

        // Collect asset IDs to pre-fetch public URLs for preview
        const usedAssetIds = draft.elements.map(el => el.asset_id).filter(Boolean) as string[]
        setAiAssetMap(buildAssetMap(usedAssetIds))
        
        setDesignName(draft.name || 'AI Generated Design')
        setAiOutput(draft)
        setStep(3) // Move to interactive stage
      } catch (err: any) {
        setError(err.message || "Failed to generate AI draft")
      }
    })
  }

  const handleSaveAIDesign = async () => {
    if (!aiOutput || !designName.trim()) return
    setError(null)
    
    startTransition(async () => {
      try {
        // 1. Capture HTML to Image
        const { toPng } = await import('html-to-image')
        const stageEl = document.getElementById('ai-design-stage')
        if (!stageEl) throw new Error("Stage element not found")

        // Ensure webfonts and images are settled before capturing
        if (document.fonts?.ready) {
          await document.fonts.ready
        }
        await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)))

        const maxDim = Math.max(aiOutput.width, aiOutput.height)
        const dynamicRatio = maxDim > 1500 ? 1.5 : 2

        const dataUrl = await toPng(stageEl, { 
          width: aiOutput.width, 
          height: aiOutput.height, 
          pixelRatio: dynamicRatio,
          cacheBust: true,
          style: {
            transform: 'none',
            transformOrigin: 'top left'
          }
        })
        
        // 2. Upload to storage
        const blob = await (await fetch(dataUrl)).blob()
        const path = `designs/ai-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
        
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(path, blob, { contentType: 'image/png', upsert: false })
          
        if (uploadError) throw uploadError
        
        // 3. Create asset metadata
        const assetRes = await saveAssetMetadata({
          name: designName + " Preview",
          mime_type: 'image/png',
          file_size: blob.size,
          storage_bucket: 'assets',
          storage_path: path,
          asset_type: 'image',
          width: aiOutput.width,
          height: aiOutput.height
        })

        // 4. Create design from AI draft
        const designRes = await createDesignFromAIDraft({
          name: designName,
          output: aiOutput,
          previewAssetId: assetRes.id || assetRes.asset?.id,
          campaignId: canLinkCampaigns && campaignId ? campaignId : undefined
        })

        if (designRes.success) {
          router.push(`/dashboard/designs/${designRes.design.id}`)
        }

      } catch (err: any) {
        setError(err.message || "Failed to save AI design")
      }
    })
  }


  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-error-container text-on-error-container border border-error rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* --- INITIAL SELECTION MODE --- */}
      {mode === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div 
            onClick={() => { setMode('ai'); setStep(2); }}
            className="group clay-surface p-8 sm:p-12 rounded-[2rem] border border-outline-variant/30 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Sparkles size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-title-lg font-bold text-on-surface mb-2">Start from Scratch (AI)</h3>
              <p className="text-body-md text-on-surface-variant max-w-sm">Describe what you need, and our Hybrid AI will compose a full layout using your brand assets.</p>
            </div>
          </div>

          <div 
            onClick={() => { setMode('template'); setStep(1); }}
            className="group clay-surface p-8 sm:p-12 rounded-[2rem] border border-outline-variant/30 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <LayoutTemplate size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-title-lg font-bold text-on-surface mb-2">Use a Template</h3>
              <p className="text-body-md text-on-surface-variant max-w-sm">Choose from existing studio templates and manually adjust variables for a quick start.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- TEMPLATE MODE UI --- */}
      {mode === 'template' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm font-semibold mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-outline'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>1</div>
              <span>Select Template</span>
            </div>
            <ChevronRight className="text-outline w-4 h-4 mx-2" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-outline'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>2</div>
              <span>Fill Content</span>
            </div>
            <ChevronRight className="text-outline w-4 h-4 mx-2" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-outline'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>3</div>
              <span>Generate</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <button onClick={() => setMode('select')} className="text-sm font-bold text-on-surface-variant hover:text-on-surface mb-2">
                ← Back to mode selection
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    onClick={() => handleSelectTemplate(template)}
                    className="clay-surface group rounded-3xl overflow-hidden border border-outline-variant/20 hover:border-primary cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col"
                  >
                    <div className="relative aspect-square bg-surface-container-low overflow-hidden flex items-center justify-center p-4">
                      {template.thumbnail_asset ? (
                        <img src={getPublicUrl(template.thumbnail_asset) || undefined} alt={template.name} className="w-full h-full object-contain drop-shadow-lg" />
                      ) : (
                        <LayoutTemplate size={48} className="text-on-surface-variant/20" />
                      )}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                    </div>
                    <div className="p-4 bg-white dark:bg-black/20">
                      <h3 className="font-bold text-on-surface truncate">{template.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1 capitalize">{template.template_type.replace('_', ' ')} • {template.width}×{template.height}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedTemplate && (
            <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-8 border border-outline-variant/20 max-w-3xl">
              <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container-low overflow-hidden">
                  {selectedTemplate.thumbnail_asset ? (
                    <img src={getPublicUrl(selectedTemplate.thumbnail_asset) || undefined} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <LayoutTemplate className="w-full h-full p-4 text-on-surface-variant/30" />
                  )}
                </div>
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface">{selectedTemplate.name}</h2>
                  <p className="text-sm text-on-surface-variant">Fill in the template variables below.</p>
                </div>
                
                <div className="ml-auto relative">
                  <button 
                    onClick={() => setShowMagicPrompt(!showMagicPrompt)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    <Wand2 size={16} />
                    ✨ AI Magic Fill
                  </button>
                  
                  {showMagicPrompt && (
                    <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-surface rounded-2xl shadow-xl border border-outline-variant/30 z-50">
                      <h4 className="text-sm font-bold text-on-surface mb-2">Campaign Brief</h4>
                      <textarea 
                        value={magicPrompt}
                        onChange={e => setMagicPrompt(e.target.value)}
                        placeholder="E.g. A summer sale promotion for our new sneaker collection. Give a 50% discount call to action."
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/50 rounded-lg outline-none focus:border-primary mb-3"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowMagicPrompt(false)} className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                        <button 
                          onClick={handleMagicFill}
                          disabled={isMagicFilling || !magicPrompt.trim()}
                          className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                          {isMagicFilling ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                          Fill Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {!selectedTemplate.template_variables || selectedTemplate.template_variables.length === 0 ? (
                  <div className="p-4 bg-surface-container-low rounded-xl text-center text-sm text-on-surface-variant">
                    This template has no variables to customize. You can proceed directly.
                  </div>
                ) : (
                  selectedTemplate.template_variables.map((variable: any) => (
                    <div key={variable.id} className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                        {variable.name}
                        {variable.is_required && <span className="text-error">*</span>}
                      </label>
                      
                      {variable.variable_type === 'long_text' ? (
                        <textarea 
                          value={variableValues[variable.id] || ''}
                          onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                          placeholder={variable.placeholder || ''}
                          maxLength={variable.max_length || undefined}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 outline-none text-on-surface"
                        />
                      ) : variable.variable_type === 'image' ? (
                        <div className="flex items-center gap-4">
                          {variableValues[variable.id] ? (
                            <div className="w-24 h-24 relative rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest">
                               <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                 <button type="button" onClick={() => setAssetPickerVariableId(variable.id)} className="text-xs bg-white text-black px-2 py-1 rounded font-bold">Change</button>
                               </div>
                               <CheckCircle2 className="absolute top-1 right-1 w-5 h-5 text-emerald-500 bg-white rounded-full z-10" />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssetPickerVariableId(variable.id)}
                              className="w-24 h-24 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant"
                            >
                              <ImagePlus size={20} />
                              <span className="text-[10px] font-bold">Select Image</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <input 
                          type={variable.variable_type === 'number' ? 'number' : variable.variable_type === 'color' ? 'color' : 'text'}
                          value={variableValues[variable.id] || ''}
                          onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                          placeholder={variable.placeholder || ''}
                          maxLength={variable.max_length || undefined}
                          className={`w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 outline-none text-on-surface ${variable.variable_type === 'color' ? 'h-12 p-1 cursor-pointer' : ''}`}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                <button onClick={() => { setStep(1); setSelectedTemplate(null); }} className="px-6 py-2.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-high transition-colors">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="clay-button-primary px-8 py-2.5 rounded-xl text-white font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedTemplate && (
            <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-8 border border-outline-variant/20 max-w-3xl">
              <div className="space-y-4">
                <h2 className="text-headline-sm font-bold text-on-surface">Finalize Design</h2>
                <p className="text-sm text-on-surface-variant">Give your new design a name and hit generate. We'll handle the rest.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface">Design Name</label>
                <input 
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="Summer Campaign Flyer"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 outline-none text-on-surface font-headline-sm"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-high transition-colors" disabled={isPending}>
                  Back
                </button>
                <button onClick={handleGenerateTemplate} disabled={isPending} className="clay-button-primary px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg">
                  {isPending ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating...</>
                  ) : (
                    <><Wand2 size={20} /> Generate Design</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- AI MODE UI --- */}
      {mode === 'ai' && (
        <div className="animate-in fade-in duration-300 space-y-8">
          <div className="flex items-center gap-4 mb-4">
             <button onClick={() => setMode('select')} className="text-sm font-bold text-on-surface-variant hover:text-on-surface">
               ← Back
             </button>
             <h2 className="text-title-lg font-bold flex items-center gap-2">
                <Sparkles className="text-primary w-6 h-6" />
                AI Creative Studio
             </h2>
          </div>

          {contentBrief && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-on-surface">
              <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-primary">Loaded from Content Library</p>
                <p className="text-on-surface-variant">
                  The brief below was generated from {contentBrief.title ? `“${contentBrief.title}”` : "your saved content"}. Review it, then generate the layout.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="clay-surface p-6 rounded-3xl border border-outline-variant/20 flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Dimension</label>
                    <select 
                      value={aiDimension}
                      onChange={e => setAiDimension(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-on-surface"
                    >
                      {DIMENSION_PRESETS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Campaign</label>
                    <CustomSelect
                      value={canLinkCampaigns ? campaignId : ""}
                      onChange={setCampaignId}
                      options={campaignOptions}
                      disabled={!canLinkCampaigns}
                      placeholder="No campaign"
                    />
                    {!canLinkCampaigns && (
                      <p className="text-xs text-on-surface-variant/80">
                        Only Campaign Managers can link designs to a campaign.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Imagination Bar</label>
                    <textarea 
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="Describe what you want to create... e.g. A vibrant summer sale banner showcasing our new sneaker product, with a bold 50% off tag."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-on-surface resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateAI}
                    disabled={isPending || !aiPrompt.trim()}
                    className="clay-button-primary w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isPending ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Crafting Design...</>
                    ) : (
                      <><Send size={18} /> Generate Layout</>
                    )}
                  </button>
                </div>

                {step === 3 && aiOutput && (
                  <div className="clay-surface p-6 rounded-3xl border border-outline-variant/20 flex flex-col gap-4 animate-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Design Name</label>
                      <input 
                        type="text"
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 outline-none text-on-surface font-headline-sm"
                      />
                    </div>
                    <button 
                      onClick={handleSaveAIDesign}
                      disabled={isPending || !designName.trim()}
                      className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                         <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      Save to My Designs
                    </button>
                  </div>
                )}
             </div>

             <div className="lg:col-span-7">
               {step === 3 && aiOutput ? (
                 <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-3xl border border-outline-variant/20 relative min-h-[500px]">
                   <div className="absolute top-4 left-4 flex gap-2">
                     <span className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded-full">{aiOutput.width} × {aiOutput.height}</span>
                     <span className="px-3 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded-full capitalize">{(aiOutput.design_type || 'custom').replace('_', ' ')}</span>
                   </div>
                   <div className="mt-8">
                     <InteractiveStage 
                       output={aiOutput} 
                       assetMap={aiAssetMap} 
                       scale={scaleFor(aiOutput.width, aiOutput.height, 600, 500)} 
                     />
                   </div>
                 </div>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-container-low rounded-3xl border border-outline-variant/20 border-dashed text-on-surface-variant min-h-[500px]">
                   <Sparkles className="w-16 h-16 opacity-20 mb-4" />
                   <p className="font-medium text-center">Your AI generated layout will appear here.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      <AssetPickerModal
        isOpen={!!assetPickerVariableId}
        onClose={() => setAssetPickerVariableId(null)}
        onSelectAsset={(asset) => {
          if (assetPickerVariableId) {
            handleVariableChange(assetPickerVariableId, asset.id)
            setAssetPickerVariableId(null)
          }
        }}
        title="Select Image for Variable"
        assetTypeFilter="image"
      />
    </div>
  )
}
