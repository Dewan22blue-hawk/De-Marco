# Prompt Pengembangan: Integrasi Asset, Brand Kit, dan Template ke Creative Studio Editor

> Prompt ini memandu pengembangan integrasi antara **Creative Studio Editor** (`/dashboard/designs/[id]`) dengan **Asset Library**, **Brand Kit**, dan konteks **Template**. Tujuannya adalah agar user dapat menggunakan aset asli, logo brand, warna brand, dan font brand secara langsung di dalam canvas editor.

---

## 1. Konteks & Tujuan

Saat ini, editor desain sudah memiliki layout 3-kolom dan interaksi drag basic, tetapi masih terisolasi dari data lain:
- Gambar di canvas hanya placeholder; tidak bisa ganti/pilih dari library.
- Tidak ada akses cepat ke aset Brand (Logo, Warna, Font).
- Hubungan dengan Template asal hanya bersifat administratif (statistik), belum informatif di editor.

**Target Hasil:**
1. **Asset Integration**: Render gambar asli di canvas; pilih/ganti gambar via `AssetPickerModal`.
2. **Brand Integration**: Insert logo brand 1-klik; palet warna & font brand tersedia di Properties.
3. **Template Context**: Indikator source template di header + tombol "Apply Brand Kit" (recolor massal).
4. **Data Integrity**: Batch fetch URL aset di server untuk performa; simpan `asset_id` & `metadata` dengan benar.

---

## 2. Referensi & Source of Truth

### 2.1 File Utama
- `src/app/dashboard/designs/[id]/page.tsx` — Entry point (Server).
- `src/app/dashboard/designs/[id]/design-detail-client.tsx` — Orchestrator (Client).
- `src/app/dashboard/designs/[id]/canvas-editor.tsx` — Canvas Renderer.
- `src/app/dashboard/designs/[id]/properties-panel.tsx` — Inspector Panel.
- `src/app/dashboard/designs/actions.ts` — Server Actions.

### 2.2 Data & Schema
- `designs` table: `brand_id`, `source_template_id`.
- `design_elements` table: `asset_id`, `parent_id`, `metadata`, `style`, `content`.
- `BrandKit` (via `getBrandKit`): `logo_asset_id`, `brand_colors`, `brand_fonts`.
- `Asset` (via `AssetPickerModal`): `id`, `storage_bucket`, `storage_path`.

---

## 3. Rincian Implementasi

### 3.1 Resolusi Asset & Server Fetch
- **Ubah `getDesign` di `actions.ts`**: Join `design_elements` dengan `assets!asset_id`.
- **Bangun `assetMap` di `page.tsx`**: Iterasi elemen desain, panggil `supabase.storage.from(...).getPublicUrl(...)` untuk setiap `asset_id`. Kirim `assetMap: Record<id, { url, name }>` sebagai prop ke client.
- **Canvas Rendering**: Di `CanvasEditor`, ganti placeholder `image` dengan `<img src={assetMap[el.asset_id]?.url} />`.

### 3.2 Integrasi Asset Library (Toolbar & Properties)
- **Tambah Elemen Image**: Toolbar kiri "Image Frame" membuka `AssetPickerModal`. On select -> `addElement('image', { asset_id: asset.id })`.
- **Replace/Remove Asset**: Di `PropertiesPanel` untuk elemen tipe `image`/`logo`:
  - Tombol **"Replace"** -> buka `AssetPickerModal`.
  - Tombol **"Remove"** -> set `asset_id: null`.

### 3.3 Integrasi Brand Kit (Toolbar & Properties)
- **Fetch Brand**: `page.tsx` panggil `getBrandKit(orgId)` -> pass ke client.
- **Section "Brand" di Toolbar**:
  - Tombol **"Insert Logo"**: Jika `brandKit.logo` ada, tambahkan elemen logo dengan `asset_id` tersebut.
  - Tombol **"Brand Colors"**: Klik warna brand langsung menambahkan shape kotak warna tersebut.
- **Properties Palette**: Saat elemen `text`/`shape` dipilih, tampilkan baris warna dari `brandKit.brand_colors` untuk pewarnaan cepat.
- **Properties Fonts**: Saat elemen `text` dipilih, tampilkan dropdown font dari `brandKit.brand_fonts`.

### 3.4 Context & Automation
- **Header Badge**: Tampilkan "Template: {name} v{version}" dan "Brand: {name}".
- **Action "Apply Brand Kit"**: Tombol di header yang melakukan recolor elemen desain (misal: semua elemen dengan role `primary` berubah ke warna primary brand) dan update font secara massal.

---

## 4. Perbaikan Teknis & Keamanan (P0)

1. **Fix `updateDesignElements`**: Pastikan field `parent_id` dan `metadata` ikut disertakan dalam mapping insert/upsert elemen.
2. **Type Safety**: Ganti penggunaan `any` pada props `design`, `elements`, dan `brandKit` dengan interface yang sesuai dari `@/schemas/` atau `CanvasElement`.
3. **Optimistic Updates**: Pastikan ganti aset memberikan feedback visual instan di canvas.

---

## 5. Definition of Done (Kriteria Keberhasilan)

- [ ] Gambar asli (bukan placeholder) tampil di canvas menggunakan URL yang valid.
- [ ] User dapat menambah, mengganti, dan menghapus aset gambar dari Asset Library ke dalam desain.
- [ ] User dapat memasukkan Logo Brand dengan 1 klik dari toolbar.
- [ ] Properties Panel menampilkan palet warna dan pilihan font sesuai Brand Kit organisasi.
- [ ] Header menampilkan informasi asal template dan brand yang aktif.
- [ ] Seluruh data (termasuk `asset_id` dan `metadata`) tersimpan dengan benar ke database saat "Save Draft".
- [ ] Lolos `npm run lint` dan `npx tsc --noEmit`.

---

## 6. Langkah Eksekusi untuk Agent

1. Update `getDesign` di `src/app/dashboard/designs/actions.ts` untuk include asset data.
2. Modifikasi `src/app/dashboard/designs/[id]/page.tsx` untuk fetch `brandKit` & bangun `assetMap`.
3. Update `CanvasEditor` untuk merender gambar asli via `assetMap`.
4. Update `PropertiesPanel` untuk mendukung Brand Color, Brand Font, dan Asset Replacement.
5. Tambahkan section "Brand" dan fitur "Insert Image" di toolbar `DesignDetailClient`.
6. Implementasikan fungsi "Apply Brand Kit" sederhana.
7. Verifikasi simpan data elemen secara menyeluruh.
