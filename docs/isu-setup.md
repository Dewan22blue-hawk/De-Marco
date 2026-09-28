# Issue: Project Setup & Architecture (Demarco)

## 1. Deskripsi Tugas
Lakukan inisialisasi awal proyek **Demarco** (Fullstack Web) menggunakan kerangka **Next.js App Router** dan **Supabase**. Proyek ini akan menggunakan **Arsitektur Berbasis Fitur (Feature-based Architecture)** agar lebih terstruktur dan mudah dalam penyekalaan kelak. Tema UI/UX akan mengusung gaya **Claymorphism** dengan Tailwind CSS.

> **Catatan untuk AI Agent Eksekutor:**
> Instruksi di bawah ini diformat secara High-Level. Jangan melakukan over-engineering. Fokuslah pada penyusunan scaffolding struktur direktori yang benar, instalasi library utama yang diwajibkan, dan perancangan entitas database awal sebelum mengerjakan fitur-fitur kompleks.

## 2. Langkah-langkah Inisialisasi Proyek
1. Lakukan instalasi lingkungan dasar **Next.js** dengan dukungan *App Router* dan TypeScript.
2. Inisiasi dan konfigurasikan **Tailwind CSS**. 
3. Tambahkan setup standar pada configurasi Tailwind untuk mendukung desain *Claymorphism* (misalnya penyesuaian `box-shadow` dengan efek *inner shadow* tebal, dan *custom border-radius* di `tailwind.config.ts`).
4. Instalasi dan inisialisasi modul client **Supabase** (gunakan rilis `@supabase/ssr` untuk App Router), lalu simpan konfigurasinya di direktori `core`.
5. Dokumenkan dan isi semua *Environment Variables* utama di file `.env.example` & `.env.local`.
6. Siapkan infrastruktur deployment dasar dengan membuatan konfigurasi untuk Docker atau Netlify (misalnya `Dockerfile` atau `netlify.toml`).

## 3. Struktur Direktori Utama (Feature-based Architecture)
Berikut adalah pedoman penempatan file. Kamu wajib mematuhinya selama penyusunan codebase proyek:

```text
Demarco/
├── apps/               # Zona aplikasi utama (opsional jika menggunakan monorepo)
├── src/
│   ├── app/            # Ranah eksak untuk Next.js App Router (Routing system, Page, Layout)
│   │   ├── (auth)/     # Route group khusus halaman autentikasi
│   │   ├── dashboard/  # Route untuk halaman dashboard utama
│   │   └── api/        # API Routes (webhook, integrasi eksternal)
│   ├── core/           # Layanan inti (Core Services, Utilities, Configs)
│   │   ├── lib/        # Konfigurasi Supabase client (SSR), auth helper, Axios, dll
│   │   ├── utils/      # Helper standar (contoh: format date, format currecy)
│   │   └── ui/         # Komponen UI Global (mewadahi atom reusable Claymorphism)
│   └── features/       # Feature-based Area / Domain Logic
│       ├── users/
│       │   ├── components/  # UI reaktif khusus yang hanya dipakai pada ranah user
│       │   └── services/    # Fungsi interaksi HTTP/Supabase (Query & Mutation)
│       ├── products/
│       │   ├── components/
│       │   └── services/
│       └── transactions/
│           ├── components/
│           └── services/
├── docs/               # Dokumentasi Proyek terpusat (PRD, Arsitektur, isu)
└── README.md
```

### Aturan Peletakan Modul:
- **Routing:** Hanya boleh ditempatkan di ranah `src/app/`.
- **Controller/Services:** Disediakan sebagai fungsi fungsional di dalam folder `services/` pada masing-masing fitur (contoh: fungsi Supabase fetch `getRoles()` berada di `src/features/users/services/`).
- **Components:** Komponen penunjang layout besar atau sangat spesifik fitur berada pada fitur masing-masing, sedangkan komponen dapat digunakan ulang (reusable UI) seperti Buttons, Cards, Inputs berada di `src/core/ui/`.

## 4. Daftar Library Esensial
Instal dependensi di bawah ini pada awal proyek:
- **Core Framework:** `next`, `react`, `react-dom`
- **Styling:** `tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`
- **Iconography:** `lucide-react`
- **Database/Backend (BaaS):** `@supabase/supabase-js`, `@supabase/ssr`
- **Form Handling:** `react-hook-form`, `zod`, `@hookform/resolvers`

## 5. Skema Database Dasar (PostgreSQL via Supabase)
Rancang skema tabel awal berdasarkan visi pemasaran AI **Deraly AI** (SaaS B2B Platform). Eksekusi melalui Supabase SQL Editor atau masukkan ke dalam skrip migrasi `supabase/migrations/`:

### A. Core Manajemen AI & Pengguna
- **`users`**: Tabel profil pengguna, berelasi dengan `auth.users`. (`id`, `email`, `full_name`, `avatar_url`)
- **`organizations`**: Struktur bisnis organisasi/perusahaan yang berlangganan Deraly AI. (`id`, `name`, `industry`)
- **`organization_members`**: Tabel relasi many-to-many pengguna terhadap organisasi. (`user_id`, `organization_id`, `role`)

### B. Infrastruktur Data / RAG
- **`workspaces`**: Representasi ruang kerja atau proyek di bawah organisasi. (`id`, `organization_id`, `name`)
- **`brand_assets`**: Asset visual untuk brand guidelines (Logo, colors, fonts). (`id`, `workspace_id`, `asset_type`, `asset_value`)
- **`knowledge_base`**: Data mentah yang dipelajari AI (RAG) untuk perusahaan (Visi, misi, SOP). (`id`, `workspace_id`, `title`, `content`, `category`)

### C. Modul Produksi & Kampanye
- **`documents`**: Tempat penyimpanan hasil karya AI (Proposal, Surat Dinas, Kontrak, dll). (`id`, `workspace_id`, `title`, `content`, `document_type`, `status`)
- **`campaigns`**: Modul manajemen kalender konten dan strategi pemasaran. (`id`, `workspace_id`, `title`, `status`, `start_date`, `end_date`, `budget`)

## 6. Kriteria Penerimaan (Acceptance Criteria)
Agen wajib memastikan poin-poin berikut terpenuhi sebelum tahapan inisialisasi ini dinyatakan selesai:
- [ ] Next.js framework terpasang tanpa error dan berjalan normal.
- [ ] Folder dan file penempatan sudah sesuai struktur *Feature-based Architecture*.
- [ ] Konfigurasi Tailwind untuk tema instalasi *Claymorphism* awal (Warna global & shadow set) sudah diatur.
- [ ] File Supabase Server & Client Component berhasil terinisiasi tanpa galat Type/TS.
- [ ] Tabel/entitas yang dijabarkan sudah ter-push ke profil database PostgreSQL Supabase dengan sempurna.
- [ ] File `.env.example` disiapkan dengan placeholder environment (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).
