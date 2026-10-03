# Prompt Pengembangan: Creative Studio — Canvas Editor & Export PNG (Fase 2)

> Prompt ini memandu pengembangan lanjutan untuk **Creative Studio** (`/dashboard/designs/[id]`), mengubah placeholder "Canvas Editor coming soon" menjadi **Interactive Canvas Editor** yang lengkap dengan fitur Drag & Drop, Resize, Layer Ordering (z-index), Properties Panel, dan **Client-Side Export PNG**.

---

## 1. Konteks & Tujuan

Pada Fase 1, kita telah membangun:
- **Design Library** (`/dashboard/designs`)
- **Generate Design from Template** (`/dashboard/designs/new`)
- **Design Detail & Static Preview** (`/dashboard/designs/[id]`)

**Tujuan Fase 2 (Sesuai Plan & PRD §12-13, §38):**
1. Mengaktifkan **Interactive Canvas Editor** pada halaman detail desain.
2. Memungkinkan user melakukan manipulasi elemen secara real-time di canvas:
   - **Select & Click** elemen (Text, Shape, Image).
   - **Drag & Drop** (memindahkan posisi `x` dan `y`).
   - **Resize & Rotate** (mengatur `width`, `height`, dan `rotation`).
   - **Layers Panel** (mengatur urutan `z-index`, Hide/Show, Lock/Unlock).
   - **Properties Panel** (mengubah teks content, warna background, opacity, font size, dll.).
   - **Save Changes** (menyimpan kembali state elemen ke tabel `design_elements` via Server Action dan membuat versi baru di `design_versions`).
3. **Client-Side Export PNG**:
   - Menambahkan fungsionalitas tombol **Export** untuk mendownload desain aktif sebagai file PNG berkualitas tinggi menggunakan library helper atau HTML5 Canvas / `html-to-image`.

---

## 2. Referensi & Source of Truth

1. **Struktur File Target**:
   - `src/app/dashboard/designs/[id]/design-detail-client.tsx` → Dikembangkan menjadi Editor Workspace lengkap.
   - `src/app/dashboard/designs/[id]/canvas-editor.tsx` (Komponen baru untuk interactive canvas).
   - `src/app/dashboard/designs/[id]/layers-panel.tsx` (Panel manajemen layer & z-index).
   - `src/app/dashboard/designs/[id]/properties-panel.tsx` (Panel edit atribut elemen terpilih).
   - `src/app/dashboard/designs/actions.ts` → Tambah fungsi `updateDesignElements(designId, elements, snapshot)`.

2. **Dokumen PRD & ERD**:
   - `docs/01-prd.md` §12 Creative Studio Layout, §13 Canvas Engine, §38 Rendering Strategy.
   - `docs/00-erd.md` §24 `design_elements`.
   - `AGENTS.md` — P0 Security > P1 Architecture > P2 Quality.

---

## 3. Rincian Spesifikasi Fungsional

### 3.1. Layout Editor Workspace (3-Column Layout)
Sesuai PRD §12:
- **Left Panel / Toolbar**: Tombol tambah elemen baru (Text, Rectangle Shape, Image from Asset Library), list template variabel.
- **Center / Canvas Area**: Area kerja utama tempat desain dirender dengan skala zoom (fit-to-screen), interaktif (klik, drag, handle resize).
- **Right Panel (Tabs: Properties & Layers)**:
  - *Properties Tab*: Menampilkan koordinat `X, Y`, ukuran `Width, Height`, rotasi, opacity, teks content, warna, dan asset selector (jika elemen image/logo).
  - *Layers Tab*: List elemen terurut berdasarkan `z-index`. Tombol naikkan/turunkan layer, lock/unlock, hide/show.

### 3.2. Interaksi Canvas & State Management
- State lokal `elements` di client disinkronkan dengan prop `design.design_elements`.
- *Selected Element ID*: State untuk melacak elemen mana yang sedang diklik/aktif.
- *Drag Handler*: Pointer / Mouse event listener untuk menggeser elemen di dalam batas dimensi canvas (`width` x `height`).
- *Resize & Rotate Handle*: Handle visual di sudut elemen terpilih.
- *Auto-Save / Manual Save*: Tombol "Save Changes" di header yang memanggil Server Action `updateDesignElements` dan membuat entri snapshot di `design_versions`.

### 3.3. Client-Side Export PNG
- Gunakan library ringan seperti `html-to-image` (atau DOM-to-image / native Canvas rendering) untuk merender container canvas menjadi blob gambar PNG.
- Tombol **Export** di header memicu proses render → download otomatis file `{design-name}.png`.
- Opsional: Simpan preview hasil export ke `preview_asset_id` di tabel `designs` (melalui Asset Library uploader / metadata save).

---

## 4. Langkah Implementasi untuk Agent

1. **Install Dependencies (jika belum ada)**:
   - `npm install html-to-image` (untuk export client-side yang andal).
2. **Buat Komponen Canvas Editor**:
   - `src/app/dashboard/designs/[id]/canvas-editor.tsx`
   - `src/app/dashboard/designs/[id]/layers-panel.tsx`
   - `src/app/dashboard/designs/[id]/properties-panel.tsx`
3. **Update Server Actions**:
   - Tambah `updateDesignElements` di `src/app/dashboard/designs/actions.ts` untuk bulk upsert `design_elements` dan insert `design_versions`.
4. **Hubungkan di Detail View**:
   - Ganti placeholder "Canvas Editor coming soon" di `design-detail-client.tsx` dengan workspace editor interaktif atau modal editor penuh.

---

## 5. Definition of Done (Kriteria Keberhasilan)

- [ ] User dapat membuka editor desain dan melihat elemen-elemen dirender secara akurat sesuai posisi, ukuran, dan rotasi.
- [ ] User dapat memilih elemen, menggeser (drag & drop), mengubah properti teks/warna, dan mengatur urutan layer.
- [ ] Tombol "Save Changes" berhasil menyimpan state terbaru ke database dengan audit log dan versioning.
- [ ] Tombol "Export" berhasil mendownload file PNG berkualitas tinggi dari canvas aktif.
- [ ] Lolos `npm run lint` dan `npx tsc --noEmit`.
