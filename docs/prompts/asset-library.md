# Prompt Pengembangan: Asset Library — UI/UX & Fungsionalitas

> Prompt ini dibuat untuk memandu AI developer (atau sesi pengembangan berikutnya)
> dalam meningkatkan fitur **Asset Library** di Demarco Marketing Platform.

---

## 1. Konteks & Tujuan

Tingkatkan fitur **Asset Library** (`/dashboard/assets`) agar memiliki tampilan
UI/UX yang premium dan fungsionalitas yang solid, mengikuti identitas visual
**Claymorphism + Modern SaaS** (lihat `docs/03-ui-ux-guidelines.md`):
primary `#4F46E5`, rounded besar (`rounded-2xl`/`rounded-3xl`), soft shadow,
blur/frosted glass pada overlay, dan hover animation halus.

---

## 2. Referensi Wajib (Source of Truth)

Patuhi prioritas `AGENTS.md`: P0 Security > P1 Architecture > P2 Quality > P3 Product.

### 2.1 File yang sudah ada (baca semuanya sebelum mulai)

- `src/app/dashboard/assets/page.tsx` — Server Component, auth + fetch awal
- `src/app/dashboard/assets/asset-library-client.tsx` — UI utama (grid, search, modal detail)
- `src/app/dashboard/assets/actions.ts` — Server Actions (`saveAssetMetadata`, `listAssets`, `renameAsset`, `updateAssetTags`, `deleteAsset`, `listAssetCategories`)
- `src/components/features/assets/AssetUploader.tsx` — Upload drag & drop
- `docs/03-ui-ux-guidelines.md` — Style, palette, konsep dashboard

### 2.2 Skill `ui-ux-pro-max` (wajib dipakai)

Sebelum menulis kode, jalankan search script untuk mendapatkan design guidance:

```bash
python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "media library file manager dashboard" --design-system -p "Demarco"
python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "gallery grid selection keyboard" --domain ux
python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "suspense streaming list virtualize" --stack nextjs
```

Ganti `<SKILL_DIR>` dengan root project. Terapkan hasil yang relevan
(palette, spacing, touch target, focus, motion), bukan styling bebas.

### 2.3 Token & komponen yang BOLEH dipakai

- Utility CSS: `clay-surface`, `clay-surface-neural`, `clay-button-primary`,
  `clay-button-neural`, `debossed-well` (lihat `src/app/globals.css`)
- Token warna M3-style: `surface`, `surface-container-*`, `on-surface`,
  `on-surface-variant`, `outline`, `outline-variant`, `primary`
- Komponen reusable: `@/components/ui/alert-modal` (`AlertModal`),
  `button`, `input`, `card`, `loading`, helper `cn()`
- Library terinstal: `framer-motion`, `lucide-react`
  (icon HARUS lucide; JANGAN pakai emoji atau `material-symbols-outlined`)
- Stack: Next.js 16 App Router, TypeScript strict, Tailwind CSS **v4**,
  Supabase Auth + RLS

### 2.4 Larangan

- JANGAN tambah dependency baru tanpa justifikasi tertulis.
- `SUPABASE_SERVICE_ROLE_KEY` tetap server-only. Semua query tetap dibatasi
  `organization_id` + RLS. Soft delete pakai `deleted_at`, dan catat audit log
  via `createAuditLog` seperti pola di `actions.ts`.
- Ikuti pola arsitektur yang ada: Server Component default, `"use client"`
  hanya untuk komponen interaktif, mutasi via Server Actions.

---

## 3. Hasil Audit (daftar pekerjaan konkret)

Kode saat ini memiliki masalah berikut yang HARUS diperbaiki:

1. Search hanya jalan saat submit (Enter), tanpa debounce dan tanpa loading indicator.
2. Input search diteruskan mentah ke query `.or()` di `listAssets` — karakter
   khusus (misal `%`, `,`, `{`, `}`) merusak query. Wajib sanitasi/escape.
3. `limit: 50` hardcoded di `page.tsx`; `count` diambil tapi tidak dipakai —
   belum ada paginasi / load-more.
