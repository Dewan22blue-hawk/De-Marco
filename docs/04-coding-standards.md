# Coding Standards & Development Workflow ("The Vibes")

Dokumen ini berisi panduan koding (*skill & boilerplate*) yang akan kita ikuti selama mengembangkan **Deraly AI** agar kodenya bersih, modular, dan *scalable*.

## 1. Domain-Driven Design (DDD) di Next.js
Karena ini aplikasi skala Enterprise, kita tidak akan menumpuk semua kodingan di folder `components/` secara acak. Kita akan menggunakan pendekatan *Feature-Sliced Design* atau modul per domain.

```text
src/
 ├── app/                  # Next.js App Router (Hanya untuk routing & layouting)
 ├── core/                 # Infrastruktur utama (api client, config, base ui components)
 │    ├── components/      # Shadcn UI base components (Button, Input, Card)
 │    ├── lib/             # Supabase client, utilitas (cn, utils)
 │    └── store/           # Global Zustand store (misal: AuthStore)
 └── features/             # Modul domain (Business Logic)
      ├── marketing/
      ├── business-dev/
      ├── document-gen/
      └── ai-studio/
           ├── components/ # Komponen spesifik fitur AI Studio
           ├── hooks/      # Custom hooks fitur ini
           ├── services/   # Data fetching / Supabase calls
           └── types/      # Tipe data lokal
```

## 2. Standar Penulisan Komponen React
- Selalu gunakan **Server Components** sebagai *default* di Next.js App Router.
- Gunakan `'use client'` HANYA pada komponen yang membutuhkan *state* (useState, useEffect), *event listener* (onClick), atau akses browser API.
- Ekstrak *business logic* ke dalam *Custom Hooks*.

**Contoh Struktur Komponen:**
```tsx
import { useAIGenerator } from '@/features/ai-studio/hooks/useAIGenerator';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';

// Presentation Component (Stateless/Dumb)
export const GeneratorView = ({ onGenerate, isGenerating }) => (
  <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
     <Button onClick={onGenerate} disabled={isGenerating}>Generate</Button>
  </Card>
);

// Container Component (Stateful/Smart)
export const GeneratorContainer = () => {
  const { generate, isLoading } = useAIGenerator();
  return <GeneratorView onGenerate={generate} isGenerating={isLoading} />;
};
```

## 3. Data Fetching (TanStack Query + Supabase)
Jangan memanggil API langsung di dalam useEffect. Gunakan TanStack Query untuk *caching*, *revalidation*, dan *state management* (loading/error).

```typescript
// features/marketing/services/getCampaigns.ts
import { supabase } from '@/core/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchCampaigns = async () => {
  const { data, error } = await supabase.from('campaigns').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns
  });
};
```

## 4. State Management (Zustand)
Gunakan Zustand untuk state yang bersifat *global* (misal: Auth, UI Sidebar Open/Close, Active Workspace). Jangan masukkan data dari database ke Zustand (gunakan TanStack Query untuk data DB).

## 5. UI & Styling (Tailwind + Shadcn)
- Gunakan fungsi `cn()` (Tailwind Merge) untuk menggabungkan class secara dinamis.
- Gunakan variabel CSS untuk warna agar mendukung *Dark Mode* di masa depan.
- *Claymorphism*: Buat utility class kustom di Tailwind untuk bayangan lembut.

## 6. Git & Branching Strategy
- `main` : Production-ready code.
- `staging` : Pre-production testing.
- `feat/nama-fitur` : Untuk membuat fitur baru.
- `fix/nama-bug` : Untuk memperbaiki bug.

## 7. AI Prompt Engineering (Di sisi Backend/Service)
Pisahkan *Prompt Templates* dari *Business Logic*. Buat file khusus untuk menyimpan struktur prompt, misalnya `src/features/ai-studio/prompts/proposal.prompt.ts`.
