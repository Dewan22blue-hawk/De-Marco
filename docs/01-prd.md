# 📘 PRODUCT REQUIREMENT DOCUMENT (PRD)

# DERALY MARKETING COMMUNICATION & BUSINESS DEVELOPMENT PLATFORM

**PT Deraly Innovation Digital**

---

## DOCUMENT STATUS

| Field              | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Product            | Deraly Marketing Communication & Business Development Platform |
| PRD Version        | **1.2 — Execution Ready**                                      |
| Product Owner      | PT Deraly Innovation Digital                                   |
| Product Lead       | Lead Product Architect                                         |
| Development Target | MVP v1                                                         |
| Development Agent  | Antigravity                                                    |
| AI                 | **Tidak digunakan pada MVP**                                   |
| Architecture       | AI-ready, AI-independent                                       |
| Primary Stack      | Next.js + TypeScript + Supabase                                |
| Database           | PostgreSQL                                                     |
| Deployment         | Vercel + Supabase                                              |
| UI                 | Modern Claymorphism                                            |
| MVP Focus          | Marketing + Creative Workspace                                 |
| Target MVP         | ±4 minggu                                                      |
| Product Stage      | Internal Deraly                                                |
| Future Stage       | Multi-tenant SaaS                                              |

---

# 1. EXECUTIVE SUMMARY

**Deraly Marketing Communication & Business Development Platform** adalah centralized workspace untuk membantu PT Deraly Innovation Digital mengelola aktivitas marketing communication dan business development dalam satu platform.

MVP tidak menggunakan Artificial Intelligence.

Produktivitas diperoleh melalui:

* Template Engine
* Content Management
* Asset Library
* Brand Kit
* Creative Studio
* Drag & Drop Design Editor
* Campaign Management
* Content Calendar
* Document Template Engine
* Rule-based workflow sederhana

Produk harus memungkinkan pengguna membuat:

### Marketing Content

* Social media content
* Promotional content
* Campaign content
* Announcement
* Event content

### Visual Marketing

* Flyer
* Poster
* Social media design
* Banner
* Promotional card
* Event poster

### Business Documents

* Surat penawaran
* Surat kerja sama
* Surat permohonan
* Proposal
* MoU draft
* Company profile

---

# 2. PRODUCT VISION

Membangun:

> **Marketing Communication & Business Development Operating System**

yang membantu tim Deraly mengubah:

```text
IDE
 ↓
CONTENT
 ↓
DESIGN
 ↓
CAMPAIGN
 ↓
BUSINESS
```

menjadi satu workflow digital.

---

# 3. CORE PRODUCT PHILOSOPHY

## Create Once. Reuse Everywhere.

User tidak harus membuat semuanya dari nol.

Platform menyediakan:

```text
Template
+
Content
+
Brand
+
Assets
+
Reusable Components
+
Workflow
```

yang dapat digunakan kembali.

---

# 4. PROBLEM STATEMENT

Saat ini aktivitas marketing dan business development berpotensi tersebar di:

* Canva
* Word
* Google Docs
* Excel
* Google Drive
* WhatsApp
* Email
* Folder lokal

Akibatnya:

1. Asset tercecer.
2. Template tidak terpusat.
3. Desain dimulai dari nol.
4. Brand consistency sulit dijaga.
5. Dokumen bisnis dibuat berulang.
6. Campaign tidak terhubung dengan content.
7. Content calendar terpisah.
8. Riwayat desain sulit dilacak.
9. Lead dan follow-up tidak terstruktur.

---

# 5. PRODUCT GOAL

MVP harus menyelesaikan lima masalah utama:

### G1 — Centralized Assets

Semua asset marketing berada dalam satu Asset Library.

### G2 — Reusable Templates

Desain tidak dimulai dari canvas kosong.

### G3 — Fast Visual Production

User dapat membuat flyer/poster melalui:

```text
Template
→ Form
→ Asset
→ Canvas
→ Export
```

### G4 — Marketing Workflow

Content, campaign dan calendar saling terhubung.

### G5 — Business Documents

Dokumen bisnis dapat dibuat menggunakan template terstruktur.

---

# 6. NON-GOALS MVP

MVP **tidak** mencakup:

* AI content generation
* AI image generation
* AI copywriting
* AI design assistant
* AI document generation
* Social media auto publishing
* WhatsApp Business API
* Email transactional API
* Advanced CRM
* Advanced opportunity pipeline
* Billing SaaS
* Marketplace
* Advanced analytics
* Real-time multiplayer design editing