4. Tidak ada sorting (newest / name / size) dan tidak ada filter tipe file.
5. Filter kategori memakai `<select>` mentah; tidak ada chip filter aktif,
   tidak ada tombol reset filter, empty state tanpa tombol "clear filters".
6. Delete memakai `confirm()` bawaan browser — ganti dengan `AlertModal`.
7. Error hanya `console.error`; user tidak mendapat feedback. Tambahkan
   feedback error inline (tanpa library toast baru).
8. Rename: blur langsung save, tanpa validasi, tanpa Esc untuk batal, tanpa
   state loading saat menyimpan.
9. Ikon preview non-image masih memakai `material-symbols-outlined` —
   ganti ke lucide (`FileText`, `FileVideo`, `FileAudio`, `FileArchive`)
   sesuai `asset_type`/`mime_type`.
10. `AssetDetailsModal`: tanpa focus trap, tanpa handler Esc, tanpa navigasi
    keyboard (←/→ antar aset), tanpa body scroll lock, tombol close tanpa
    `aria-label`.
11. Semua icon-only button tanpa `aria-label`.
12. `AssetUploader`: hanya 1 file, progress palsu (10/40/80/100 bukan progress
    nyata dari upload), `dragLeave` flicker, tipe file terbatas
    (`image/*,.pdf,.doc,.docx`), tidak ada pilihan kategori yang jelas saat
    upload massal.
13. Tidak ada skeleton/loading state saat navigasi client-side
    (search/filter transition).
14. Tidak ada multi-select / bulk action (pilih banyak, hapus massal,
    pindah kategori massal).

---

## 4. Requirement UI/UX

### 4.1 Toolbar

- Search input dengan debounce ±300ms, indikator loading saat mencari,
  tombol clear (X) saat ada teks, dan `aria-label="Search assets"`.
- Filter: kategori sebagai chip (bukan select mentah), filter tipe file
  (All / Images / Documents / Video / Audio / Other), dropdown sort
  (Newest / Name A–Z / Largest / Smallest).
- Tampilkan chip filter aktif dengan tombol hapus per chip + "Clear all".
- View toggle: grid ↔ list (ikon `LayoutGrid` / `List`), persisten di URL.
- Semua state filter/search/sort/view disinkron ke URL search params
  (`q`, `category`, `type`, `sort`, `view`) memakai `router.replace`
  agar bisa di-deep-link dan tombol back browser berfungsi.

### 4.2 Grid kartu

- Kartu: thumbnail `aspect-square`, badge kategori, nama (truncate + tooltip),
  ukuran file, dimensi (jika image). Hover: scale halus 150–300ms
  (hormati `prefers-reduced-motion`).
- Lazy-load gambar (`loading="lazy"`), reserve aspect-ratio agar CLS < 0.1.
- Quick actions (rename, download, delete) dengan `aria-label` dan target
  sentuh ≥ 44×44px.
- Checkbox multi-select muncul saat hover / selalu terlihat dalam "select mode".
- Skeleton cards saat loading (bukan blank / spinner tengah saja).

### 4.3 Bulk action bar

- Muncul saat ≥1 aset dipilih: tampilkan jumlah, tombol "Select all (page)",
  "Move to category", "Delete" (konfirmasi via `AlertModal`), "Cancel".
- Setelah aksi bulk: clear selection, refresh data, tampilkan feedback sukses/gagal.

### 4.4 Lightbox / detail modal

- Focus trap, tutup dengan Esc dan klik backdrop, body scroll lock saat terbuka.
- Navigasi ←/→ antar aset dalam hasil saat ini; tombol prev/next + counter
  ("3 of 24").
- Panel detail: preview besar, nama (inline rename dengan Enter save / Esc
  cancel + validasi non-kosong), metadata (type, size, dimensi, tanggal upload,
  kategori), tags (add/remove), tombol Download Original + Copy URL
  (dengan feedback "Copied").
- Preview non-image: tampilkan ikon tipe yang sesuai + info mime; untuk PDF
  pertimbangkan embed preview bila memungkinkan tanpa dependency baru.

### 4.5 Upload

- Refactor `AssetUploader` menjadi dialog/dropzone multi-file: pilih banyak
  file sekaligus atau drag & drop banyak file.
