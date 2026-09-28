# Architecture & Tech Stack

## Arsitektur Utama
Aplikasi dibangun sebagai **AI-native modular platform** menggunakan pendekatan **Domain-Driven Design (DDD)** dan arsitektur berbasis layanan (*modular monolith* yang dapat berevolusi menjadi *microservices*).

## Teknologi Frontend
- **Framework**: Next.js 15 (App Router)
- **Library Utama**: React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Shadcn/UI (sebagai base component), Framer Motion (untuk animasi)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Editor & Desain**: TipTap Editor (Rich Text), Fabric.js / Konva.js (Visual Design Editor)

## Teknologi Backend
- **Framework**: NestJS (direkomendasikan untuk TypeScript full-stack) atau Laravel 12 (REST API + AI Orchestration)
- **Database**: PostgreSQL (via Supabase)
- **Cache & Queue**: Redis
- **Storage**: MinIO / S3 (atau Supabase Storage)
- **Background Jobs**: BullMQ (Node.js) atau Laravel Queue

## AI Layer & Engine
- **Multi-LLM Gateway**: Integrasi ke OpenAI, Gemini, DeepSeek, Claude.
- **Prompt Template Engine**: Mengelola sistem prompting secara dinamis.
- **RAG (Retrieval-Augmented Generation)**: Berbasis *knowledge* perusahaan (Brand Brain).
- **AI Workflow Orchestrator**: Mengatur *chain of thought* / pipeline (Analisis -> Strategy -> Copywriting -> Visual -> Export).
- **Output Guardrail**: Validasi format dan kualitas dokumen keluaran AI.

## Modul Domain (DDD)
1. Authentication & RBAC
2. Organization & Workspace
3. Brand Kit & Asset Library
4. Marketing Studio
5. Business Development
6. Corporate Document Generator
7. AI Image Studio
8. Campaign Manager
9. Prompt Library & Template Marketplace
10. Analytics & Audit Log
11. Storage & Knowledge Base

## AI Workflow Pipeline
Setiap permintaan AI akan melewati *pipeline* berikut:
1. Analisis intent pengguna.
2. Identifikasi domain (marketing, proposal, legal, visual).
3. Ambil konteks dari Brand Knowledge Base (RAG).
4. Bangun prompt terstruktur sesuai template.
5. Hasilkan konten teks dan/atau aset visual.
6. Lakukan validasi format dan kualitas.
7. Simpan ke riwayat serta sediakan fungsi *export* (DOCX, PDF, PPTX, PNG, SVG).