Fitur tersebut masuk future roadmap.

---

# 7. TARGET USER

## Primary MVP

### Super Admin

Mengelola:

* user
* role
* system
* organization

### Admin

Mengelola:

* brand
* template
* asset
* user

### Marketing

Mengelola:

* content
* campaign
* calendar
* design

### Designer

Mengelola:

* template
* asset
* visual design

### Business Development

Mengelola:

* basic lead
* follow-up
* proposal

### Reviewer / Manager

Mengelola:

* review
* approval

### Viewer

Read-only.

---

# 8. MVP PRODUCT MODULE

```text
Dashboard
│
├── Marketing
│   ├── Content
│   ├── Campaign
│   └── Content Calendar
│
├── Creative Studio
│   ├── Flyer Builder
│   ├── Poster Builder
│   ├── Social Media Design
│   ├── Templates
│   ├── Assets
│   └── My Designs
│
├── Documents
│   ├── Generator
│   ├── Templates
│   └── Generated Documents
│
├── Business Development
│   ├── Leads
│   └── Follow Up
│
├── Brand Kit
│
└── Settings
```

---

# 9. MVP PRIORITY

## P0 — CORE

| Feature            | Priority |
| ------------------ | -------- |
| Authentication     | P0       |
| RBAC               | P0       |
| Dashboard          | P0       |
| Brand Kit          | P0       |
| Asset Library      | P0       |
| Template Library   | P0       |
| Template Engine    | P0       |
| Creative Studio    | P0       |
| Flyer Builder      | P0       |
| Poster Builder     | P0       |
| Drag & Drop Canvas | P0       |
| Design Elements    | P0       |
| Content Management | P0       |
| Campaign           | P0       |
| Content Calendar   | P0       |
| Export             | P0       |

## P1

| Feature            | Priority |
| ------------------ | -------- |
| Document Generator | P1       |
| Proposal           | P1       |
| MoU                | P1       |
| Approval           | P1       |
| Version Control    | P1       |
| Lead Management    | P1       |
| Follow Up          | P1       |

## P2

* Opportunity Pipeline
* Analytics
* Advanced Automation
* Team Collaboration
* WhatsApp API
* Email API

## P3

* Multi-tenant SaaS
* Template Marketplace
* AI Layer

---

# 10. CORE USER JOURNEY

## Marketing Design

```text
Login
 ↓
Dashboard
 ↓
Creative Studio
 ↓
Create Design
 ↓
Select Format
 ↓
Select Template
 ↓
Fill Content
 ↓
Select Asset
 ↓
Generate from Template
 ↓
Open Canvas
 ↓
Drag / Drop / Edit
 ↓
Save
 ↓
Preview
 ↓
Export
```

---

# 11. FLYER / POSTER BUILDER

## Purpose

Memungkinkan user membuat visual marketing tanpa memulai dari canvas kosong.

## Supported formats

### Social

* Instagram Post — 1080×1080
* Instagram Story — 1080×1920
* Facebook Post — 1200×630
* LinkedIn Post — 1200×627
* WhatsApp — 1080×1080

### Print

* A4
* A5
* A3

### Custom

User dapat menentukan:

```text
Width
Height
Unit
```

---

# 12. CREATIVE STUDIO

Layout:

```text
┌──────────────────────────────────────────────────────┐
│ Deraly Creative Studio          Save | Preview | Export│
├───────────────┬──────────────────────┬───────────────┤
│               │                      │               │
│ TOOL PANEL    │       CANVAS         │ PROPERTIES    │
│               │                      │               │
│ Templates     │                      │ Position      │
│ Assets        │      DESIGN         │ Size          │
│ Text          │      CANVAS         │ Typography    │
│ Images        │                      │ Color         │
│ Icons         │                      │ Effects       │
│ Shapes        │                      │ Layer         │
│ Brand         │                      │               │
│               │                      │               │
└───────────────┴──────────────────────┴───────────────┘
```

---

# 13. CANVAS ENGINE

Canvas harus mendukung:

* selection
* drag
* drop
* resize
* rotate
* duplicate
* delete
* lock
* hide
* alignment
* snapping
* layer ordering

---

# 14. DESIGN ELEMENT TYPES

Minimal:

```text
text
image
logo
icon
shape
line
button
badge
qr
group
```

Setiap element memiliki:

