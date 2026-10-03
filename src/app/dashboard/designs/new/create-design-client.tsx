"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LayoutTemplate, ImagePlus, CheckCircle2, ChevronRight, Wand2 } from "lucide-react"
import { AssetPickerModal, type Asset } from "@/components/dashboard/assets/asset-picker-modal"
import { createDesignFromTemplate } from "../actions"

export function CreateDesignClient({ templates, brandKit }: { templates: any[], brandKit: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Step 1: Template
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)

  // Step 2: Variables
  const [variableValues, setVariableValues] = useState<Record<string, any>>({})
  const [assetPickerVariableId, setAssetPickerVariableId] = useState<string | null>(null)

  // Step 3: Name
  const [designName, setDesignName] = useState("")

  const getPublicUrl = (asset: any) => {
    if (!asset) return null
    return supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path).data.publicUrl
  }

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template)
    setDesignName(`${template.name} - Custom`)
    // Pre-fill default values
    const initialVars: Record<string, any> = {}
    template.template_variables?.forEach((v: any) => {
      if (v.default_value) initialVars[v.id] = v.default_value
    })
    setVariableValues(initialVars)
    setStep(2)
  }

  const handleVariableChange = (id: string, value: any) => {
    setVariableValues(prev => ({ ...prev, [id]: value }))
  }

  const handleGenerate = () => {
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

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm font-semibold">
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

      {error && (
        <div className="p-4 bg-error-container text-on-error-container border border-error rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map(template => (
              <div 
                key={template.id} 
                onClick={() => handleSelectTemplate(template)}
                className="clay-surface group rounded-3xl overflow-hidden border border-outline-variant/20 hover:border-primary cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col"
              >
                <div className="relative aspect-square bg-surface-container-low overflow-hidden flex items-center justify-center p-4">
                  {template.thumbnail_asset ? (
                    <img src={getPublicUrl(template.thumbnail_asset)} alt={template.name} className="w-full h-full object-contain drop-shadow-lg" />
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
          {templates.length === 0 && (
            <div className="text-center p-12 text-on-surface-variant">
              No templates available. Create a template first.
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedTemplate && (
        <div className="clay-surface rounded-3xl p-6 sm:p-8 space-y-8 border border-outline-variant/20 max-w-3xl">
          <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
            <div className="w-16 h-16 rounded-xl bg-surface-container-low overflow-hidden">
              {selectedTemplate.thumbnail_asset ? (
                <img src={getPublicUrl(selectedTemplate.thumbnail_asset)} alt="" className="w-full h-full object-cover" />
              ) : (
                <LayoutTemplate className="w-full h-full p-4 text-on-surface-variant/30" />
              )}
            </div>
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">{selectedTemplate.name}</h2>
              <p className="text-sm text-on-surface-variant">Fill in the template variables below.</p>
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
            <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-high transition-colors">
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

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Wand2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-on-surface mb-1">What happens next?</h4>
              <ul className="text-sm text-on-surface-variant space-y-1 list-disc list-inside">
                <li>A complete snapshot of the template will be cloned.</li>
                <li>Your variables and assets will be injected.</li>
                <li>The design will be saved to your organization's studio.</li>
                <li>Future edits to the base template will not affect this design.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-high transition-colors" disabled={isPending}>
              Back
            </button>
            <button onClick={handleGenerate} disabled={isPending} className="clay-button-primary px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg">
              {isPending ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating...</>
              ) : (
                <><Wand2 size={20} /> Generate Design</>
              )}
            </button>
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
