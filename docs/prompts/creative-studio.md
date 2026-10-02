# Prompt Pengembangan: Creative Studio — My Designs (Fase 1: Library + Generate Design)

> Prompt ini memandu Agent untuk membangun **Creative Studio / My Designs** (`/dashboard/designs`) — menu P0 berikutnya setelah **Brand Kit**. Scope fase ini: Library CRUD + Generate Design dari Template (clone `template_elements` → `design_elements`). Export (PNG/PDF) dan Canvas Drag&Drop ditunda ke fase berikutnya.

---

## 1. Konteks & Tujuan

Foundation (Asset + Template + Brand Kit) sudah ada. Workflow inti PRD yang belum stabil:

```
Login → Dashboard → Asset Library → Template Library → Create Flyer
→ Fill Content → Select Asset → Open Canvas → Drag&Drop → Edit → Save → Export
```

**Tujuan Fase 1:**
1. User dapat melihat daftar desain milik organisasinya (grid/list, search, filter, sort).
2. User dapat membuat desain baru dengan memilih Template → mengisi variabel (`template_variables`) → sistem melakukan clone elemen & membuat record `designs` + `design_elements`.
3. User dapat melihat detail desain, duplicate, archive (soft delete), dan rename.
4. Security: RLS untuk `designs`/`design_elements` wajib (gap P0 saat ini belum ada policy).

> Prinsip: `Template berubah ≠ Design existing berubah` — clone harus snapshot, tidak ada FK yang membuat edit template merusak design.

---

## 2. Referensi & Source of Truth

### 2.1 Skema Database
- `supabase/migrations/20261001000000_init_schema.sql` — Tabel `designs` (id, organization_id, source_template_id, source_template_version, brand_id, name, design_type, format_code, width, height, unit, status, preview_asset_id), `design_elements` (id, design_id, parent_id, source_template_element_id, element_type, asset_id, x, y, width, height, rotation, opacity, z_index, visible, locked, content, style, metadata), enums `design_status` (`draft|review|approved|archived`), `design_element_type`. Baca ERD `docs/00-erd.md` §22 `designs`, §23 Design Cloning Model, §24 `design_elements`.
- `supabase/migrations/20261001000009_phase01_rbac_security.sql` — Permission `designs.read/create/update/delete` sudah di-seed. RLS belum ada untuk `designs` — harus dibuat mengikuti pola `20261001000010_phase03_template_rls.sql`.

### 2.2 Template sebagai Sumber
- `src/app/dashboard/templates/actions.ts` — `listTemplates`, `getTemplate` (dengan variables & elements). Gunakan sebagai referensi clone.
- `src/schemas/template.ts` — `templateElementSchema`, `templateVariableSchema`.
- `docs/00-erd.md` §18–21 — Template engine.

### 2.3 Referensi UI yang Sudah Ada
- `src/app/dashboard/templates/template-library-client.tsx` — Pola grid/list, search debounce, URL SearchParams, Optimistic clone/archive.
- `src/app/dashboard/assets/asset-library-client.tsx` — Pola toolbar kategori, bulk actions.
- `src/components/dashboard/assets/asset-picker-modal.tsx` — (dari prompt `asset-picker-integration.md`) — Reuse untuk variabel bertipe `image`.
- `src/components/layout/sidebar-client.tsx` — `navItems` perlu entri baru.
- `src/lib/breadcrumb-config.ts` — Tambah `designs: 'My Designs'` / `studio: 'Creative Studio'`.
- `src/app/dashboard/page.tsx` — Statistik & activity sudah query `designs`.

### 2.4 Dokumen Produk
- `docs/01-prd.md` §9 P0 Core, §10 Core User Journey, §12 Creative Studio, §13 Canvas Engine, §37 Design Engine Architecture, §76–77 Final Instruction & Acceptance Test.
- `docs/03-ui-ux-guidelines.md` — Claymorphism, token `clay-surface`, `clay-button-primary`, M3 tokens.
- `AGENTS.md` — P0 Security > P1 Architecture > P2 Quality > P3 Product. Server Actions default, Supabase client `@/lib/supabase/server`.

---

## 3. Audit Saat Ini & Gap

| Area | Status | Catatan |
|------|--------|---------|
| Tabel `designs`/`design_elements` | ✅ Ada di migrasi init | Belum ada migrasi RLS |
| Permission `designs.*` | ✅ Seeded | Belum ada policy |
| Route `/dashboard/designs` | ❌ Belum ada | Harus dibuat |
| Actions `designs` | ❌ Belum ada | Harus dibuat |
| Sidebar entry | ❌ Belum ada | Tambahkan setelah `AI Templates` |
| Breadcrumb | ❌ Belum ada | Tambah `designs` |
| Export | ⏸ Ditunda | Jangan implementasi di fase ini |

