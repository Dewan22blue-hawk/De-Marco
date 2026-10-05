# n8n Local Integration (Deraly Platform)

Panduan ini menjelaskan cara menjalankan n8n lokal dengan Docker dan
menghubungkannya ke Deraly Platform yang berjalan di host (`localhost:3000`).

## Arsitektur Integrasi

```
┌──────────────┐      GET  /api/webhooks/n8n/publish     ┌────────────────┐
│              │ ───────────────────────────────────────▶ │                │
│     n8n      │      (Bearer N8N_WEBHOOK_SECRET)         │  Deraly (Next) │
│  (container) │                                          │  localhost:3000│
│              │ ◀─────────────────────────────────────── │                │
└──────────────┘      POST /api/webhooks/n8n/publish     └────────────────┘
                       (update status -> published)             │
                                                                ▼
                                                     Supabase (content_calendar,
                                                     contents, audit_logs)
```

Catatan: Supabase lokal sudah berjalan terpisah (`supabase start`), jadi
container ini hanya berisi n8n. Deraly dan Supabase tetap dijalankan di host.

## 1. Prasyarat

- Docker + Docker Compose (`docker compose version`)
- Deraly dev server berjalan: `npm run dev` (di `http://localhost:3000`)
- Supabase lokal berjalan: `supabase start`

## 2. Variabel Environment

Nilai diambil dari `.env.local` di root proyek:

| Variable | Dipakai di | Deskripsi |
|----------|-----------|-----------|
| `N8N_WEBHOOK_SECRET` | Deraly + n8n | Token bearer untuk endpoint webhook |
| `N8N_BASIC_AUTH_PASSWORD` | n8n | Password login UI n8n (user: `admin`) |
| `DERALY_API_URL` | n8n | `http://host.docker.internal:3000` |

`DERALY_API_URL` dan `N8N_WEBHOOK_SECRET` diteruskan ke container agar node bisa
membacanya lewat `$env`. Pastikan `N8N_BLOCK_ENV_ACCESS_IN_NODE` bernilai
`"false"` (sudah diatur di `docker-compose.yml`).

## 3. Menjalankan n8n

```bash
docker compose up -d n8n
```

Akses UI: http://localhost:5678 (login `admin` / `N8N_BASIC_AUTH_PASSWORD`).

## 4. Mengimpor Workflow

1. Buka http://localhost:5678
2. **Workflows → Import from File**
3. Pilih `integrations/n8n/workflows/deraly-autopost-workflow.json`
4. Aktifkan workflow (toggle **Active**)

Alur workflow:

1. **Schedule Trigger** — cron `*/15 * * * *` (tiap 15 menit)
2. **Fetch Scheduled Content** — `GET /api/webhooks/n8n/publish`. Meng-claim post yang due dengan status `queued` (Atomic Queue).
3. **Split Into Items** — pecah array `data` menjadi item per jadwal
4. **Has Content?** — Filter post yang tidak memiliki konten (kosong)
5. **Switch By Platform** — Routing berdasarkan platform
6. **Update Status** — Callback ke `POST /api/webhooks/n8n/publish` untuk menandai hasil (berhasil `published` atau `failed`)

*Catatan: Node publikasi sosial media secara langsung belum diimplementasikan. Untuk tahap MVP ini, webhook hanya akan menandai status (Stub) dan menggunakan URL placeholder. Integrasi nyata dengan Graph API / Platform API lainnya adalah pada tahap berikutnya.*

## 5. Mekanisme Lease & Stub (Keamanan & Keandalan)

- **Lease Reclaim (10 Menit):** Ketika n8n meng-claim jadwal, status berubah dari `scheduled` menjadi `queued` dan mencatat `claimed_at`. Jika n8n crash atau gagal memberi POST balasan dalam 10 menit, jadwal tersebut bisa di-claim ulang (Reclaim) secara otomatis oleh cron atau diklaim manual melalui tombol UI, mencegah status *stuck*.
- **Mock Publish (Stub):** Untuk saat ini, integrasi n8n hanya bersifat *mock* / stub. POST dari n8n ke Deraly harus menyertakan `"is_mock": true` di payload agar Deraly memberikan penanda UI berupa badge **"MOCK"** berwarna kuning, menjaga kejujuran status publikasi sebelum API sosial media sungguhan siap.
- **Tahap Selanjutnya:** Publikasi ke platform sosial media nyata (menggunakan Facebook Graph API, dll.) akan dilakukan di **Tahap 5**.

## 6. Kontrak Webhook

### GET (n8n mengambil jadwal)

Request:

```
GET /api/webhooks/n8n/publish
Authorization: Bearer <N8N_WEBHOOK_SECRET>
```

Response `200`:

```json
{
  "data": [
    {
      "id": "<calendar_id>",
      "organization_id": "<org_id>",
      "platform": "instagram",
      "scheduled_at": "2026-10-04T02:00:00.000Z",
      "content": { "id": "<content_id>", "title": "...", "body": "...", "cta": "...", "hashtags": [] },
      "campaign": { "id": "<campaign_id>", "name": "..." }
    }
  ]
}
```

### POST (n8n melaporkan hasil publikasi)

Request:

```json
{
  "eventId": "<calendar_id>",
  "contentId": "<content_id>",
  "organizationId": "<org_id>",
  "status": "success",
  "publishedUrl": "https://instagram.com/p/...",
  "is_mock": true
}
```

Gunakan `"status": "failed"` beserta `"error_note"` untuk laporan gagal.
Endpoint akan mengubah status dan menulis `audit_logs`.

## 7. Verifikasi Cepat

```bash
# Tanpa token -> 401
curl -i http://localhost:3000/api/webhooks/n8n/publish

# Dengan token -> 200 { "data": [] }
curl -i -H "Authorization: Bearer $N8N_WEBHOOK_SECRET" \
  http://localhost:3000/api/webhooks/n8n/publish
```

## 8. Troubleshooting

- **Webhook balik ke /login**: middleware harus mengecualikan `/api/webhooks`
  dari redirect sesi (sudah ditangani di `src/middleware.ts`).
- **n8n tidak bisa akses host**: pastikan `extra_hosts` +
  `host.docker.internal` aktif, dan Deraly berjalan di host.
- **Node gagal baca `$env`**: set `N8N_BLOCK_ENV_ACCESS_IN_NODE="false"`.
- **Cek log**: `docker compose logs -f n8n`
