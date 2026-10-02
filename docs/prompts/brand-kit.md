# Prompt Pengembangan: Penyempurnaan Modul Brand Kit

> Prompt ini dirancang untuk memandu pengembangan dan penyempurnaan modul **Brand Kit** (`src/app/dashboard/settings/brand/`) agar selaras dengan skema database lengkap (`brands`, `brand_colors`, `brand_fonts`), terintegrasi dengan **Asset Library** untuk Logo & Custom Font, serta memberikan pengalaman pengelolaan identitas merek yang modern dan interaktif.

---

## 1. Konteks & Tujuan

Modul **Brand Kit** yang ada saat ini hanya mencakup beberapa input dasar (Nama, Tagline, Warna, dan Teks Font). Namun, beberapa fitur utama identitas merek belum terhubung atau belum tersedia:
1. **Brand Logo Picker / Uploader**: Belum ada UI untuk memilih logo dari *Asset Library* atau meng-upload logo baru yang akan mengisi `logo_asset_id` pada tabel `brands`.
2. **Tone of Voice & Messaging Rules**: Belum ada pengelolaan kata/frasa panduan (seperti `tone_of_voice`, `forbidden_words`, `preferred_cta`, dan `description`) untuk memandu pembuatan konten/desain AI.
3. **Typography Enhancement**: Pengaturan font belum mendukung integrasi file font kustom (`font_asset_id`) dari Asset Library atau penentuan `weights`.
4. **Desain & UX Claymorphism**: UI formulir dapat ditingkatkan dengan kartu interaktif, live brand preview, serta umpan balik visual saat melakukan sinkronisasi warna & font.

---

## 2. Referensi & Source of Truth

1. **Struktur File & Skema**:
   - `src/app/dashboard/settings/brand/page.tsx` — Server Component.
   - `src/app/dashboard/settings/brand/brand-kit-form.tsx` — Client Component Form.
   - `src/app/dashboard/settings/brand/actions.ts` — Server Actions (`getBrandKit`, `upsertBrandKit`, `uploadBrandLogo`).
   - `src/schemas/brand.ts` — Zod Validation Schema.
   - `docs/00-erd.md` Domain 2 (Brand) — Struktur tabel `brands`, `brand_colors`, dan `brand_fonts`.

2. **Aturan Keamanan & Arsitektur**:
   - RLS Multi-tenant Wajib via `organization_id`.
   - Menggunakan Server Actions untuk mutasi data & audit log.
   - Menggunakan ikon dari `lucide-react`.

---

## 3. Hasil Audit & Rincian Perbaikan Konkret

### 3.1. Integrasi Logo Brand (Asset Library)
- **Komponen Selector Logo**:
  - Tampilkan kartu preview Logo Brand di bagian atas `BrandKitForm`.
  - Jika logo sudah ada, tampilkan preview gambar (diambil dari `/api/storage/assets/[path]`) beserta tombol **Ganti Logo** dan **Hapus Logo**.
  - Jika belum ada logo, sediakan tombol **Pilih Logo dari Asset Library** (menggunakan `AssetPickerModal`) ATAU **Upload Direct**.
  - Menyimpan `logo_asset_id` pada record `brands`.

### 3.2. Pengelolaan Tone of Voice & Rules AI
- Tambahkan section **AI Brand Guidelines**:
  - **Tone of Voice**: Input Tag / Chip multi-value (misal: *Professional, Friendly, Energetic*).
  - **Forbidden Words**: Input Tag / Chip untuk kata-kata yang dihindari (misal: *Murahan, Diskon Gila-gilaan*).
  - **Preferred CTA**: Input teks untuk Call-to-Action standar (misal: *Beli Sekarang, Hubungi Kami*).
  - **Description / Elevator Pitch**: Textarea untuk gambaran umum brand.

### 3.3. Penyempurnaan Brand Colors (Color Palette Manager)
- **Preset Roles**: Pastikan role standar terstruktur (`primary`, `secondary`, `accent`, `neutral-light`, `neutral-dark`).
- **Copy Hex Code**: Tambahkan fitur sekali-klik untuk menyalin kode HEX.
- **Drag/Reorder & Live Preview**: Berikan pratinjau kombinasi warna secara live (misal: kartu simulasi banner kecil) agar pengguna tahu seperti apa tampilan warna brand mereka saat diterapkan.

### 3.4. Typography & Font Upload
- Dukung pemilihan Font Google populer atau Font kustom yang diunggah melalui Asset Library (tipe `font` / `.woff2`).
- Izinkan pemilihan variasi bobot font (`weights`: 400, 600, 700).

---

## 4. Requirement UI/UX

- **Live Brand Summary Card**: Sediakan panel preview samping (side preview) yang menampilkan ringkasan Brand Kit secara real-time (Logo, Swatch Warna, Font, dan Tone of Voice).
- **Claymorphism Card**: Bungkus setiap section (General, Logo, Colors, Typography, AI Rules) dalam kartu berdesain Claymorphism yang rapi.
- **Feedback State**: Indikator *Saving...*, Toast / Alert responsif untuk pesan sukses dan eror.

---

## 5. Definition of Done (Kriteria Keberhasilan)

- [ ] Pengguna dapat meng-upload atau memilih Logo Brand dari Asset Library (`logo_asset_id` tersimpan).
- [ ] Formulir mendukung pengeditan `tone_of_voice`, `forbidden_words`, dan `preferred_cta`.
- [ ] Manajemen warna brand bekerja mulus (tambah, hapus, ubah hex/role/nama) dan tersimpan ke `brand_colors`.
- [ ] Manajemen font bekerja mulus dan tersimpan ke `brand_fonts`.
- [ ] Mengaitkan perubahan dengan `createAuditLog`.
- [ ] Lolos verifikasi `npm run lint` dan `npx tsc --noEmit`.
