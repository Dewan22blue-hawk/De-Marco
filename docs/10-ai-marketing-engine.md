# DERALY PLATFORM: AI CONTENT GENERATOR & AUTO POST SPECIFICATION

## 1. Overview
Implementasi sistem otomasi marketing end-to-end: **Idea → AI Gen → Review → Schedule → Auto Post (via N8N)**.

## 2. P0: Fondasi & Perbaikan (Segera Dilakukan)
- **RLS Policies**: Seluruh tabel marketing (`campaigns`, `contents`, `content_calendar`) harus memiliki policy `private.has_permission(organization_id, 'module.action')`.
- **Enum Mismatch**: Sesuaikan `content_platform` dan `content_type` di semua form UI agar valid dengan skema database.
- **Relasi Query**: Perbaiki query `campaigns/[id]/page.tsx` agar mengambil data via pivot `campaign_contents`.

## 3. P1: AI Content Generation
- **Context Builder**: Integrasikan data dari Brand Kit (tone, audience) sebagai System Prompt.
- **Service Abstraction**: `runAITask` di `src/lib/ai/service.ts` sebagai interface utama.
- **Validation**: Gunakan Zod untuk validasi output JSON dari AI sebelum disimpan.

## 4. P2: Auto Post & N8N Orchestration
- **Webhook Sec**: Endpoint `api/webhooks/n8n/publish` harus divalidasi dengan `N8N_WEBHOOK_SECRET`.
- **Idempotency**: Gunakan `calendar_event_id` untuk mencegah postingan ganda.
- **State Machine**: Implementasi status `scheduled` → `published` / `failed`.

## 5. P3: UI/UX & Layout
- **Pattern**: Gunakan layout `max-w-7xl` dengan `clay-surface` dan `clay-card` konsisten seperti halaman `assets`.
- **UX Features**: Search bar (debounce), filter dropdowns, view toggle (grid/list), dan bulk actions.

## 6. Constraints & Safety
- **P0**: Tenant isolation (RLS) adalah prioritas utama.
- **Security**: Tidak boleh ada token atau secret key di frontend/client-side.
- **No Hallucination**: AI dilarang mengarang harga, diskon, atau data faktual.
- **Performance**: Gunakan `Server Components` secara default.
