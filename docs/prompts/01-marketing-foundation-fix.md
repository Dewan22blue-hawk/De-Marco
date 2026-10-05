# PROMPT INSTRUKSI AI AGENT: TAHAP 1 — PERBAIKAN FONDASI MARKETING MODULE
**Target:** Memperbaiki bug arsitektur, RLS, Enum, dan Relasi Query pada modul **Campaigns**, **Content Library**, dan **Calendar** agar siap digunakan.

---

### KONTEKS ARSITEKTUR & ATURAN (P0 - NON-NEGOTIABLE)
1. **Source of Truth**: Database PostgreSQL (Supabase).
2. **Tenant Isolation (P0)**: Seluruh akses data harus terisolasi per organisasi menggunakan fungsi `private.has_permission(organization_id, 'permission_code')`.
3. **Anti-Hallucination**: Jangan menambah nilai enum baru di frontend yang tidak ada di skema database.

---

### DAFTAR TUGAS IMPLEMENTASI

#### 1. Database & RLS Migration (P0)
- **File:** `supabase/migrations/20261004000001_marketing_content_rls.sql`
- **Tindakan:** Pastikan file ini berisi RLS policies untuk tabel:
  - `campaigns` (permissions: `campaigns.read`, `campaigns.create`, `campaigns.update`, `campaigns.delete`)
  - `contents` (permissions: `contents.read`, `contents.create`, `contents.update`, `contents.delete`)
  - `campaign_contents` (scoped melalui relasi ke tabel `campaigns`)
  - `content_calendar` (permissions: `contents.read`, `contents.update`, `contents.delete`)

#### 2. Enum Sanitization pada Form Frontend (P1)
- **File 1:** `src/app/dashboard/contents/new/create-content-form.tsx`
- **File 2:** `src/app/dashboard/contents/[id]/edit-content-form.tsx`
- **File 3:** `src/app/dashboard/calendar/new/create-calendar-event-form.tsx`
- **File 4:** `src/app/dashboard/contents/schedule-modal.tsx`
- **Tindakan:** Batasi opsi pilihan pada `CustomSelect` hanya pada nilai enum valid berikut:
  - `platform`: `instagram`, `facebook`, `linkedin`, `whatsapp`, `website`, `other`
  - `content_type`: `post`, `story`, `reel`, `article`, `announcement`

#### 3. Perbaikan Relasi Query Campaign Detail (P1)
- **File:** `src/app/dashboard/campaigns/[id]/page.tsx`
- **Tindakan:** 
  - Ubah query `.select('*, contents (*)')` menjadi `.select('*, campaign_contents ( contents (*) )')`.
  - Sesuaikan pemetaan data di komponen JSX agar membaca data dari `campaign.campaign_contents`.

#### 4. Pembersihan Kode & Syntax (P2)
- **File:** `src/app/dashboard/calendar/page.tsx`
- **Tindakan:** Hapus duplikasi baris `import Link from "next/link"`.

---

### KRITERIA SELESAI (DEFINITION OF DONE)
1. Seluruh menu marketing (`/dashboard/campaigns`, `/dashboard/contents`, `/dashboard/calendar`) dapat dibuka tanpa memicu error otorisasi/database kosong.
2. Form pembuatan draf konten dan penjadwalan kalender berhasil menyimpan data.
3. Jalankan verifikasi statis dan pastikan lolos 100%:
   ```bash
   npm run lint && npm run typecheck
   ```