```text
id
type
x
y
width
height
rotation
opacity
zIndex
visible
locked
```

---

# 15. DESIGN OBJECT MODEL

Desain tidak boleh disimpan hanya sebagai PNG/JPG.

Desain harus disimpan sebagai structured JSON.

Contoh:

```json
{
  "designId": "DSN-001",
  "name": "Promo Website UMKM",
  "format": {
    "width": 1080,
    "height": 1080
  },
  "background": {
    "type": "color",
    "value": "#FFFFFF"
  },
  "elements": [
    {
      "id": "EL-001",
      "type": "text",
      "role": "headline",
      "content": "Website Profesional untuk UMKM",
      "x": 80,
      "y": 140,
      "width": 850,
      "height": 120,
      "fontFamily": "Inter",
      "fontSize": 64,
      "fontWeight": 700,
      "color": "#111827"
    },
    {
      "id": "EL-002",
      "type": "image",
      "role": "hero",
      "assetId": "AST-001",
      "x": 80,
      "y": 350,
      "width": 920,
      "height": 400
    }
  ]
}
```

---

# 16. TEMPLATE SYSTEM

Template adalah blueprint.

Template tidak boleh berubah ketika user mengedit design.

Workflow:

```text
Template
 ↓
Clone
 ↓
Design Instance
 ↓
User Edit
 ↓
Save Design
```

---

# 17. TEMPLATE STRUCTURE

```json
{
  "templateId": "TPL-001",
  "name": "Corporate Promotion",
  "type": "flyer",
  "format": {
    "width": 1080,
    "height": 1080
  },
  "variables": [
    "title",
    "subtitle",
    "description",
    "cta"
  ],
  "elements": []
}
```

---

# 18. TEMPLATE VARIABLES

Supported variables:

```text
{{company_name}}
{{title}}
{{subtitle}}
{{description}}
{{cta}}
{{phone}}
{{email}}
{{website}}
{{address}}
{{date}}
{{time}}
{{price}}
{{discount}}
```

Form generator membaca variable dari template.

---

# 19. TEMPLATE CATEGORY

Minimal:

```text
Corporate
Technology
Promotion
Event
Education
Government
UMKM
Food
Retail
Startup
Healthcare
Minimal
Modern
```

---

# 20. ASSET LIBRARY

Asset Library adalah centralized repository.

Kategori:

```text
Logo
Background
Product
Photo
Icon
Illustration
Pattern
Partner
Certificate
Marketing
```

Metadata:

```text
id
name
category
tags
file_url
mime_type
file_size
width
height
organization_id
created_by
created_at
updated_at
```

---

# 21. ASSET OPERATIONS

User dapat:

```text
Upload
Preview
Search
Filter
Tag
Rename
Replace
Delete
Download
Drag to Canvas
```

---

# 22. ASSET DRAG & DROP

Workflow:

```text
Asset Library
       ↓
Drag
       ↓
Canvas
       ↓
Drop
       ↓
Create Design Element
```

Jika asset merupakan image:

```text
type = image
assetId = selected asset
```

---

# 23. BRAND KIT

Brand Kit:

```text
Logo
Primary Color
Secondary Color
Accent Color
Font
Heading Font
Body Font
Icon Style
```

Brand Kit digunakan oleh:

* templates
* creative studio
* content
* documents

---

# 24. CONTENT MANAGEMENT

Content fields:

```text
id
title
body
platform
content_type
campaign_id
status
scheduled_at
created_by
```

Content status:

```text
Draft
Review
Approved
Published
Archived
```

---

# 25. CAMPAIGN MANAGEMENT

Campaign fields:

```text
name
objective
description
target_audience
start_date
end_date
status
```

Campaign dapat memiliki:

```text
Contents
Designs
Assets
Documents
Calendar Items
```

Relationship:

```text
Campaign
 ├── Content
 ├── Design
 ├── Asset
 └── Calendar
```

---

# 26. CONTENT CALENDAR

Calendar harus mendukung:

* month view
* week view
* list view

Content dapat dipindahkan melalui drag & drop.

Status visual:

```text
Draft
Review
Approved
Published
```

---

# 27. DOCUMENT ENGINE

Document Engine **dipisahkan dari Creative Engine**.

## Creative Engine

Untuk:

```text
Flyer
Poster
Social Media
Banner
```

## Document Engine

Untuk:

```text
Letter
Proposal
MoU
Company Profile
Business Document
```

---

# 28. DOCUMENT TEMPLATE

