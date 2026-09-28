# UI/UX & Design System

## Style / Vibe
**Claymorphism + Modern SaaS**
Nuansa desain harus terasa premium, modern, dan intuitif, memadukan gaya Apple, Linear, Notion, Arc Browser, dan Framer, namun dengan sentuhan khas *Clay UI* (efek timbul/soft 3D yang elegan).

## Color Palette
- **Primary**: `#4F46E5` (Indigo/Purple modern)
- **Secondary**: `#7C3AED` (Violet)
- **Accent**: `#06B6D4` (Cyan)
- **Background**: `#F5F7FB` (Light Grayish Blue)
- **Card**: `#FFFFFF` (White)

## Claymorphism Components
Base styling untuk card dan komponen utama:
- Soft Shadows (bayangan lembut yang menyebar).
- Rounded Corners (border-radius besar, `rounded-2xl` atau `rounded-3xl`).
- Floating Effect (elemen tampak mengambang di atas background).
- Blur / Frosted Glass pada elemen overlay.
- Pastel Gradient & Soft Borders.
- Interactive Hover (animasi halus saat di-hover menggunakan Framer Motion).

## Struktur Dashboard

### Header
- Logo Perusahaan
- Search Bar (Global AI Prompt / Cmd+K)
- Notification
- User Profile

### Sidebar
- 🏠 Dashboard
- 🤖 AI Studio
- 📢 Marketing
- 💼 Business Development
- 📄 Documents
- 🎨 Asset Studio
- 🖼 AI Image
- 📅 Campaign
- 📚 Template
- ⚙ Settings

## AI Studio UI (Konsep Panel Ganda)
Berbeda dengan ChatGPT biasa, AI Studio kita membagi layar menjadi dua:
1. **Left Panel (Chat/Prompt)**: Area untuk memberikan instruksi ke AI dan melihat proses generasi.
2. **Right Panel (Workspace/Output)**: Area dinamis yang akan menampilkan hasil *generate* (dokumen, gambar, desain) lengkap beserta tab pendukung (Assets, Images, Icons, History, Templates).