- Progress NYATA per file (gunakan `XMLHttpRequest` upload.onprogress atau
  chunked feedback jujur — jangan angka palsu), daftar antrean dengan status
  per file (queued / uploading / done / error), error per file dengan tombol
  retry, dan pilihan kategori berlaku untuk batch.
- Validasi tipe & ukuran file di client dengan pesan error yang jelas.

### 4.6 States

- Loading: skeleton grid.
- Empty hasil filter: ilustrasi + teks + tombol "Clear filters".
- Empty awal: CTA upload yang jelas.
- Error fetch: banner error + tombol "Retry" (page tidak boleh crash blank).

### 4.7 Accessibility & responsive

- Kontras teks ≥ 4.5:1, focus ring terlihat untuk navigasi keyboard,
  `aria-label` di semua icon-only button, role yang benar untuk dialog
  (`role="dialog" aria-modal="true"`).
- Responsif tanpa horizontal scroll: 375px, 768px, 1024px, 1440px.
- `prefers-reduced-motion`: matikan scale/hover animation.

---

## 5. Requirement Fungsionalitas (Backend / Actions)

1. **Sanitasi search**: escape karakter khusus (`%`, `_`, `,`, `(`, `)`, dll.)
   sebelum dimasukkan ke query `.or()` di `listAssets`.
2. **Sorting & filter tipe**: tambah opsi `sort_by` (`created_at`/`name`/`file_size`)
   + `sort_dir`, filter `asset_type` di `listAssets`; teruskan dari `page.tsx`
   via search params.
3. **Paginasi**: ganti hard limit dengan paginasi `range` + tombol "Load more"
   (atau infinite scroll). Manfaatkan `count` yang sudah ada untuk
   "Showing X of Y".
4. **Bulk actions baru**:
   - `bulkDeleteAssets(assetIds: string[])` — soft delete + audit log per record,
     tetap filter `organization_id`.
   - `bulkUpdateAssets(assetIds: string[], data: { category_id?: string })` —
     pindah kategori massal + audit log.
5. **Validasi server-side**: nama tidak boleh kosong (rename), tags dibatasi
   (misal maks 20 tag, lowercase, trim), ukuran file sesuai batas bucket.
6. **Optimistic update** di client untuk rename/tags/delete dengan rollback
   saat gagal + feedback error inline.

---

## 6. Urutan Implementasi

1. Perluas `actions.ts` (sanitasi, sort, filter type, bulk actions) + verifikasi
   RLS/tenant isolation tetap terjaga.
2. Sinkronisasi state filter/search/sort/view/pagination ke URL di
   `page.tsx` + `asset-library-client.tsx`.
3. Toolbar baru (debounced search, chips, sort, view toggle).
4. Grid kartu + skeleton + multi-select + bulk bar (`AlertModal` untuk konfirmasi).
5. Lightbox/detail modal (focus trap, keyboard nav, copy URL, inline edit).
6. Refactor `AssetUploader` multi-file dengan progress nyata.
7. Empty/loading/error states + audit a11y + responsif.
8. Verifikasi (lihat §7).

Jaga minimal blast radius: jangan ubah file di luar folder
`src/app/dashboard/assets/` dan `src/components/features/assets/` kecuali
benar-benar perlu (misal menambah komponen kecil di `@/components/ui/`).

---

## 7. Definition of Done

- [ ] Semua 14 temuan audit (§3) teratasi.
- [ ] Search debounce + URL sync + deep-link berfungsi; tombol back browser benar.
- [ ] Load-more menampilkan "Showing X of Y" dengan benar.
- [ ] Bulk delete/move dengan konfirmasi `AlertModal` + audit log tercatat.
- [ ] Lightbox: Esc menutup, ←/→ berpindah, focus trap aktif, scroll body terkunci.
- [ ] Upload multi-file dengan progress nyata dan error per file.
- [ ] Tidak ada `confirm()` bawaan, tidak ada `console.error` tanpa feedback user,
      tidak ada ikon non-lucide, tidak ada dependency baru.
- [ ] Lolos `npm run lint` dan `npx tsc --noEmit` tanpa error.
- [ ] Manual check: 375/768/1024/1440px, navigasi keyboard penuh, kontras teks.