Template menggunakan variable:

```text
{{document_number}}
{{date}}
{{company_name}}
{{client_name}}
{{project_name}}
{{scope}}
{{price}}
{{duration}}
{{contact}}
```

---

# 29. DOCUMENT MVP

Minimal:

* Surat Penawaran
* Surat Kerja Sama
* Surat Permohonan
* Surat Undangan
* Proposal
* MoU Draft
* Company Profile

Output:

```text
PDF
DOCX
```

---

# 30. DOCUMENT WORKFLOW

```text
Select Template
 ↓
Fill Form
 ↓
Preview
 ↓
Edit
 ↓
Save
 ↓
Export
```

---

# 31. BASIC BUSINESS DEVELOPMENT

MVP hanya menyediakan CRM ringan.

Lead fields:

```text
name
company
email
phone
source
status
owner
notes
```

Status:

```text
New
Contacted
Qualified
Proposal
Won
Lost
```

---

# 32. FOLLOW-UP

Follow-up:

```text
lead_id
title
notes
due_date
status
assigned_to
```

Status:

```text
Pending
Completed
Cancelled
```

---

# 33. WHATSAPP

MVP **bukan WhatsApp API**.

Gunakan:

```text
https://wa.me/{phone}?text={encoded_message}
```

Fungsi:

> membuka WhatsApp dengan pesan yang telah dipersiapkan.

---

# 34. EMAIL

MVP menggunakan:

```text
mailto:
```

User dapat:

```text
To
Subject
Body
```

Future:

```text
SMTP
Resend
SendGrid
```

---

# 35. APPROVAL WORKFLOW

Jika P1 diaktifkan:

```text
Draft
 ↓
Submitted
 ↓
Review
 ↓
Revision
 ↓
Approved
 ↓
Published
```

Role:

```text
Creator
Reviewer
Approver
```

---

# 36. VERSION CONTROL

Design version:

```text
v1
v2
v3
```

Document version:

```text
v1
v2
v3
```

Operations:

```text
Create Version
Restore
Duplicate
Compare
```

---

# 37. DESIGN ENGINE ARCHITECTURE

```text
Creative Studio
      │
      ↓
Design Editor
      │
 ┌────┼─────────┐
 ↓    ↓         ↓
Text Image     Shape
 ↓    ↓         ↓
      ↓
Design State
      ↓
Persistence
      ↓
Export Renderer
```

---

# 38. RENDERING STRATEGY

Pisahkan:

```text
Editor State
```

dari:

```text
Export Renderer
```

Canvas editor tidak boleh menjadi satu-satunya sumber rendering.

Tujuan:

* preview konsisten
* export stabil
* maintainability
* future format support

---

# 39. FRONTEND ARCHITECTURE

Gunakan feature-based architecture:

```text
src/
├── app/
├── components/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── marketing/
│   ├── creative/
│   ├── documents/
│   ├── leads/
│   ├── campaigns/
│   └── brand/
├── editor/
│   ├── canvas/
│   ├── elements/
│   ├── toolbar/
│   ├── layers/
│   └── properties/
├── services/
├── hooks/
├── schemas/
├── types/
├── lib/
└── utils/
```

---

# 40. TECH STACK

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## UI

```text
shadcn/ui
custom Claymorphism Design System
```

## Database

```text
PostgreSQL
Supabase
```

## Authentication

```text
Supabase Auth
```

## Storage

```text
Supabase Storage
```

## Validation

```text
Zod
```

## ORM

Pilih salah satu:

```text
Prisma
```

atau:

```text
Drizzle
```

**Jangan menggunakan keduanya sekaligus.**

Untuk MVP, pilih satu dan konsisten.

---

# 41. DATABASE ARCHITECTURE

Core tables:

```text
organizations

users
roles
permissions
user_roles

brands
brand_colors
brand_fonts
brand_assets

assets
asset_categories
asset_tags
asset_tag_relations

templates
template_variables
template_elements

designs
design_elements
design_versions

contents
campaigns
campaign_contents
content_calendar

documents
document_templates
document_versions

leads
follow_ups

notifications
audit_logs
```

---

# 42. DESIGN DATABASE RELATIONSHIP

```text
Template
   │
   ├── Template Variables
   │
   └── Template Elements
             │
             ↓
          Design
             │
             ├── Design Elements
             │
             └── Design Versions
                       │
                       ↓
                    Assets
```

---

# 43. MULTI-TENANCY

