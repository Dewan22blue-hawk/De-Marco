# PROMPT INSTRUKSI AI AGENT: TAHAP 2 — AI CONTENT GENERATOR ENGINE
**Target:** Mengimplementasikan alur kecerdasan buatan (Intelligence Layer) untuk generasi konten pemasaran yang peka terhadap brand kit, terstruktur, tervalidasi, dan tersimpan aman di tabel `contents` dan `ai_runs`.

---

### KONTEKS ARSITEKTUR & ATURAN (P0 - NON-NEGOTIABLE)
1. **Source of Truth**: Supabase PostgreSQL (`contents`, `brands`, `ai_runs`).
2. **Context First, Generation Second**: AI tidak boleh beroperasi seperti chatbot kosong. Sistem wajib menyuntikkan konteks Brand Kit (`tone_of_voice`, `preferred_cta`, `target_audience`, `forbidden_words`) dari organisasi terkait.
3. **Structured Output & Zero Hallucination**: AI wajib menghasilkan output JSON terstruktur yang lolos validasi Zod. Dilarang memalsukan harga, persentase diskon, nomor telepon, atau data hukum.
4. **Bahasa**: Default Bahasa Indonesia yang natural, kontekstual pemasaran lokal, tidak kaku atau terjemahan harfiah.

---

### DAFTAR TUGAS IMPLEMENTASI

#### 1. Zod Schema Validation (P1)
- **File:** `src/schemas/ai-content.ts` (atau buat baru jika belum ada)
- **Tindakan:**
  Definisikan skema validasi Zod untuk respons AI:
  ```ts
  import { z } from "zod";

  export const GeneratedContentSchema = z.object({
    title: z.string().min(3).max(100),
    body: z.string().min(10),
    hashtags: z.array(z.string()).default([]),
    cta: z.string().optional().default(""),
    tone: z.string().optional().default("Professional"),
    content_type: z.enum(["post", "story", "reel", "article", "announcement"]).default("post"),
  });

  export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;
  ```

#### 2. Enhanced AI Context Builder & Service (P1)
- **File:** `src/lib/ai/service.ts`
- **Tindakan:**
  - Ambil active brand kit organisasi (`brands`) saat memproses `runAITask` dengan task type `content_generation`.
  - Susun System Prompt yang menyertakan:
    - Nama brand, tagline, deskripsi bisnis.
    - Nada bicara (`tone_of_voice`).
    - Kata-kata terlarang (`forbidden_words`).
    - Panggilan aksi yang disukai (`preferred_cta`).
  - Parsing output AI, bersihkan markdown delimiter (seperti ` ```json `), dan validasi dengan `GeneratedContentSchema`.
  - Catat audit run ke `ai_runs` (input context, raw response, tokens, user id).

#### 3. Server Action: Generate Content (P0 / P1)
- **File:** `src/app/dashboard/contents/actions.ts`
- **Tindakan:**
  - Perbarui fungsi `generateContentWithAI(topic: string, contentType?: string, campaignId?: string)`.
  - Verifikasi sesi pengguna dan tenant (`default_organization_id`).
  - Panggil AI Service Layer dengan menyertakan context brand & campaign (jika dipilih).
  - Return data terstruktur tervalidasi ke client component.

#### 4. UI/UX: Interactive Generation & Review Flow (P3)
- **File:** `src/app/dashboard/contents/auto-generate-form.tsx`
- **Tindakan:**
  - Tambahkan pilihan tipe konten (`post`, `story`, `reel`, `article`, `announcement`).
  - Tambahkan tombol pilihan opsi "Apply to Form" (membuka editor konten dengan field terisi) dan "Save as Draft" (langsung menyimpan ke DB `contents` dengan status `draft`).
  - Sediakan indikator status loading yang informatif (menggunakan Claymorphism surface & pulse/skeleton).
  - Tampilkan penanganan error yang anggun jika kuota API habis atau gagal parsing.

---

### KRITERIA SELESAI (DEFINITION OF DONE)
1. User dapat memasukkan topik di Content Library dan menekan "Generate with AI".
2. AI menghasilkan draft konten yang konsisten dengan tone Brand Kit organisasi.
3. Log audit tersimpan di tabel `ai_runs` dengan `organization_id` yang sesuai.
4. User dapat menyimpan hasil sebagai draft atau meneruskannya ke form `/dashboard/contents/new`.
5. Kode lolos uji statis:
   ```bash
   npm run lint && npm run typecheck
   ```
