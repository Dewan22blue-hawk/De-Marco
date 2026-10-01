# Prompt Pengembangan: Upgrade Sidebar Dashboard — Active State, Collapse, & Lucide

> Prompt ini dirancang untuk memandu implementasi fitur navigasi sidebar yang lebih cerdas,
> responsif, dan premium sesuai dengan standar desain Demarco.

---

## 1. Konteks & Tujuan

Tingkatkan sidebar (`src/components/layout/sidebar.tsx`) agar mendukung:
- **Active Route Highlighting**: Menu yang aktif otomatis ter-highlight berdasarkan URL.
- **Icon-Rail Collapse**: Sidebar bisa disusutkan menjadi mode ikon saja (rail) untuk menghemat ruang.
- **Modern UI & Lucide Icons**: Migrasi dari Material Symbols ke Lucide Icons dan perbaikan visual Claymorphism.
- **Responsive Drawer**: Dukungan mobile drawer (sembunyi di layar kecil, muncul sebagai overlay).

---

## 2. Referensi & Kondisi Saat Ini

### 2.1 File Terkait
- `src/components/layout/sidebar.tsx` — Komponen utama (saat ini Server Component statis).
- `src/app/dashboard/layout.tsx` — Layout dashboard (saat ini `ml-64` hardcoded).
- `src/app/(main)/layout.tsx` — Layout utama (perlu diperbaiki karena sidebar overlap konten).
- `src/components/layout/topbar.tsx` — Tempat tombol hamburger mobile nanti berada.
- `src/app/globals.css` — Lokasi kelas `.clay-surface`, `.clay-button-*`, dan token warna.

### 2.2 Skill `ui-ux-pro-max`
Jalankan search berikut untuk panduan transisi dan tooltip:
```bash
python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "sidebar navigation collapse transition" --domain ux
python "<SKILL_DIR>/.agents/skills/ui-ux-pro-max/scripts/search.py" "tooltip accessibility icon rail" --domain ux
```

---

## 3. Pekerjaan Konkret (Requirement)

### 3.1 Arsitektur & Active State
1. **Split Component**: Ubah `sidebar.tsx` agar bagian navigasi (`nav`) menjadi Client Component (mis. `SidebarNav.tsx`) supaya bisa menggunakan `usePathname()`.
2. **Path Matching**: Gunakan `pathname.startsWith(href)` untuk menentukan status aktif. 
   - *Catatan*: `/dashboard` (Overview) harus menggunakan matching eksak atau pengecekan khusus agar tidak selalu aktif saat di sub-halaman lain.
3. **Active Styling**: Terapkan kelas `bg-primary-container text-on-primary-container font-semibold shadow-sm` dan set ikon menjadi solid (`FILL: 1` jika tetap Material, atau fill-color jika Lucide).

### 3.2 Icon-Rail Collapse (Desktop)
1. **State Persistence**: Gunakan `localStorage` (key: `demarco_sidebar_collapsed`) untuk menyimpan status collapse.
2. **Visual Transition**: 
   - Mode Expanded: Lebar `w-64`.
   - Mode Collapsed (Rail): Lebar `w-20`.
   - Animasi transisi lebar sidebar dan visibilitas teks (label) menggunakan `framer-motion` (halus, durasi ±200-300ms).
3. **Header/Footer Refactor**:
   - Logo di header menyusut atau hanya menampilkan simbol utama saat collapsed.
   - User menu di footer menyesuaikan ukuran.
4. **Tooltips**: Karena project belum punya library tooltip (Radix), buat tooltip CSS sederhana (atau pakai Radix Tooltip jika diizinkan pasang) yang muncul saat hover ikon dalam mode rail.

### 3.3 Migrasi Ikon (Lucide)
Ganti semua ikon Material Symbols menjadi `lucide-react`:
- Overview → `LayoutDashboard`
- Asset Library → `FolderKanban`
- AI Templates → `Sparkles`
- Brand Kit → `Palette`
- Team Access → `Users`
- Settings → `Settings`
- New Template (CTA) → `PlusCircle`

### 3.4 Responsive Layout (Mobile & Bug Fix)
1. **Layout Dashboard**: Ganti `ml-64` statis menjadi margin dinamis (mis. `pl-64` saat sidebar open desktop, `pl-20` saat collapsed, `pl-0` di mobile).
2. **Mobile Drawer**: 
   - Desktop (≥1024px): Sidebar selalu terlihat (bisa collapsed/expanded).
   - Mobile (<1024px): Sidebar tersembunyi (`-translate-x-full`), muncul sebagai overlay (backdrop blur) saat tombol hamburger di Topbar diklik.
3. **Fix (main) Layout**: Samakan struktur margin/padding di `src/app/(main)/layout.tsx` agar sidebar tidak menutupi konten settings.

---

## 4. Aturan P0 & Konvensi

- **No New Deps**: Usahakan tanpa library tambahan (manfaatkan `framer-motion` yang sudah ada).
- **Claymorphism**: Gunakan `.clay-surface` untuk background sidebar dan `.clay-button-primary` untuk CTA.
- **Tenant Isolation**: Pastikan context user/organisasi tetap diambil dengan aman (Server Component pembungkus).
- **Z-Index**: Pastikan sidebar (`z-40`), overlay (`z-45`), dan topbar (`z-30`) tersusun benar.

---

## 5. Langkah Implementasi

1. **Step 1**: Buat state management untuk `isCollapsed` (Client Component) dan implementasikan persistence.
2. **Step 2**: Update `sidebar.tsx` & `SidebarNav.tsx` untuk UI rail + Lucide icons.
3. **Step 3**: Perbaiki `dashboard/layout.tsx` dan `(main)/layout.tsx` untuk margin dinamis.
4. **Step 4**: Tambahkan tombol hamburger di `topbar.tsx` dan logika drawer mobile.
5. **Step 5**: Verifikasi active state di semua menu (Overview, Assets, Templates, Settings).
6. **Step 6**: Lint & Typecheck.