MVP:

```text
organization = PT Deraly Innovation Digital
```

Database tetap disiapkan:

```text
organization_id
```

Future SaaS:

```text
Organization A
Organization B
Organization C
```

Setiap tenant harus terisolasi.

Gunakan Supabase RLS.

---

# 44. SECURITY

Minimal:

### Authentication

Supabase Auth.

### Authorization

RBAC.

### Database

RLS.

### Input

Zod validation.

### File

* MIME validation
* size limit
* extension validation
* filename sanitization

### API

* authentication
* authorization
* rate limiting
* consistent error handling

### Secrets

Tidak boleh ada:

```text
API key
password
secret
```

di source code.

---

# 45. AUDIT LOG

Catat aktivitas penting:

```text
user_id
organization_id
action
entity
entity_id
metadata
timestamp
ip_address
```

Contoh:

```text
DESIGN_CREATED
ASSET_UPLOADED
TEMPLATE_UPDATED
DOCUMENT_EXPORTED
LEAD_CREATED
```

---

# 46. UI DESIGN SYSTEM

## Style

> Modern Claymorphism

Karakter:

* soft 3D
* rounded
* tactile
* clean
* professional
* premium SaaS

Hindari:

* excessive neumorphism
* excessive gradient
* childish UI
* low contrast
* excessive shadow

---

# 47. DESIGN TOKENS

### Colors

```text
Background: #F9FAFB
Surface: #FFFFFF
Primary: #3B82F6
Secondary: #06B6D4
Accent: #FBBF24
Success: #10B981
Danger: #EF4444
Text: #111827
Muted: #6B7280
Border: #E5E7EB
```

### Typography

```text
Heading:
Plus Jakarta Sans

Body:
Inter
```

### Radius

```text
12
16
20
24
32
```

Clay effects harus digunakan secara selektif.

---

# 48. RESPONSIVE DESIGN

Application harus mendukung:

### Desktop

Full Creative Studio.

### Tablet

Adaptive workspace.

### Mobile

Mobile tidak harus menyediakan full canvas editing pada MVP.

Mobile difokuskan pada:

* dashboard
* content
* campaign
* asset browsing
* approval
* preview

**Desktop menjadi primary environment untuk Creative Studio.**

---

# 49. ACCESSIBILITY

Minimum:

* keyboard navigation
* focus states
* semantic HTML
* contrast
* accessible labels
* error messages
* reduced motion consideration

---

# 50. API ARCHITECTURE

### Assets

```text
GET    /api/assets
POST   /api/assets
PATCH  /api/assets/:id
DELETE /api/assets/:id
```

### Templates

```text
GET  /api/templates
POST /api/templates
GET  /api/templates/:id
PATCH /api/templates/:id
```

### Designs

```text
GET   /api/designs
POST  /api/designs
GET   /api/designs/:id
PATCH /api/designs/:id
DELETE /api/designs/:id
POST  /api/designs/:id/duplicate
POST  /api/designs/:id/export
```

### Content

```text
GET   /api/contents
POST  /api/contents
PATCH /api/contents/:id
DELETE /api/contents/:id
```

### Campaign

```text
GET   /api/campaigns
POST  /api/campaigns
PATCH /api/campaigns/:id
```

### Documents

```text
GET  /api/documents
POST /api/documents
GET  /api/documents/:id
POST /api/documents/:id/export
```

### Leads

```text
GET   /api/leads
POST  /api/leads
PATCH /api/leads/:id
```

---

# 51. API RESPONSE STANDARD

Gunakan format konsisten:

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": {}
  }
}
```

---

# 52. ERROR HANDLING

Error harus dikategorikan:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
UPLOAD_ERROR
EXPORT_ERROR
INTERNAL_ERROR
```

---

# 53. ACCEPTANCE CRITERIA — CREATIVE STUDIO

Feature dianggap berhasil jika:

### Template

* User dapat memilih template.
* Template tidak berubah ketika design diedit.
* Template dapat digunakan berkali-kali.

### Content

* User dapat memasukkan title.
* User dapat memasukkan description.
* User dapat memasukkan CTA.
* Variable template terisi dengan benar.

### Asset

* User dapat upload asset.
* User dapat mencari asset.
* User dapat drag asset ke canvas.
* Asset dapat diganti.

### Canvas

* User dapat memilih element.
* User dapat drag element.
* User dapat resize.
* User dapat rotate.
* User dapat delete.
* User dapat duplicate.
* User dapat reorder layer.
* User dapat edit text.