---

## 4. Spesifikasi Fungsional

### 4.1 RLS & Migrasi Keamanan (P0 - Wajib Pertama)

Buat migrasi baru `supabase/migrations/20261001000012_designs_rls.sql`:

```sql
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_versions ENABLE ROW LEVEL SECURITY;

-- designs
CREATE POLICY "Members can view designs" ON public.designs FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'designs.read'));
CREATE POLICY "Design creators can create" ON public.designs FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'designs.create'));
CREATE POLICY "Design editors can update" ON public.designs FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'designs.update'))
  WITH CHECK (private.has_permission(organization_id, 'designs.update'));
CREATE POLICY "Design owners can delete" ON public.designs FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'designs.delete'));

-- design_elements (via parent design)
CREATE POLICY "Members can view design elements" ON public.design_elements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.designs d WHERE d.id = design_elements.design_id AND private.has_permission(d.organization_id, 'designs.read')));
-- INSERT/UPDATE/DELETE similar: check via designs.organization_id + designs.create/update
-- design_versions: same pattern
```

> Verifikasi: jalankan `supabase db reset` lokal atau cek di SQL editor bahwa user tanpa permission tidak bisa SELECT.

### 4.2 Server Actions (`src/app/dashboard/designs/actions.ts`)

```ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function listDesigns(opts?: { search?: string; status?: string; design_type?: string; sort_by?: string; sort_dir?: 'asc'|'desc'; limit?: number; offset?: number })
export async function getDesign(designId: string) // + design_elements + source template info
export async function createDesignFromTemplate(payload: { templateId: string; name: string; variableValues?: Record<string, unknown> })
  // 1) auth + profile.default_organization_id
  // 2) fetch template + variables + elements (use getTemplate logic)
  // 3) insert designs { organization_id, source_template_id, source_template_version: template.current_version, brand_id: template.brand_id, name, design_type: template.template_type, format_code, width, height, unit, status: 'draft', created_by: user.id }
  // 4) insert design_versions { design_id, version: 1, snapshot: { template_snapshot, variableValues }, created_by }
  // 5) insert design_elements mapping template_elements -> design_elements (preserve source_template_element_id, resolve variable_id via map if needed, resolve asset_id)
  //    Jika variableValues ada untuk type image -> override asset_id pada element yang variable_id-nya match
  // 6) increment templates.usage_count +1
  // 7) audit + revalidatePath
export async function renameDesign(designId: string, name: string)
export async function duplicateDesign(designId: string)
export async function archiveDesign(designId: string) // update status='archived'
export async function deleteDesign(designId: string) // soft delete: deleted_at
export async function updateDesignStatus(designId: string, status: design_status)
```

- Validasi dengan Zod (buat `src/schemas/design.ts` jika belum ada — reuse `design_element_type` enum).
- Semua query filter `eq('organization_id', profile.default_organization_id)` dan `is('deleted_at', null)` kecuali archive view.
- Gunakan `createAuditLog` per mutasi.

### 4.3 Library Page (`src/app/dashboard/designs/`)

**`page.tsx` (Server Component):**
```tsx
// auth redirect, get profile.default_organization_id
// parse searchParams: q, status, type, sort, view
// await listDesigns({ search: q, status, design_type: type, sort_by, sort_dir, limit: 24, offset })
// return <DesignLibraryClient initialDesigns={data} totalCount={count} ... />
```

**`design-library-client.tsx` (Client Component):**
- Toolbar: search (debounce 300ms, router.replace), filter `status` (All/Draft/Review/Approved/Archived) + `type` (flyer/poster/banner/social_post/social_story/custom), sort (newest/name-asc/size-desc), view toggle grid/list (Framer Motion).
- Grid card: preview (via `preview_asset_id` atau placeholder `layout-template` Lucide), badge `design_type` + `status`, name, `source_template` name, dimensions, created_at, quick actions: View, Duplicate, Archive, Delete.
- List row: thumbnail mini + name/description + type + status + dimensions + actions.
- Empty state: ilustrasi + CTA "Create from Template".
- Bulk actions (opsional Fase 1): select checkbox + bulk archive/delete.
- Optimistic update untuk duplicate/archive/delete.

Styling: `clay-surface`, `rounded-3xl`, `border-outline-variant/20`, hover `shadow-md`, icon `lucide-react`.

### 4.4 Generate Design Flow (`src/app/dashboard/designs/new/`)

**`page.tsx`:**
- Fetch `listTemplates({ limit: 50 })` + brand kit untuk context. Render `<CreateDesignClient templates={...} />`.

