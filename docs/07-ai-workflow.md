# PROMPT INSTRUKSI AI AGENT: TAHAP 7 — HYBRID AI CREATIVE STUDIO

**Target:** Membangun sistem desain hybrid (Template-based & From Scratch) yang terintegrasi dengan Brand Kit dan Asset Library untuk PT Deraly Innovation Digital.

---

### 1. DATA MODEL & SECURITY (P0)
- **API Key Management**: Implementasikan penyimpanan `GEMINI_API_KEY` di level organisasi (tabel `settings`). 
  - Gunakan `supabase/migrations/20261005000004_ai_settings_vault.sql` untuk membuat tabel/setting konfigurasi AI yang terproteksi.
- **RBAC**: Pastikan hanya user dengan permission `designs.create` yang bisa memanggil AI Generator.

### 2. AI DESIGN ENGINE (P1)
- **File:** `src/lib/ai/service.ts`
- **Fungsi Baru:** `generateHybridDesign`
  - **Inputs:** `prompt`, `dimension?`, `organization_id`.
  - **Logic:** Ambil daftar aset aktif (logo, icons). Instruksikan AI untuk mengembalikan JSON elemen desain (x, y, w, h, content, style, asset_id).
  - **Output:** Valid JSON yang sesuai dengan skema `design_elements`.

### 3. UI/UX: INTERACTIVE STAGE (P2)
- **File:** `src/app/dashboard/designs/new/create-design-client.tsx`
- **Feature:**
  - **Dimension Selector**: Dropdown preset dimensi + toggle "Let AI Decide".
  - **Imagination Bar**: Textarea untuk prompt desain bebas.
  - **Interactive Stage**: Area preview yang merender JSON AI menggunakan komponen `design-element-renderer`.
- **Style:** Modern Claymorphism (Soft shadows, rounded corners 3xl).

### 4. STORAGE & PERSISTENCE (P2)
- **Preview Capture**: Gunakan `html-to-image` di client-side untuk mengonversi hasil stage menjadi PNG.
- **Supabase Integration**: 
  - Simpan file PNG ke bucket `assets`.
  - Simpan metadata desain ke tabel `designs` dan elemen ke `design_elements`.
- **Audit**: Pastikan run tercatat di `ai_runs`.

### 5. DEFINITION OF DONE
- [ ] User bisa men-generate desain dari prompt "Banner diskon jasa pembuatan web".
- [ ] AI menyarankan dimensi yang tepat jika user memilih "Let AI Decide".
- [ ] Preview interaktif tampil sebelum user mengklik tombol Simpan.
- [ ] Hasil desain muncul di "My Designs" dengan file fisik tersimpan di bucket.
- [ ] Lolos `npm run lint` dan `npm run typecheck`.