### Persistence

* Design dapat disimpan.
* Design dapat dibuka kembali.
* Design tetap memiliki element structure.

### Export

* Design dapat diexport.
* Export mempertahankan ukuran canvas.
* Export tidak kehilangan element.

---

# 54. ACCEPTANCE CRITERIA — DOCUMENT GENERATOR

User dapat:

1. Memilih document template.
2. Mengisi form.
3. Melihat preview.
4. Mengedit data.
5. Menyimpan document.
6. Export PDF.
7. Export DOCX.

---

# 55. ACCEPTANCE CRITERIA — ASSET LIBRARY

User dapat:

1. Upload.
2. Search.
3. Filter.
4. Preview.
5. Tag.
6. Rename.
7. Delete.
8. Drag ke canvas.

---

# 56. ACCEPTANCE CRITERIA — CAMPAIGN

User dapat:

1. Membuat campaign.
2. Menghubungkan content.
3. Menghubungkan design.
4. Mengatur periode.
5. Melihat content calendar.
6. Melihat status campaign.

---

# 57. TESTING STRATEGY

## Unit Test

Test:

* variable replacement
* design state
* template parser
* permission
* validation

## Integration Test

Test:

* upload → storage → database
* template → design
* design → export
* content → campaign
* campaign → calendar

## E2E

Test:

```text
Login
→ Create Design
→ Template
→ Content
→ Asset
→ Canvas
→ Save
→ Export
```

---

# 58. PERFORMANCE TARGET

Target MVP:

### Dashboard

Target load:

```text
< 2.5s
```

### Asset Library

Pagination:

```text
20–50 items/page
```

### Canvas

Target:

```text
Smooth interaction for normal designs
≤ 50 elements
```

Advanced optimization dilakukan setelah MVP.

---

# 59. MVP ROADMAP — 4 WEEKS

## WEEK 1 — FOUNDATION

```text
Project setup
Supabase
Auth
RBAC
Database
Storage
Dashboard
Brand Kit
```

## WEEK 2 — ASSET + TEMPLATE

```text
Asset Library
Upload
Search
Tag
Template Library
Template Schema
Template Variable Engine
```

## WEEK 3 — CREATIVE STUDIO

```text
Canvas
Text
Image
Shape
Logo
Drag & Drop
Resize
Rotate
Layers
Properties
Save Design
```

## WEEK 4 — MARKETING WORKFLOW

```text
Content
Campaign
Calendar
Document Generator
Export
Basic Leads
Testing
Polish
Deployment
```

---

# 60. WHAT ANTIGRAVITY MUST NOT DO

Antigravity **tidak boleh**:

1. Membuat AI integration.
2. Membuat chatbot.
3. Membuat image generation.
4. Membuat fake API.
5. Membuat mock backend yang tidak persistent.
6. Menyimpan data utama hanya di localStorage.
7. Hardcode data production.
8. Membuat satu giant React component.
9. Mencampurkan Creative Engine dengan Document Engine.
10. Mengimplementasikan semua future roadmap sekaligus.
11. Membuat CRM kompleks sebelum Creative Studio stabil.
12. Menggunakan Prisma dan Drizzle sekaligus.

---

# 61. ANTIGRAVITY DEVELOPMENT PRINCIPLE

Antigravity harus mengikuti:

```text
Requirement
 ↓
Architecture
 ↓
Database
 ↓
API
 ↓
UI
 ↓
Integration
 ↓
Testing
 ↓
Refactoring
```

Jangan:

```text
UI
 ↓
Hardcode
 ↓
Mock
 ↓
Finish
```

---

# 62. IMPLEMENTATION RULE

Sebelum membuat kode:

1. Inspect project.
2. Inspect existing files.
3. Detect current stack.
4. Detect existing dependencies.
5. Do not overwrite working implementation blindly.
6. Create implementation plan.
7. Implement incrementally.
8. Run type checking.
9. Run lint.
10. Run tests.
11. Fix errors.
12. Verify UX.
13. Document changes.

---

# 63. DEFINITION OF DONE

Feature hanya dianggap selesai jika:

```text
Requirement implemented
        ↓
TypeScript valid
        ↓
Lint valid
        ↓
Database migration valid
        ↓
API tested
        ↓
UI tested
        ↓
Error handling implemented
        ↓
Responsive checked
        ↓
Security checked
        ↓
Acceptance criteria passed
```