**`create-design-client.tsx`:**
1. Step 1: Template Picker — grid template (reuse thumbnail logic `/api/storage/assets/${path}`), pilih satu → highlight.
2. Step 2: Fill Variables — render form dinamis dari `template.template_variables`:
   - `text/long_text` → Input/Textarea, `number` → number input, `color` → color picker, `image` → button "Choose from Library" membuka `AssetPickerModal` (simpan asset_id + preview), `date` → date picker, `url/email/phone` → validated input.
   - Tampilkan `default_value`, `placeholder`, `is_required`, `max_length`.
3. Step 3: Name & Review — input `Design Name` (default: `${template.name} - Copy`), preview canvas statis (render `template_elements` dengan `content` di-override oleh `variableValues`).
4. Submit → `createDesignFromTemplate({ templateId, name, variableValues })` → redirect `/dashboard/designs/[id]`.

- Hidden handling: `variableValues` dikirim sebagai JSON, bukan FormData biasa.

### 4.5 Detail Page (`src/app/dashboard/designs/[id]/`)

- `page.tsx`: `getDesign(id)` → 404 jika null → `<DesignDetailClient design={...} />`.
- `design-detail-client.tsx`: layout 2 kolom (preview kiri, info kanan). Preview: render `design_elements` absolut di container `width x height` (scale responsive). Info: status badge, source template link, dimensions, created_by, actions: Duplicate, Archive, Delete, Edit (disabled dengan tooltip "Canvas editor coming in next phase").

### 4.6 Navigasi & Dashboard

- `src/components/layout/sidebar-client.tsx`: tambah `navItems` entry:
  ```ts
  { href: '/dashboard/designs', label: 'My Designs', icon: Palette /* atau Layers/Brush */ },
  ```
  Letakkan setelah `AI Templates`, sebelum `Brand Kit`.
- `src/lib/breadcrumb-config.ts`: tambah `designs: 'My Designs', studio: 'Creative Studio'`.
- `src/app/dashboard/page.tsx`: pastikan stat `totalDesignsCount` link ke `/dashboard/designs`, recentDesigns render link ke detail.

---

## 5. Requirement UI/UX

- Jalankan skill `ui-ux-pro-max` sebelum coding:
  ```bash
  python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "creative studio gallery dashboard" --domain ux
  python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "template picker variable form" --domain ux
  ```
- Claymorphism + M3 tokens, `rounded-2xl/3xl`, soft shadow, `prefers-reduced-motion`.
- Empty/loading/error states wajib. Skeleton untuk grid.
- Aksesibilitas: `aria-label` pada icon button, focus trap di AssetPickerModal, keyboard nav.

---

## 6. Aturan Arsitektur & Keamanan

- Server Components default, `"use client"` hanya untuk picker/form interaktif.
- Mutasi via Server Actions, jangan buat Route Handler `/api/designs` kecuali perlu.
- Tenant isolation: `organization_id` + RLS. Jangan andalkan `.eq` saja.
- Audit log untuk create/duplicate/archive/delete.
- TypeScript strict, `zod` validation.

---

## 7. Definition of Done

- [ ] Migrasi RLS `designs`/`design_elements`/`design_versions` ter-apply & terverifikasi.
- [ ] `listDesigns` dapat filter/search/sort/paginate dengan benar; URL SearchParams sinkron.
- [ ] Membuat design dari template: clone elements + versions + usage_count + audit.
- [ ] Detail page menampilkan preview & metadata dengan benar.
- [ ] Duplicate / Archive / Delete (soft) berfungsi + revalidatePath.
- [ ] Sidebar & breadcrumb menampilkan "My Designs".
- [ ] AssetPicker untuk variabel `image` berfungsi.
- [ ] Lolos `npm run lint` dan `npx tsc --noEmit`.
- [ ] Tidak ada `any` tanpa alasan; gunakan tipe dari `src/types/supabase.ts` atau schema.

---

## 8. Out of Scope (Fase Berikutnya)

- Canvas Drag & Drop, resize/rotate, layers panel, properties panel, export PNG/PDF, version history UI, collaboration.
- Campaign & Content Calendar linking (`campaign_designs`) — akan jadi prompt terpisah setelah fase ini stabil.

---

## 9. Acceptance Flow (Manual QA)

1. Login → Dashboard → klik "My Designs" di sidebar.
2. Klik "Create Design" → pilih template → isi variabel (teks + pilih image dari Asset Library) → beri nama → Create.
3. Verifikasi design muncul di library, klik detail → preview benar, klik Duplicate → design baru terbuat.
4. Archive & Delete → design hilang dari list default (muncul di filter Archived jika di-implement).
5. Coba akses design milik org lain via URL langsung → 404 / unauthorized (RLS).
