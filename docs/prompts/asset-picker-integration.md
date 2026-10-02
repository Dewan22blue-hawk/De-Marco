# Prompt Pengembangan: Integrasi Asset Picker ke Pembuatan & Editing Template

> Prompt ini dirancang untuk memandu pengembangan komponen **AssetPickerModal** dan mengintegrasikannya dengan formulir **Template** (`src/app/dashboard/templates/new/template-form-client.tsx` & `[id]`), sehingga pengguna dapat memilih aset gambar (Thumbnail & Background) dari **Asset Library** secara interaktif.

---

## 1. Konteks & Tujuan

Saat ini, formulir pembuatan/pengeditan Template belum terhubung dengan **Asset Library**. Kolom `thumbnail_asset_id` dan `background_asset_id` pada tabel `templates` masih terisi `null` atau default.

Tujuan dari tugas ini adalah:
1. Membuat komponen modal **AssetPickerModal** yang dapat dipanggil kembali (reusable) untuk memilih aset dari database.
2. Mengintegrasikan **AssetPickerModal** ke dalam `TemplateFormClient` untuk pemilihan Thumbnail dan Background.
3. Memastikan Server Action `createTemplateFromForm` / `updateTemplate` menyimpan `thumbnail_asset_id` dan `background_asset_id` dengan benar.

---

## 2. Referensi & Source of Truth

1. **File Terkait**:
   - `src/app/dashboard/templates/new/template-form-client.tsx` — Form Client Pembuatan Template.
   - `src/app/dashboard/templates/actions.ts` — Server Action Template (`createTemplateFromForm`, `createTemplate`, `updateTemplate`).
   - `src/app/dashboard/assets/actions.ts` — Server Action Aset (`listAssets`, `listAssetCategories`).
   - `src/schemas/template.ts` — Zod Schema untuk Template.
   - `supabase/migrations/20261001000000_init_schema.sql` — Skema tabel `templates` & `assets`.

2. **Aturan Project**:
   - UI/UX sesuai standar Claymorphism (`docs/03-ui-ux-guidelines.md`).
   - Mutasi data melalui Server Actions / Server Components.
   - Menggunakan ikon dari `lucide-react`.

---

## 3. Spesifikasi Fungsionalitas & Rincian Tugas

### 3.1. Komponen `AssetPickerModal` (`src/components/dashboard/assets/asset-picker-modal.tsx`)
- **Tipe Props**:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSelectAsset: (asset: { id: string; name: string; storage_path: string; storage_bucket: string }) => void`
  - `assetTypeFilter?: string` (opsional, misal hanya menampilkan gambar)
  - `title?: string` (misal: "Pilih Thumbnail Template" / "Pilih Background Template")
- **Fitur Inside Modal**:
  - Search bar (debounce 300ms) untuk memfilter nama/tag aset.
  - Tabs/Filter Kategori Aset.
  - Grid preview aset (thumbnail gambar, nama aset, ukuran).
  - State indikator loading / empty state.
  - Kursor `pointer` dan efek highlight saat item dipilih.

### 3.2. Integrasi pada `TemplateFormClient` (`src/app/dashboard/templates/new/template-form-client.tsx`)
- Tambahkan UI Card/Section khusus untuk **Visual Assets**:
  1. **Thumbnail Asset**:
     - Kotak preview image. Jika belum ada aset dipilih, tampilkan tombol `+ Choose Thumbnail`.
     - Jika aset sudah dipilih, tampilkan preview gambar beserta tombol `Change` dan `Remove`.
     - Simpan ID aset ke hidden input `<input type="hidden" name="thumbnail_asset_id" value={thumbnailAssetId || ""} />`.
  2. **Background Asset**:
     - Serupa dengan Thumbnail Asset.
     - Simpan ID aset ke hidden input `<input type="hidden" name="background_asset_id" value={backgroundAssetId || ""} />`.

### 3.3. Update Server Actions (`src/app/dashboard/templates/actions.ts`)
- Di fungsi `createTemplateFromForm(formData: FormData)`:
  - Ekstrak `thumbnail_asset_id` dan `background_asset_id` dari `formData`.
  - Teruskan kedua field tersebut ke fungsi `createTemplate(payload)`.

---

## 4. Definition of Done (Kriteria Keberhasilan)

- [ ] Komponen `AssetPickerModal` dibuat dan berfungsi tanpa error.
- [ ] User dapat membuka modal Asset Picker dari form Template, mencari/memilih aset, dan melihat preview secara real-time.
- [ ] Form Template berhasil mengirimkan `thumbnail_asset_id` & `background_asset_id` saat disubmit.
- [ ] Data tersimpan di Supabase dan halaman detail/list template menampilkan thumbnail & background yang dipilih.
- [ ] Lolos `npm run lint` dan `npx tsc --noEmit`.