---

# 64. SOURCE OF TRUTH

Dokumen berikut harus menjadi source of truth:

```text
PRD
 ↓
Database Schema
 ↓
API Contract
 ↓
Design System
 ↓
Implementation
```

Jika ada konflik:

> PRD harus dikonsultasikan sebelum membuat perubahan arsitektur.

---

# 65. FUTURE ROADMAP

## Phase 2

```text
Approval Workflow
Version Control
Advanced Design Tools
Analytics
```

## Phase 3

```text
Advanced CRM
Opportunity Pipeline
Proposal Management
Automation
```

## Phase 4

```text
Multi-tenant SaaS
Client Portal
Template Marketplace
Subscription
```

## Phase 5

```text
AI Content
AI Copywriting
AI Design Assistant
AI Image
AI Document
AI Analytics
```

---

# 66. FUTURE AI ARCHITECTURE

AI tidak boleh menjadi dependency core.

Arsitektur:

```text
                    CORE PLATFORM
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   Marketing         Creative          Documents
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                 OPTIONAL AI LAYER
                         │
              ┌──────────┼──────────┐
              ↓          ↓          ↓
           Content     Design     Document
```

Core platform harus tetap berfungsi tanpa AI.

---

# 67. SUCCESS METRICS

MVP:

### Adoption

```text
Internal active users ≥ 80%
```

### Creative

```text
Average flyer creation time ≤ 10 minutes
```

### Asset

```text
≥ 90% new marketing assets stored in Asset Library
```

### Template

```text
≥ 70% marketing designs start from templates
```

### Productivity

```text
Proposal preparation time reduced
```

### Reliability

```text
Critical workflow success rate ≥ 95%
```

---

# 68. KEY PRODUCT METRIC

North Star Metric:

> **Number of completed marketing assets produced through Deraly Platform per week.**

Supporting metrics:

```text
Designs Created
Templates Used
Assets Reused
Campaigns Created
Documents Generated
Export Count
Active Users
```

---

# 69. RISKS

## Risk 1 — Scope terlalu besar

Mitigation:

> Creative-first MVP.

## Risk 2 — Canvas terlalu kompleks

Mitigation:

> limited element types pada MVP.

## Risk 3 — Export tidak konsisten

Mitigation:

> separate rendering/export engine.

## Risk 4 — Asset storage membengkak

Mitigation:

> file size limit + metadata + storage policy.

## Risk 5 — Multi-tenant terlalu cepat

Mitigation:

> tenant-ready schema, single tenant deployment.

## Risk 6 — Claymorphism mengganggu usability

Mitigation:

> gunakan clay sebagai visual language, bukan sebagai dekorasi berlebihan.

---

# 70. PRODUCT POSITIONING

## Primary

> **Marketing Communication & Business Development Platform**

## Supporting

> **One Workspace for Content, Design, Campaign & Business Documents.**

---

# 71. TAGLINE

Primary:

> **Create. Manage. Grow.**

Alternative:

> **From Content to Campaign.**

Alternative:

> **Your Ideas. Your Assets. Your Brand.**

Alternative:

> **Satu Workspace untuk Semua Kebutuhan Marketing.**

---

# 72. FINAL PRODUCT DEFINITION

Deraly Marketing Communication & Business Development Platform adalah:

> **centralized marketing workspace yang menghubungkan Content Management, Creative Studio, Asset Library, Template Engine, Campaign Management, Content Calendar, Document Generator, dan basic Business Development dalam satu platform.**

Core MVP:

```text
CONTENT
   +
TEMPLATE
   +
ASSET
   +
DESIGN
   +
CAMPAIGN
   +
DOCUMENT
```

Tanpa AI.

---

# 73. FINAL ARCHITECTURE

```text
                         DERALY PLATFORM
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
         MARKETING          CREATIVE         DOCUMENT
             │                 │                 │
       ┌─────┼─────┐      ┌────┼────┐       ┌────┼────┐
       │     │     │      │    │    │       │    │    │
    Content Campaign Calendar Template Asset Letter Proposal
                         │
                         ↓
                  DESIGN ENGINE
                         │
                 ┌───────┼───────┐
                 ↓       ↓       ↓
               Text    Image   Shape
                 │       │       │
                 └───────┼───────┘
                         ↓
                    CANVAS EDITOR
                         │
                   Drag & Drop
                         │
                         ↓
                      DESIGN
                         │
                         ↓
                       EXPORT
                         │
                         ↓
                    CAMPAIGN
```

