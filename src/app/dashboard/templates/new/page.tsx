import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createTemplateFromForm, listTemplateCategories } from "../actions"

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const categories = await listTemplateCategories()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Design</p>
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Create Template</h1>
        <p className="text-on-surface-variant">Buat blueprint template yang bisa dipakai ulang untuk kebutuhan marketing.</p>
      </div>

      <form action={createTemplateFromForm} className="clay-surface rounded-3xl border border-outline-variant/20 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="name" className="text-sm font-medium text-on-surface">Template Name</label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              placeholder="Ramadan Promo"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="text-sm font-medium text-on-surface">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              placeholder="Template untuk promo Ramadan untuk social media"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-on-surface">Code</label>
            <input
              id="code"
              name="code"
              required
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
              placeholder="ramadan-promo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="template_type" className="text-sm font-medium text-on-surface">Template Type</label>
            <select
              id="template_type"
              name="template_type"
              defaultValue="social_post"
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              <option value="flyer">Flyer</option>
              <option value="poster">Poster</option>
              <option value="banner">Banner</option>
              <option value="social_post">Social Post</option>
              <option value="social_story">Social Story</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="category_id" className="text-sm font-medium text-on-surface">Category</label>
            <select
              id="category_id"
              name="category_id"
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="format_code" className="text-sm font-medium text-on-surface">Format</label>
            <select
              id="format_code"
              name="format_code"
              defaultValue="instagram_post"
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              <option value="instagram_post">Instagram Post</option>
              <option value="instagram_story">Instagram Story</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="a4">A4</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-medium text-on-surface">Width</label>
            <input
              id="width"
              name="width"
              type="number"
              min={1}
              defaultValue={1080}
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="text-sm font-medium text-on-surface">Height</label>
            <input
              id="height"
              name="height"
              type="number"
              min={1}
              defaultValue={1080}
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium text-on-surface">Unit</label>
            <select
              id="unit"
              name="unit"
              defaultValue="px"
              className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              <option value="px">px</option>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/templates" className="rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface">Cancel</Link>
          <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Create Template</button>
        </div>
      </form>
    </div>
  )
}
