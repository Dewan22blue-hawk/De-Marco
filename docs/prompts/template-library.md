# Prompt Pengembangan: Penyempurnaan Modul Template (UI/UX & Fungsionalitas)

> Prompt ini dirancang untuk memandu pengembangan dan penyempurnaan fitur **Template Library** (`src/app/dashboard/templates/`) agar memiliki tampilan UI/UX yang setara dengan standar Asset Library, serta fungsionalitas yang andal dan terstruktur sesuai PRD v1.2 dan ERD v1.1.

---

## 1. Konteks & Tujuan

Tingkatkan modul **Templates** agar memberikan pengalaman manajemen blueprint desain yang mulus, intuitif, dan responsif. Modul ini mencakup halaman utama galeri (`page.tsx` & `template-library-client.tsx`), halaman pembuatan (`new/page.tsx`), dan halaman detail/editor (`[id]/page.tsx`).

Ikuti prinsip desain **Claymorphism + Modern SaaS** (`docs/03-ui-ux-guidelines.md`):
- Warna primer `#4F46E5`, rounded besar (`rounded-2xl`/`rounded-3xl`), soft shadow, dan efek kaca buram (*frosted glass*).
- Transisi animasi halus (150–300ms) dengan menghormati `prefers-reduced-motion`.

---

## 2. Referensi & Source of Truth

1. **Struktur File & Database**:
   - `src/app/dashboard/templates/page.tsx` — Server Component & entry point.
   - `src/app/dashboard/templates/template-library-client.tsx` — Client Component galeri grid/list.
   - `src/app/dashboard/templates/actions.ts` — Server Actions (list, create, update, delete, clone, archive).
   - `docs/00-erd.md` Section 18-21 — Kontrak tabel `templates`, `template_versions`, `template_variables`, dan `template_elements`.
   - `docs/01-prd.md` Section 11 & 16–19 — Spesifikasi format desain dan sistem template.

2. **Skill UI/UX Pro Max**:
   Jalankan perintah ini untuk panduan visual galeri:
   ```bash
   python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "template gallery grid dashboard manager" --domain ux
   ```

3. **Aturan P0 (Security & Architecture)**:
   - Wajib menjaga isolasi multi-tenant via `organization_id` (RLS).
   - Mutasi data HARUS melalui Server Actions (jangan panggil fetch API internal jika bisa menggunakan Server Actions).
   - Ikon HARUS menggunakan `lucide-react`.

---

## 3. Hasil Audit & Daftar Perbaikan Konkret

1. **Sinkronisasi Data**: Ganti fetch API internal (`/api/templates`) di `template-library-client.tsx` dengan pemanggilan Server Action `listTemplates` agar konsisten dengan Asset Library.
2. **URL State**: Sinkronkan `q` (search), `category`, `type`, `view` (grid/list), dan `sort` ke URL Search Params menggunakan `router.replace`.
3. **Custom Select**: Ganti `<select>` native dengan komponen kustom atau styling M3 yang konsisten (`rounded-2xl`, `bg-surface-container-low`).
4. **Thumbnail Fallback**: Tambahkan penanganan gambar thumbnail yang rusak menggunakan placeholder ikon Lucide (`Layout`, `FileImage`, atau `Crop`) yang elegan.
5. **Bulk Actions**: Tambahkan fitur multi-select untuk menghapus atau mengarsipkan banyak template sekaligus.
6. **Optimistic Updates**: Terapkan UI yang responsif untuk aksi *Clone* dan *Archive* dengan feedback langsung sebelum server merespons.
7. **Accessibility (a11y)**: Tambahkan `aria-label` pada tombol-tombol ikon, pastikan navigasi keyboard (tabbing) logis, dan modal detail memiliki focus trap.

---

## 4. Requirement UI/UX & Fungsionalitas

### 4.1 Toolbar & Filter
- **Search bar**: Debounce 300ms + loading indicator.
- **Filter Type**: All / Flyer / Poster / Banner / Social Post / Social Story / Custom.
- **Filter Category**: Gunakan chip kategori dinamis dari database.
- **View Toggle**: Tombol Grid/List yang halus dengan Framer Motion.

### 4.2 Kartu Template (Grid Mode)
- **Visual**: Thumbnail rasio aspek proporsional, badge tipe di pojok, nama tebal, deskripsi terbatas (line-clamp).
- **Metadata**: Tampilkan dimensi (`W x H px`) dan `usage_count` di bagian bawah kartu.
- **Hover**: Munculkan tombol aksi cepat (*Quick Edit*, *Clone*) saat kursor berada di atas kartu.

### 4.3 Table View (List Mode)
- Kolom: Thumbnail mini, Nama & Deskripsi, Type, Category, Size, Usage, dan Aksi.
- Baris responsif dan mudah diklik.

### 4.4 Form Template Baru (`new/page.tsx`)
- Perbaiki styling form agar menggunakan grid 2-kolom yang rapi.
- Gunakan komponen `Input` dan `CustomSelect` yang sudah ada untuk konsistensi desain.

---

## 5. Definition of Done (Kriteria Keberhasilan)

- [ ] Galeri template terintegrasi penuh dengan URL Search Params.
- [ ] Fitur *Clone* dan *Archive* berfungsi dengan audit log yang benar di database.
- [ ] UI mengikuti standar Claymorphism tanpa ada elemen default/mentah.
- [ ] Responsif di perangkat mobile (sidebar tertutup/drawer, grid menyesuaikan).
- [ ] Lolos `npm run lint` dan `npx tsc --noEmit`.