---

# 74. ANTIGRAVITY EXECUTION ORDER

Antigravity harus mengimplementasikan dalam urutan berikut:

```text
PHASE 01
Project Foundation

PHASE 02
Database + Authentication

PHASE 03
Brand Kit

PHASE 04
Asset Library

PHASE 05
Template Engine

PHASE 06
Creative Studio

PHASE 07
Design Object Model

PHASE 08
Canvas Editor

PHASE 09
Content Management

PHASE 10
Campaign

PHASE 11
Content Calendar

PHASE 12
Document Engine

PHASE 13
Basic Lead Management

PHASE 14
Testing

PHASE 15
Security Review

PHASE 16
Performance Review

PHASE 17
Deployment
```

---

# 75. FIRST DEVELOPMENT TASK

Jangan langsung membangun seluruh aplikasi.

Langkah pertama Antigravity:

### 1. Analyze Repository

Identifikasi:

```text
Framework
Version
Dependencies
Existing Components
Existing Routes
Existing Database
Environment
```

### 2. Create Architecture Plan

Buat:

```text
Folder Structure
Module Structure
Database Plan
API Plan
Component Plan
```

### 3. Create Database Schema

Implementasikan:

```text
Organizations
Users
Roles
Brands
Assets
Templates
Designs
Contents
Campaigns
Documents
Leads
```

### 4. Create Design System

Implementasikan:

```text
Clay Card
Clay Button
Clay Input
Clay Modal
Sidebar
Navbar
Dashboard Card
Asset Card
Template Card
```

### 5. Build Foundation

Kemudian lanjutkan ke:

```text
Authentication
Dashboard
Brand Kit
Asset Library
```

### 6. Build Creative Studio

Setelah foundation stabil:

```text
Template
Canvas
Elements
Drag & Drop
Properties
Layers
Save
Export
```

---

# 76. FINAL INSTRUCTION FOR ANTIGRAVITY

Kamu adalah:

> **Senior Fullstack Engineer + Software Architect + Product Engineer untuk PT Deraly Innovation Digital.**

Bangun aplikasi berdasarkan PRD ini.

Prioritaskan:

```text
Correctness
Maintainability
Security
Type Safety
Scalability
UX
Performance
```

Jangan mengejar jumlah fitur.

Prioritaskan:

> **working core workflow.**

Core workflow wajib berhasil:

```text
Login
 ↓
Dashboard
 ↓
Asset Library
 ↓
Template Library
 ↓
Create Flyer
 ↓
Fill Content
 ↓
Select Asset
 ↓
Open Canvas
 ↓
Drag & Drop
 ↓
Edit
 ↓
Save
 ↓
Export
```

Jika workflow tersebut belum stabil:

> jangan lanjut ke fitur advanced.

---

# 77. FINAL ACCEPTANCE TEST

MVP dinyatakan berhasil jika seorang user baru dapat:

```text
1. Login
2. Membuka Creative Studio
3. Memilih template flyer
4. Mengisi judul
5. Mengisi deskripsi
6. Memilih CTA
7. Memilih logo
8. Memilih gambar dari Asset Library
9. Generate design dari template
10. Membuka canvas
11. Drag image
12. Resize image
13. Mengubah text
14. Mengubah warna
15. Mengatur layer
16. Save design
17. Membuka kembali design
18. Export PNG/PDF
19. Membuat campaign
20. Menambahkan design ke campaign
```

Jika seluruh workflow ini berhasil:

> **MVP CORE dianggap functional.**

---

# 78. PRODUCT PRINCIPLE

> **Do not build an AI wrapper.**
>
> **Build the operational foundation first.**

Deraly harus memiliki:

```text
DATA
+
ASSET
+
TEMPLATE
+
DESIGN
+
CONTENT
+
CAMPAIGN
+
DOCUMENT
+
WORKFLOW
```

AI nantinya hanya menjadi:

> **acceleration layer.**

---

# END OF PRD v1.2

**Status: READY FOR TECHNICAL DESIGN & IMPLEMENTATION**

Next artifacts:

1. ERD PostgreSQL
2. Database migration specification
3. RLS policy specification
4. API Contract
5. Component Architecture
6. Creative Studio technical specification
7. Design Object Model specification
8. Wireframe / Sitemap
9. Antigravity implementation prompt
10. QA test specification

**© 2026 PT Deraly Innovation Digital**
