# Prompt Pengembangan: Reusable Breadcrumb Navigation

> Prompt ini dirancang untuk memandu pembuatan komponen navigasi **Breadcrumb** yang reusable,
> dinamis, dan accessible untuk dashboard Demarco Platform.

---

## 1. Konteks & Tujuan

Buat komponen **Breadcrumb Navigation** yang dinamis dan terstruktur untuk mempermudah navigasi hierarkis pengguna di seluruh halaman dashboard (`/dashboard/*` dan `/dashboard/settings/*`).

Komponen harus:
- **Dinamis**: Menggunakan `usePathname()` untuk secara otomatis mengekstrak segmen URL.
- **Reusable & Clean**: Memiliki API props yang fleksibel (tidak ada *boilerplate code* berulang di tiap halaman).
- **Claymorphism & M3-aligned**: Menggunakan token warna, Lucide Icons, dan typography yang seragam dengan sistem desain yang ada.
- **Accessible**: Memenuhi standar ARIA untuk navigasi breadcrumb (`nav[aria-label="Breadcrumb"]`, `aria-current="page"`).

---

## 2. Lokasi & Arsitektur Komponen

1. **Komponen Reusable**: `src/components/ui/breadcrumb.tsx`
2. **Helper / Mapping Configuration**: `src/lib/breadcrumb-config.ts` (opsional / inline, untuk memetakan slug URL seperti `assets` menjadi label yang ramah pengguna seperti `Asset Library`).
3. **Penempatan Layout**:
   - Opsi A: Di dalam `src/components/layout/topbar.tsx` (sebelah kiri atau di bawah search bar).
   - Opsi B: Di dalam `src/app/dashboard/layout.tsx` tepat di atas `<main>` atau sebagai komponen header halaman konsisten.

---

## 3. Fitur & Spesifikasi Teknis

### 3.1 Mapping Label Dinamis
Buat pustaka kamus label (dictionary) untuk menerjemahkan segmen URL teknis menjadi nama yang ramah pengguna:
- `dashboard` → `Dashboard`
- `assets` → `Asset Library`
- `templates` → `AI Templates`
- `settings` → `Pengaturan`
- `members` → `Anggota Tim`
- `brand` → `Kit Merek`
- `new` → `Tambah Baru`

Jika segmen berupa UUID/ID (misal: `/dashboard/templates/123e4567-e89b...`), lakukan pemendekan (truncation) otomatis (misal: `123e4...`) atau izinkan halaman mengoper prop `customLabels={{ "123e4567...": "Template Promosi Baju" }}`.

### 3.2 Design & Styling Standards
- **Separator**: Gunakan ikon `ChevronRight` dari `lucide-react` dengan ukuran kecil (`size-4` atau `size-3.5`) dan warna muted (`text-outline/50`).
- **Ikon Beranda**: Segmen pertama (Home/Dashboard) dapat dilengkapi ikon `Home` atau `LayoutDashboard` berukuran kecil.
- **Link Non-Aktif (Path Induk)**: Menggunakan `text-on-surface-variant hover:text-primary transition-colors text-sm font-medium`.
- **Item Aktif (Path Halaman Saat Ini)**:
  - Menggunakan `text-on-surface font-semibold text-sm pointer-events-none`.
  - Disertai atribut `aria-current="page"`.
- **Container Styling**: Menyesuaikan dengan latar belakang Claymorphism / Neumorphism lembut (`bg-surface-container-lowest/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-outline-variant/10 inline-flex items-center gap-2`).

### 3.3 Responsivitas & Handling Path Panjang
- Di layar seluler (`< 640px`), jika segmen URL lebih dari 3 tingkat, ciutkan segmen menengah menggunakan pemicu ellipsis (`...`) atau tampilkan 2 segmen terakhir saja agar tidak merusak tata letak (*no horizontal overflow*).

---

## 4. API Component Props (`src/components/ui/breadcrumb.tsx`)

```typescript
export interface BreadcrumbItemOverride {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** Memungkinkan pemanggilan kustom untuk override segmen URL tertentu */
  overrides?: Record<string, string | BreadcrumbItemOverride>;
  /** Sembunyikan segmen akar (misal: /dashboard) jika diperlukan */
  hideRoot?: boolean;
  /** Class tambahan untuk container luar */
  className?: string;
}
```

---

## 5. Langkah Implementasi

1. **Step 1**: Buat komponen `src/components/ui/breadcrumb.tsx` dengan `"use client"` dan pemrosesan `usePathname()`.
2. **Step 2**: Tambahkan konfigurasi pemetaan slug URL ke label ramah pengguna.
3. **Step 3**: Tambahkan penanganan responsif untuk layar kecil (mobile truncation).
4. **Step 4**: Integrasikan komponen ke dalam `topbar.tsx` atau layout halaman dashboard.
5. **Step 5**: Uji coba pada beberapa rute bertingkat:
   - `/dashboard`
   - `/dashboard/assets`
   - `/dashboard/templates/new`
   - `/dashboard/settings/members`
6. **Step 6**: Jalankan `npm run lint` dan `npx tsc --noEmit` untuk memastikan tidak ada kesalahan tipe data.

---

## 6. Definition of Done

- [ ] Komponen `Breadcrumb` dibuat secara terpusat di `src/components/ui/breadcrumb.tsx`.
- [ ] Teks breadcrumb secara otomatis berubah sesuai dengan lokasi halaman tanpa perlu di-*hardcode* satu-satu di setiap file halaman.
- [ ] Atribut ARIA `aria-label="Breadcrumb"` dan `aria-current="page"` terpasang dengan benar.
- [ ] Tampilan konsisten dengan sistem Claymorphism/M3 dan responsif di semua ukuran layar.
- [ ] Lolos pengujian lint dan typecheck tanpa error.
