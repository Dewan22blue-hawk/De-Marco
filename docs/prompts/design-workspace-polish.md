# Prompt Pengembangan: Creative Studio — Workspace Polish (Resize, Rotate, Element Types, Status & Preview)

> Melengkapi `/dashboard/designs/[id]` agar sesuai PRD §13 Canvas Engine & §14 Element Types. Scope: handle resize/rotate interaktif, shortcut keyboard, tipe elemen lengkap, workflow status, dan auto-preview `preview_asset_id`.

## 1. Konteks & Tujuan
Fase 1 (Library + Generate) dan integrasi Asset/Brand sudah ada. Editor masih drag-only. Tujuan polish: canvas dapat resize/rotate, duplicate/delete via keyboard, elemen `logo/icon/line/button/badge/qr/group`, status `draft→review→approved→archived`, dan preview otomatis tersimpan.

## 2. Referensi
- `src/app/dashboard/designs/[id]/canvas-editor.tsx`, `properties-panel.tsx`, `layers-panel.tsx`, `design-detail-client.tsx`, `actions.ts` (`updateDesignElements`, `getDesign`)
- `supabase/migrations/20261001000000_init_schema.sql` enums `design_status`, `design_element_type`
- `docs/01-prd.md` §13, §14, §15; `docs/00-erd.md` §24; `AGENTS.md` P0 Security
- `docs/prompts/design-asset-brand-integration.md`, `creative-studio-canvas-export.md`

## 3. Spesifikasi
### 3.1 Canvas Handles
- Resize: handle kanan-bawah, drag → update `width/height` (min 10). Scale-aware (`/ scale`).
- Rotate: handle atas-tengah, drag horizontal → `rotation` (mod 360).
- Drag tetap, lock/hidden mencegah interaksi.

### 3.2 Keyboard
- `Delete/Backspace` (bukan saat input fokus) → hapus elemen terpilih.
- `Ctrl/Cmd+D` → duplicate elemen (offset +20px, z_index baru).
- Pasang `window.addEventListener('keydown', ...)` di CanvasEditor, cleanup.

### 3.3 Tipe Elemen
- `logo` (asset_id wajib, wrapper khusus), `icon` (Lucide name di `content.icon`), `line` (garis horizontal, height 2-4), `button` (rect + teks CTA), `badge` (pill), `qr` (placeholder pattern), `group` (parent_id).
- Renderer di CanvasEditor + kontrol di PropertiesPanel (icon picker, line color/weight, button text).

### 3.4 Status Workflow
- Header tambah `select` status: `draft/review/approved/archived`. Action `updateDesignStatus(designId, status)` → audit + revalidate.
- RLS `designs` sudah ada; guard `designs.update`.

### 3.5 Auto Preview
- Saat `Save Draft` sukses, `toPng` canvas → upload ke `storage/assets` (bucket `assets`) → `saveAssetMetadata` → update `designs.preview_asset_id`.
- Fallback jika upload gagal: tetap simpan elements, log error.

### 3.6 Data Integrity
- `updateDesignElements` sudah fix version → pastikan `parent_id`, `metadata` ikut, increment `current_version`, insert `design_versions`.
- `getDesign` join `assets!asset_id` untuk `assetMap`.

## 4. Langkah Agent
1. Update `actions.ts`: tambah `updateDesignStatus`, perbaiki `updateDesignElements` (version calc, current_version).
2. Tulis ulang `canvas-editor.tsx` dengan resize/rotate + keydown + assetMap.
3. Perluas `properties-panel.tsx` untuk tipe baru (icon/line/button).
4. Update `design-detail-client.tsx`: header status control, pass handlers `onDelete/onDuplicate`, assetMap, brandKit.
5. Tambah preview upload di `handleSave`.

## 5. Definition of Done
- [ ] Resize/rotate handle berfungsi, scale-aware.
- [ ] Delete & duplicate via keyboard.
- [ ] 6+ tipe elemen render benar.
- [ ] Status dapat diubah dan persist.
- [ ] Preview PNG ter-upload dan `preview_asset_id` terisi.
- [ ] `npm run lint` & `npx tsc --noEmit` lolos.
