# ERD v1.1 — DERALY MARKETING COMMUNICATION & BUSINESS DEVELOPMENT PLATFORM

**PT Deraly Innovation Digital**

| Item                 | Specification                      |
| -------------------- | ---------------------------------- |
| ERD Version          | **1.1 — Normalized & Build-Ready** |
| Product Baseline     | PRD v1.2                           |
| Database             | PostgreSQL 15+                     |
| Platform             | Supabase                           |
| Backend Architecture | Next.js Modular Monolith           |
| Tenant Model         | Multi-tenant ready                 |
| MVP Tenant           | PT Deraly Innovation Digital       |
| RLS                  | Mandatory                          |
| Primary Key          | UUID                               |
| Naming               | snake_case                         |
| Soft Delete          | Selective, not blindly applied     |
| Design Model         | Relational Core + JSONB Extension  |
| AI                   | **Not required for MVP**           |

---

# 1. STATUS ERD

ERD versi ini merupakan penyempurnaan dari ERD DeepSeek sebelumnya.

Prinsip utama:

```text
PRD v1.2
   ↓
Business Domain
   ↓
Normalized Data Model
   ↓
Relationship Integrity
   ↓
RLS / Tenant Isolation
   ↓
Migration Strategy
   ↓
Antigravity Implementation
```

ERD ini harus dianggap sebagai **database contract**.

Antigravity tidak boleh mengubah struktur inti tanpa alasan teknis yang terdokumentasi.

---

# 2. PERUBAHAN UTAMA DARI ERD SEBELUMNYA

## 2.1 Creative Studio dinaikkan menjadi MVP

ERD sebelumnya masih menganggap:

```text
Visual Editor → Phase 2
```

ERD baru:

```text
Creative Studio → MVP
Flyer Builder → MVP
Poster Builder → MVP
Drag & Drop Canvas → MVP
Design Object Model → MVP
```

---

# 3. PRINSIP NORMALISASI

Database menggunakan prinsip:

### 1NF

Tidak menyimpan repeating group sebagai kolom relational.

### 2NF

Entitas junction digunakan untuk hubungan many-to-many.

### 3NF

Data master tidak diduplikasi ke tabel transaksi tanpa kebutuhan yang jelas.

### JSONB

Digunakan hanya untuk data yang:

* bersifat extensible;
* tidak membutuhkan relational query utama;
* merupakan konfigurasi editor;
* merupakan metadata.

Contoh yang tepat:

```json
{
  "shadow": {
    "enabled": true,
    "blur": 20,
    "offset_x": 4,
    "offset_y": 4
  },
  "gradient": {
    "enabled": true,
    "type": "linear"
  }
}
```

Bukan:

```json
{
  "company_name": "...",
  "template_id": "...",
  "asset_id": "..."
}
```

Data relasional utama harus tetap memiliki foreign key.

---

# 4. DOMAIN ARCHITECTURE

```text
DERALY PLATFORM
│
├── IDENTITY & ACCESS
│
├── BRAND
│
├── ASSET MANAGEMENT
│
├── TEMPLATE ENGINE
│
├── CREATIVE STUDIO
│
├── MARKETING CONTENT
│
├── CAMPAIGN
│
├── CONTENT CALENDAR
│
├── DOCUMENT ENGINE
│
├── BUSINESS DEVELOPMENT
│
└── SYSTEM
```

---

# 5. DOMAIN 1 — IDENTITY & ACCESS

## 5.1 profiles

Relasi 1:1 dengan `auth.users`.

```sql
profiles
---------
id uuid PK
email text
full_name text
avatar_asset_id uuid NULL
phone text NULL
job_title text NULL
bio text NULL
locale text DEFAULT 'id-ID'
timezone text DEFAULT 'Asia/Jakarta'
default_organization_id uuid NULL
is_active boolean DEFAULT true
last_seen_at timestamptz NULL
metadata jsonb DEFAULT '{}'
created_at timestamptz
updated_at timestamptz
```

FK:

```text
profiles.id
    → auth.users.id

profiles.default_organization_id
    → organizations.id
```

---

# 6. organizations

Tenant root.

```sql
organizations
-------------
id uuid PK
name text NOT NULL
slug text NOT NULL UNIQUE
legal_name text NULL
industry text NULL
website text NULL
email text NULL
phone text NULL
address text NULL
city text NULL
province text NULL
postal_code text NULL
country_code text DEFAULT 'ID'
timezone text DEFAULT 'Asia/Jakarta'
locale text DEFAULT 'id-ID'
currency_code text DEFAULT 'IDR'
subscription_plan text DEFAULT 'internal'
is_active boolean DEFAULT true
metadata jsonb DEFAULT '{}'
created_at timestamptz
updated_at timestamptz
created_by uuid NULL
updated_by uuid NULL
deleted_at timestamptz NULL
```

---

# 7. roles

Role harus tenant-specific.

```sql
roles
-----
id uuid PK
organization_id uuid NOT NULL
name role_name NOT NULL
display_name text NOT NULL
description text NULL
is_system boolean DEFAULT false
created_at timestamptz
updated_at timestamptz
```

Unique:

```text
(organization_id, name)
```

---

# 8. permissions

Permission bersifat global.

```sql
permissions
-----------
id uuid PK
code text UNIQUE NOT NULL
name text NOT NULL
module text NOT NULL
description text NULL
created_at timestamptz
```

Contoh:

```text
asset.view
asset.create
asset.update
asset.delete

template.view
template.create
template.update
template.delete

design.create
design.update
design.delete

content.view
content.create
content.update
content.delete
```

---

# 9. role_permissions

```sql
role_permissions
----------------
role_id uuid NOT NULL
permission_id uuid NOT NULL
created_at timestamptz

PRIMARY KEY (role_id, permission_id)
```

Relasi:

```text
roles N:M permissions
```

---

# 10. organization_members

```sql
organization_members
--------------------
id uuid PK
organization_id uuid NOT NULL
user_id uuid NOT NULL
role_id uuid NOT NULL
status membership_status DEFAULT 'active'
invited_by uuid NULL
invited_at timestamptz NULL
joined_at timestamptz NULL
created_at timestamptz
updated_at timestamptz
```

Constraint:

```text
UNIQUE(organization_id, user_id)
```

Relasi:

```text
organization
    │
    └── N:M users
          via organization_members
```

---

# 11. DOMAIN 2 — BRAND

## 11.1 brands

```sql
brands
------
id uuid PK
organization_id uuid NOT NULL
name text NOT NULL
slug text NOT NULL
tagline text NULL
description text NULL
tone_of_voice text[] NULL
forbidden_words text[] NULL
preferred_cta text NULL

is_default boolean DEFAULT false
is_active boolean DEFAULT true

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz
created_by uuid NULL
updated_by uuid NULL
deleted_at timestamptz NULL
```

Unique:

```text
(organization_id, slug)
```

---

# 12. brand_colors

```sql
brand_colors
------------
id uuid PK
brand_id uuid NOT NULL
name text NOT NULL
hex_code text NOT NULL
role text NOT NULL
sort_order integer DEFAULT 0
created_at timestamptz
```

Unique:

```text
(brand_id, name)
```

---

# 13. brand_fonts

```sql
brand_fonts
-----------
id uuid PK
brand_id uuid NOT NULL
name text NOT NULL
role text NOT NULL
font_family text NOT NULL
font_asset_id uuid NULL
weights text[] NULL
is_active boolean DEFAULT true
created_at timestamptz
```

Unique:

```text
(brand_id, role)
```

Jika custom font digunakan, file font harus berasal dari Asset/Storage.

---

# 14. DOMAIN 3 — ASSET MANAGEMENT

## 14.1 asset_categories

```sql
asset_categories
----------------
id uuid PK
organization_id uuid NOT NULL
parent_id uuid NULL
name text NOT NULL
slug text NOT NULL
description text NULL
icon text NULL
sort_order integer DEFAULT 0
is_system boolean DEFAULT false
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz NULL
```

Self relationship:

```text
asset_categories
      │
      └── parent_id → asset_categories.id
```

---

# 15. assets

Asset adalah physical file yang dapat digunakan ulang.

```sql
assets
------
id uuid PK

organization_id uuid NOT NULL
category_id uuid NULL
brand_id uuid NULL

name text NOT NULL
description text NULL

asset_type asset_type NOT NULL

storage_bucket text NOT NULL
storage_path text NOT NULL

mime_type text NULL
file_size bigint NULL

width integer NULL
height integer NULL
duration_seconds integer NULL

alt_text text NULL

tags text[] NULL

metadata jsonb DEFAULT '{}'

is_public boolean DEFAULT false
is_system boolean DEFAULT false

created_at timestamptz
updated_at timestamptz
created_by uuid NULL
updated_by uuid NULL
deleted_at timestamptz NULL
```

### Catatan penting

Tidak menggunakan:

```text
file_url
```

sebagai source of truth.

Source of truth:

```text
storage_bucket
storage_path
```

URL dibuat oleh application/storage service.

---

# 16. DOMAIN 4 — TEMPLATE ENGINE

Template dibedakan secara tegas dari Design.

```text
TEMPLATE
   ↓
CLONE
   ↓
DESIGN INSTANCE
```

Template tidak boleh berubah ketika user mengedit Design.

---

# 17. template_categories

```sql
template_categories
-------------------
id uuid PK
organization_id uuid NOT NULL
parent_id uuid NULL
name text NOT NULL
slug text NOT NULL
template_type template_type NULL
description text NULL
icon text NULL
sort_order integer DEFAULT 0
is_system boolean DEFAULT false
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz NULL
```

---

# 18. templates

```sql
templates
---------
id uuid PK

organization_id uuid NOT NULL
category_id uuid NULL
brand_id uuid NULL

name text NOT NULL
code text NOT NULL
description text NULL

template_type template_type NOT NULL

format_code text NOT NULL

width integer NOT NULL
height integer NOT NULL
unit text DEFAULT 'px'

thumbnail_asset_id uuid NULL
background_asset_id uuid NULL

is_system boolean DEFAULT false
is_active boolean DEFAULT true

current_version integer DEFAULT 1

usage_count integer DEFAULT 0

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz
created_by uuid NULL
updated_by uuid NULL
deleted_at timestamptz NULL
```

Unique:

```text
(organization_id, code)
```

---

# 19. template_versions

Template version menyimpan snapshot struktur template.

```sql
template_versions
-----------------
id uuid PK
template_id uuid NOT NULL

version integer NOT NULL

change_note text NULL

schema_snapshot jsonb NOT NULL

created_at timestamptz
created_by uuid NULL
```

Unique:

```text
(template_id, version)
```

---

# 20. template_variables

Ini adalah perubahan penting.

Jangan menyimpan seluruh variables hanya sebagai JSONB.

```sql
template_variables
------------------
id uuid PK
template_id uuid NOT NULL

variable_key text NOT NULL
label text NOT NULL

variable_type template_variable_type NOT NULL

default_value text NULL
placeholder text NULL

is_required boolean DEFAULT false

max_length integer NULL
sort_order integer DEFAULT 0

validation_rules jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz
```

Contoh:

```text
title
subtitle
description
cta
phone
email
website
hero_image
logo
price
discount
```

Unique:

```text
(template_id, variable_key)
```

---

# 21. template_elements

Template element merupakan blueprint element.

```sql
template_elements
-----------------
id uuid PK

template_id uuid NOT NULL
parent_id uuid NULL

element_type design_element_type NOT NULL
role text NULL

variable_id uuid NULL
asset_id uuid NULL

x numeric NOT NULL
y numeric NOT NULL
width numeric NOT NULL
height numeric NOT NULL

rotation numeric DEFAULT 0
opacity numeric DEFAULT 1

z_index integer DEFAULT 0

visible boolean DEFAULT true
locked boolean DEFAULT false

content text NULL

style jsonb DEFAULT '{}'
metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz
```

Contoh:

```text
Template
│
├── Logo
├── Headline
├── Description
├── Hero Image
└── CTA
```

---

# 22. DOMAIN 5 — CREATIVE STUDIO

## 22.1 designs

Design adalah **instance milik user**, bukan template.

```sql
designs
-------
id uuid PK

organization_id uuid NOT NULL

source_template_id uuid NULL
source_template_version integer NULL

brand_id uuid NULL

name text NOT NULL

design_type template_type NOT NULL

format_code text NOT NULL

width integer NOT NULL
height integer NOT NULL
unit text DEFAULT 'px'

status design_status DEFAULT 'draft'

current_version integer DEFAULT 1

preview_asset_id uuid NULL

created_at timestamptz
updated_at timestamptz
created_by uuid NOT NULL
updated_by uuid NULL
deleted_at timestamptz NULL
```

---

# 23. Design cloning model

Ketika user memilih template:

```text
Template
   │
   ▼
Template Version
   │
   ▼
Clone
   │
   ├── copy template variables
   ├── copy template elements
   └── create design
         │
         ▼
    Design Elements
```

Setelah itu:

```text
Template berubah
     ≠
Design existing berubah
```

Ini **wajib**.

---

# 24. design_elements

Ini adalah tabel paling penting dalam Creative Studio.

```sql
design_elements
---------------
id uuid PK

design_id uuid NOT NULL
parent_id uuid NULL

source_template_element_id uuid NULL

element_type design_element_type NOT NULL
role text NULL

asset_id uuid NULL

x numeric NOT NULL
y numeric NOT NULL
width numeric NOT NULL
height numeric NOT NULL

rotation numeric DEFAULT 0
opacity numeric DEFAULT 1

z_index integer DEFAULT 0

visible boolean DEFAULT true
locked boolean DEFAULT false

content text NULL

style jsonb DEFAULT '{}'
metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz
created_by uuid NULL
updated_by uuid NULL
```

---

# 25. Design Element Types

Enum:

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

---

# 26. Parent/Child Element

Untuk grouping:

```text
Design
│
├── Group A
│   ├── Text
│   ├── Image
│   └── Badge
│
└── Group B
    ├── Logo
    └── CTA
```

Model:

```text
design_elements.parent_id
        ↓
design_elements.id
```

Dengan demikian editor dapat mendukung grouping tanpa membuat tabel group terpisah pada MVP.

---

# 27. design_versions

```sql
design_versions
---------------
id uuid PK

design_id uuid NOT NULL

version integer NOT NULL

change_note text NULL

snapshot jsonb NOT NULL

created_at timestamptz
created_by uuid NULL
```

Unique:

```text
(design_id, version)
```

Snapshot berisi:

```json
{
  "format": {
    "width": 1080,
    "height": 1080
  },
  "background": {},
  "elements": []
}
```

---

# 28. Kenapa `design_elements` + `design_versions`?

Karena keduanya memiliki fungsi berbeda.

### `design_elements`

Current editable state.

### `design_versions`

Historical snapshot.

```text
CURRENT
design_elements
      │
      ├── edit
      ├── move
      ├── resize
      └── delete

HISTORY
design_versions
      │
      ├── v1
      ├── v2
      └── v3
```

---

# 29. DOMAIN 6 — MARKETING CONTENT

## content_categories

```sql
content_categories
------------------
id uuid PK
organization_id uuid NOT NULL
parent_id uuid NULL
name text NOT NULL
slug text NOT NULL
description text NULL
color text NULL
sort_order integer DEFAULT 0
is_system boolean DEFAULT false
created_at timestamptz
updated_at timestamptz
deleted_at timestamptz NULL
```

---

# 30. contents

```sql
contents
--------
id uuid PK

organization_id uuid NOT NULL

category_id uuid NULL
brand_id uuid NULL

title text NOT NULL
slug text NULL

excerpt text NULL
body text NULL

platform content_platform NULL
content_type content_type NULL

status content_status DEFAULT 'draft'

tone text NULL
hashtags text[] NULL
cta text NULL

thumbnail_asset_id uuid NULL

scheduled_at timestamptz NULL
published_at timestamptz NULL

owner_id uuid NULL
approver_id uuid NULL

approved_at timestamptz NULL

current_version integer DEFAULT 1

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

### Perubahan penting

`contents.campaign_id` dihapus.

Karena campaign-content menggunakan junction table.

---

# 31. content_versions

```sql
content_versions
----------------
id uuid PK

content_id uuid NOT NULL

version integer NOT NULL

title text NULL
body text NULL
metadata jsonb DEFAULT '{}'

change_note text NULL

created_at timestamptz
created_by uuid NULL
```

Unique:

```text
(content_id, version)
```

---

# 32. DOMAIN 7 — CAMPAIGN

## campaigns

```sql
campaigns
---------
id uuid PK

organization_id uuid NOT NULL
brand_id uuid NULL

name text NOT NULL
code text NOT NULL

description text NULL

objective campaign_objective NULL
target_audience text NULL

budget numeric(15,2) NULL
spent numeric(15,2) DEFAULT 0
currency_code text DEFAULT 'IDR'

start_date date NULL
end_date date NULL

status campaign_status DEFAULT 'draft'

cover_asset_id uuid NULL

owner_id uuid NULL

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 33. campaign_contents

```sql
campaign_contents
-----------------
campaign_id uuid NOT NULL
content_id uuid NOT NULL

added_at timestamptz
added_by uuid NULL

PRIMARY KEY (campaign_id, content_id)
```

Relationship:

```text
Campaign N:M Content
```

---

# 34. campaign_designs

Ini ditambahkan untuk mendukung reuse Design.

```sql
campaign_designs
---------------
campaign_id uuid NOT NULL
design_id uuid NOT NULL

role text NULL

added_at timestamptz
added_by uuid NULL

PRIMARY KEY (campaign_id, design_id)
```

Contoh:

```text
Campaign Ramadhan
│
├── Design Flyer
├── Design Instagram
└── Design Story
```

---

# 35. DOMAIN 8 — CONTENT CALENDAR

## content_calendar

Calendar menjadi scheduling entity.

```sql
content_calendar
----------------
id uuid PK

organization_id uuid NOT NULL

content_id uuid NULL
campaign_id uuid NULL
design_id uuid NULL

platform content_platform NULL

scheduled_at timestamptz NOT NULL

status calendar_status DEFAULT 'planned'

notes text NULL
color text NULL

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL
```

Tidak perlu:

```text scheduled_date
scheduled_time
```

secara terpisah.

Gunakan:

```text scheduled_at timestamptz
```

agar timezone tidak ambigu.

---

# 36. DOMAIN 9 — DOCUMENT ENGINE

## document_templates

```sql
document_templates
------------------
id uuid PK

organization_id uuid NOT NULL
brand_id uuid NULL

name text NOT NULL
code text NOT NULL

description text NULL

document_type document_type NOT NULL

template_content text NOT NULL

variables jsonb NOT NULL DEFAULT '[]'

header_asset_id uuid NULL
footer_asset_id uuid NULL
cover_asset_id uuid NULL

styles jsonb DEFAULT '{}'

page_size text DEFAULT 'A4'
page_orientation text DEFAULT 'portrait'

is_system boolean DEFAULT false
is_active boolean DEFAULT true

current_version integer DEFAULT 1

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 37. document_template_versions

Untuk konsistensi dengan Creative Studio:

```sql
document_template_versions
--------------------------
id uuid PK

document_template_id uuid NOT NULL

version integer NOT NULL

template_content text NOT NULL
variables jsonb NOT NULL
styles jsonb DEFAULT '{}'

change_note text NULL

created_at timestamptz
created_by uuid NULL
```

Unique:

```text
(document_template_id, version)
```

---

# 38. documents

```sql
documents
---------
id uuid PK

organization_id uuid NOT NULL

template_id uuid NULL
brand_id uuid NULL

company_id uuid NULL
contact_id uuid NULL
lead_id uuid NULL
opportunity_id uuid NULL
campaign_id uuid NULL

document_number text NOT NULL
title text NOT NULL

document_type document_type NOT NULL

status document_status DEFAULT 'draft'

variables_data jsonb DEFAULT '{}'

rendered_content text NULL

issued_date date NULL
valid_until date NULL

total_amount numeric(15,2) NULL
currency_code text DEFAULT 'IDR'

notes text NULL

pdf_asset_id uuid NULL
docx_asset_id uuid NULL
preview_asset_id uuid NULL

current_version integer DEFAULT 1

owner_id uuid NULL
approver_id uuid NULL

approved_at timestamptz NULL
sent_at timestamptz NULL
signed_at timestamptz NULL

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 39. document_versions

```sql
document_versions
-----------------
id uuid PK

document_id uuid NOT NULL

version integer NOT NULL

rendered_content text NULL
variables_data jsonb DEFAULT '{}'

pdf_asset_id uuid NULL
docx_asset_id uuid NULL

change_note text NULL

created_at timestamptz
created_by uuid NULL
```

Unique:

```text
(document_id, version)
```

---

# 40. DOMAIN 10 — BUSINESS DEVELOPMENT

CRM tetap tersedia karena dibutuhkan oleh PRD, tetapi implementasi UI dapat bertahap.

---

# 41. companies

```sql
companies
---------
id uuid PK
organization_id uuid NOT NULL

name text NOT NULL
legal_name text NULL

industry text NULL
website text NULL

email text NULL
phone text NULL

address text NULL
city text NULL
province text NULL
postal_code text NULL
country_code text DEFAULT 'ID'

tax_id text NULL
company_size text NULL

logo_asset_id uuid NULL

notes text NULL
tags text[] NULL

owner_id uuid NULL

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 42. contacts

```sql
contacts
--------
id uuid PK

organization_id uuid NOT NULL
company_id uuid NULL

full_name text NOT NULL
job_title text NULL

email text NULL
phone text NULL
whatsapp text NULL
linkedin_url text NULL

is_primary boolean DEFAULT false

notes text NULL
tags text[] NULL

owner_id uuid NULL

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 43. leads

```sql
leads
-----
id uuid PK

organization_id uuid NOT NULL

company_id uuid NULL
contact_id uuid NULL
campaign_id uuid NULL

name text NOT NULL

email text NULL
phone text NULL
whatsapp text NULL

source lead_source DEFAULT 'other'

status lead_status DEFAULT 'new'
priority lead_priority DEFAULT 'medium'

estimated_value numeric(15,2) NULL
currency_code text DEFAULT 'IDR'

notes text NULL
tags text[] NULL

owner_id uuid NULL

last_contacted_at timestamptz NULL
next_follow_up_at timestamptz NULL
converted_at timestamptz NULL

lost_reason text NULL

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 44. opportunities

Future-ready.

```sql
opportunities
-------------
id uuid PK

organization_id uuid NOT NULL

lead_id uuid NULL
company_id uuid NULL
contact_id uuid NULL

name text NOT NULL

stage opportunity_stage DEFAULT 'qualification'

value numeric(15,2) NULL
currency_code text DEFAULT 'IDR'

probability integer NULL

expected_close_date date NULL
actual_close_date date NULL

owner_id uuid NULL

notes text NULL
lost_reason text NULL

metadata jsonb DEFAULT '{}'

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 45. follow_ups

```sql
follow_ups
----------
id uuid PK

organization_id uuid NOT NULL

lead_id uuid NULL
opportunity_id uuid NULL
company_id uuid NULL
contact_id uuid NULL
document_id uuid NULL

subject text NOT NULL
description text NULL

type follow_up_type DEFAULT 'other'
status follow_up_status DEFAULT 'pending'

due_at timestamptz NULL
completed_at timestamptz NULL
reminder_sent_at timestamptz NULL

owner_id uuid NULL

created_at timestamptz
updated_at timestamptz

created_by uuid NULL
updated_by uuid NULL

deleted_at timestamptz NULL
```

---

# 46. DOMAIN 11 — SYSTEM

## notifications

```sql
notifications
-------------
id uuid PK

organization_id uuid NOT NULL
user_id uuid NOT NULL

type notification_type DEFAULT 'info'

title text NOT NULL
body text NULL

entity_type text NULL
entity_id uuid NULL

action_url text NULL

is_read boolean DEFAULT false
read_at timestamptz NULL

metadata jsonb DEFAULT '{}'

created_at timestamptz
```

---

# 47. audit_logs

```sql
audit_logs
----------
id uuid PK

organization_id uuid NULL
user_id uuid NULL

table_name text NOT NULL
record_id uuid NULL

action audit_action NOT NULL

old_data jsonb NULL
new_data jsonb NULL

ip_address inet NULL
user_agent text NULL

created_at timestamptz
```

Audit log tidak boleh menyimpan:

```text
password
access_token
refresh_token
API key
secret
private credential
```

---

# 48. activities

```sql
activities
----------
id uuid PK

organization_id uuid NOT NULL
user_id uuid NULL

entity_type text NOT NULL
entity_id uuid NULL

action activity_action NOT NULL

description text NULL
metadata jsonb DEFAULT '{}'

created_at timestamptz
```

---

# 49. settings

```sql
settings
--------
id uuid PK

organization_id uuid NOT NULL

category text NOT NULL
key text NOT NULL
value jsonb NULL

created_at timestamptz
updated_at timestamptz
```

Unique:

```text
(organization_id, category, key)
```

---

# 50. integrations

Future-ready.

```sql
integrations
------------
id uuid PK

organization_id uuid NOT NULL

provider text NOT NULL
display_name text NULL

configuration jsonb DEFAULT '{}'

is_active boolean DEFAULT false

last_sync_at timestamptz NULL

created_at timestamptz
updated_at timestamptz
```

### Security rule

`configuration` tidak boleh menyimpan secret mentah.

Secret harus berada pada:

```text
Vercel Environment Variables
atau
Supabase Secrets
atau
Secret Manager
```

---

# 51. RELATIONSHIP MAP

```text
AUTH
auth.users
    │
    └── 1:1 ── profiles
                    │
                    ├── N:M ── organizations
                    │            │
                    │            ├── roles
                    │            │     └── N:M ── permissions
                    │            │
                    │            ├── brands
                    │            │     ├── brand_colors
                    │            │     └── brand_fonts
                    │            │
                    │            ├── assets
                    │            │     └── asset_categories
                    │            │
                    │            ├── templates
                    │            │     ├── template_versions
                    │            │     ├── template_variables
                    │            │     └── template_elements
                    │            │
                    │            ├── designs
                    │            │     ├── design_versions
                    │            │     └── design_elements
                    │            │
                    │            ├── contents
                    │            │     └── content_versions
                    │            │
                    │            ├── campaigns
                    │            │     ├── campaign_contents
                    │            │     └── campaign_designs
                    │            │
                    │            ├── content_calendar
                    │            │
                    │            ├── document_templates
                    │            │     └── document_template_versions
                    │            │
                    │            ├── documents
                    │            │     └── document_versions
                    │            │
                    │            ├── companies
                    │            │     └── contacts
                    │            │
                    │            ├── leads
                    │            │     └── opportunities
                    │            │             └── follow_ups
                    │            │
                    │            ├── notifications
                    │            ├── activities
                    │            ├── audit_logs
                    │            ├── settings
                    │            └── integrations
```

---

# 52. CREATIVE STUDIO RELATIONSHIP

Bagian paling penting:

```text
                    TEMPLATE
                       │
                       │ clone
                       ▼
                    DESIGN
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
           ELEMENT  ELEMENT  ELEMENT
              │        │        │
              │        │        │
              └────────┼────────┘
                       │
                       ▼
                  DESIGN VERSION
```

Asset:

```text
ASSET
  │
  ├──────────────► TEMPLATE ELEMENT
  │
  └──────────────► DESIGN ELEMENT
```

---

# 53. TEMPLATE → DESIGN FLOW

```text
User
 │
 ▼
Select Template
 │
 ▼
Load Template Version
 │
 ├── Variables
 └── Elements
 │
 ▼
Fill Variables
 │
 ▼
Clone Template
 │
 ▼
Create Design
 │
 ▼
Create Design Elements
 │
 ▼
Open Creative Studio
 │
 ▼
Drag / Drop / Resize / Edit
 │
 ▼
Save Design
 │
 ▼
Create Version Snapshot
 │
 ▼
Export
```

---

# 54. CONTENT ↔ CAMPAIGN

```text
CAMPAIGN
    │
    │ N:M
    ▼
campaign_contents
    │
    ▼
CONTENT
```

Tidak ada lagi:

```text
contents.campaign_id
```

karena itu akan membuat dua sumber relasi.

---

# 55. DESIGN ↔ CAMPAIGN

```text
CAMPAIGN
    │
    │ N:M
    ▼
campaign_designs
    │
    ▼
DESIGN
```

Ini mendukung prinsip:

> Create Once. Reuse Everywhere.

---

# 56. INDEX STRATEGY

Semua tabel tenant utama harus memiliki:

```text
organization_id
```

Index utama:

```sql
(organization_id)
(organization_id, created_at)
(organization_id, status)
```

Untuk entity yang memiliki soft delete:

```sql
WHERE deleted_at IS NULL
```

Search:

```text
pg_trgm
```

untuk:

```text
assets.name
templates.name
contents.title
companies.name
contacts.full_name
leads.name
documents.document_number
```

GIN digunakan untuk:

```text
text[]
jsonb
```

hanya jika memang terdapat query yang memanfaatkannya.

---

# 57. CONSTRAINT STRATEGY

Database harus menggunakan CHECK constraint untuk data penting.

Contoh:

```sql
CHECK (width > 0)
CHECK (height > 0)
CHECK (opacity >= 0 AND opacity <= 1)
CHECK (probability >= 0 AND probability <= 100)
CHECK (file_size >= 0)
```

Design element:

```sql
CHECK (width >= 0)
CHECK (height >= 0)
CHECK (opacity >= 0 AND opacity <= 1)
```

---

# 58. TENANT ISOLATION

Semua entity bisnis wajib mempunyai:

```text
organization_id
```

dan tidak boleh mempercayai:

```text
organization_id dari client request
```

sebagai satu-satunya mekanisme security.

Flow:

```text
auth.uid()
    ↓
organization_members
    ↓
active membership
    ↓
organization_id
    ↓
RLS
    ↓
record access
```

---

# 59. RLS PRINCIPLE

Semua tabel bisnis:

```sql
ENABLE ROW LEVEL SECURITY;
```

Pattern:

```text
SELECT
    organization member

INSERT
    member + permission

UPDATE
    member + permission

DELETE
    admin/super_admin
```

Untuk entity yang memiliki ownership:

```text
owner
```

dapat diberikan restriction tambahan jika dibutuhkan.

---

# 60. RLS SECURITY RULE

Jangan membuat:

```sql
USING (organization_id = ...)
```

berdasarkan parameter client.

Gunakan helper:

```text
private.is_org_member(organization_id)
private.has_permission(organization_id, permission)
private.has_role(organization_id, role)
```

Helper harus:

```text
SECURITY DEFINER
STABLE
search_path aman
```

dan tidak dapat dimanipulasi oleh user biasa.

---

# 61. STORAGE ARCHITECTURE

Bucket:

```text
brand-assets
assets
templates
designs
documents
avatars
```

Path:

```text
{organization_id}/...
```

Contoh:

```text
assets/
  8c0.../
    marketing/
      promo-website.png
```

Design:

```text
designs/
  8c0.../
    DSN-001/
      preview.png
      export.png
```

Document:

```text
documents/
  8c0.../
    DOC-001/
      version-1.pdf
      version-1.docx
```

---

# 62. STORAGE SECURITY

Upload harus memvalidasi:

```text
authenticated
        ↓
organization member
        ↓
permission
        ↓
bucket
        ↓
organization path
        ↓
MIME
        ↓
file size
        ↓
filename sanitization
```

Jangan mempercayai MIME type dari client saja.

---

# 63. ENUM CORE

Gunakan PostgreSQL ENUM untuk nilai yang benar-benar stabil.

Contoh:

```text
membership_status
asset_type
template_type
template_variable_type
design_element_type
design_status
content_status
content_platform
content_type
campaign_status
campaign_objective
calendar_status
document_type
document_status
lead_status
lead_source
lead_priority
opportunity_stage
follow_up_type
follow_up_status
notification_type
activity_action
audit_action
```

Jangan menggunakan ENUM untuk data yang kemungkinan sering berubah akibat konfigurasi bisnis.

---

# 64. MVP DATABASE BOUNDARY

## P0 — Core MVP

```text
profiles
organizations
roles
permissions
role_permissions
organization_members

brands
brand_colors
brand_fonts

asset_categories
assets

template_categories
templates
template_versions
template_variables
template_elements

designs
design_versions
design_elements

content_categories
contents
content_versions

campaigns
campaign_contents
campaign_designs

content_calendar

document_templates
document_template_versions
documents
document_versions

notifications
audit_logs
settings
```

---

# 65. P1

```text
companies
contacts
leads
follow_ups
```

---

# 66. P2 / FUTURE READY

```text
opportunities
integrations
advanced collaboration
analytics
automation
WhatsApp API
Email API
```

Tabel future-ready boleh dibuat lebih awal jika tidak mengganggu MVP.

Namun:

> **Antigravity tidak boleh membangun UI/API feature hanya karena tabel tersebut tersedia.**

---

# 67. HAL YANG TIDAK BOLEH DILAKUKAN ANTIGRAVITY

Jangan:

```text
❌ menyimpan seluruh design hanya sebagai image
❌ menyimpan hanya flattened PNG sebagai source
❌ menjadikan template mutable setelah digunakan
❌ menggunakan localStorage sebagai database
❌ menyimpan API secret di database plain text
❌ menggunakan campaign_id sekaligus junction tanpa alasan
❌ menggunakan URL Storage sebagai source of truth
❌ melewati RLS
❌ mengandalkan frontend untuk tenant isolation
❌ mencampur Design Engine dengan Document Engine
```

---

# 68. SOURCE OF TRUTH CREATIVE ENGINE

```text
Database
    │
    ▼
design_elements
    │
    ▼
Design State
    │
    ▼
Canvas Editor
    │
    ├── drag
    ├── resize
    ├── rotate
    ├── duplicate
    ├── delete
    ├── lock
    ├── hide
    ├── reorder
    └── style
    │
    ▼
Persistence
    │
    ▼
design_versions
    │
    ▼
Export Renderer
```

Canvas tidak boleh langsung menghasilkan gambar lalu menjadikannya source of truth.

---

# 69. DATABASE VS JSONB

Gunakan relational column untuk:

```text
id
organization_id
template_id
design_id
asset_id
type
status
owner_id
created_at
updated_at
```

Gunakan JSONB untuk:

```text
style
metadata
validation_rules
editor configuration
render configuration
snapshot
```

Dengan demikian database tetap normalized tanpa mengorbankan fleksibilitas Creative Engine.

---

# 70. MIGRATION ORDER FINAL

Urutan yang direkomendasikan:

```text
001_extensions
002_enums
003_private_functions

004_organizations
005_profiles
006_permissions
007_roles
008_role_permissions
009_organization_members

010_brands
011_brand_colors
012_brand_fonts

013_asset_categories
014_assets

015_template_categories
016_templates
017_template_versions
018_template_variables
019_template_elements

020_designs
021_design_versions
022_design_elements

023_content_categories
024_contents
025_content_versions

026_campaigns
027_campaign_contents
028_campaign_designs

029_content_calendar

030_document_templates
031_document_template_versions
032_documents
033_document_versions

034_companies
035_contacts
036_leads
037_opportunities
038_follow_ups

039_notifications
040_activities
041_audit_logs
042_settings
043_integrations

044_updated_at_triggers
045_auth_triggers
046_audit_triggers

047_rls_enable
048_rls_identity
049_rls_brand
050_rls_assets
051_rls_templates
052_rls_creative
053_rls_marketing
054_rls_documents
055_rls_crm
056_rls_system

057_storage_buckets
058_storage_rls

059_seed_permissions
060_seed_role_permissions
061_seed_deraly
062_seed_brand
063_seed_settings
064_seed_templates
```

---

# 71. MIGRATION RULE

Antigravity wajib:

```text
migration
   ↓
supabase db reset
   ↓
migration validation
   ↓
type generation
   ↓
RLS test
   ↓
integration test
```

Jangan melakukan:

```text
ALTER TABLE production
```

secara manual.

Semua perubahan harus melalui migration.

---

# 72. RLS TEST MATRIX

Minimal test:

| Scenario                      | Expected |
| ----------------------------- | -------- |
| User A → Org A                | Allow    |
| User A → Org B                | Deny     |
| User B → Org A                | Deny     |
| Viewer → Asset Delete         | Deny     |
| Designer → Design Create      | Allow    |
| Marketing → Content Create    | Allow    |
| Viewer → Content Update       | Deny     |
| Admin → Organization Settings | Allow    |
| Non-member → Storage Org A    | Deny     |
| Member Org A → Storage Org B  | Deny     |

---

# 73. CREATIVE ENGINE ACCEPTANCE TEST

Harus bisa:

```text
Create Design
      ↓
Select Template
      ↓
Clone Template
      ↓
Load Elements
      ↓
Edit Text
      ↓
Drag Image
      ↓
Resize
      ↓
Rotate
      ↓
Change Layer
      ↓
Lock Element
      ↓
Hide Element
      ↓
Replace Asset
      ↓
Save
      ↓
Create Version
      ↓
Reload
      ↓
State remains identical
```

---

# 74. NORMALIZED ERD FINAL — CORE

```text
ORGANIZATIONS
│
├── ORGANIZATION_MEMBERS ─── PROFILES
│
├── ROLES
│    └── ROLE_PERMISSIONS ─── PERMISSIONS
│
├── BRANDS
│    ├── BRAND_COLORS
│    └── BRAND_FONTS
│
├── ASSET_CATEGORIES
│    └── ASSETS
│
├── TEMPLATE_CATEGORIES
│    └── TEMPLATES
│         ├── TEMPLATE_VERSIONS
│         ├── TEMPLATE_VARIABLES
│         └── TEMPLATE_ELEMENTS
│
├── DESIGNS
│    ├── DESIGN_VERSIONS
│    └── DESIGN_ELEMENTS
│
├── CONTENT_CATEGORIES
│    └── CONTENTS
│         └── CONTENT_VERSIONS
│
├── CAMPAIGNS
│    ├── CAMPAIGN_CONTENTS ─── CONTENTS
│    └── CAMPAIGN_DESIGNS ─── DESIGNS
│
├── CONTENT_CALENDAR
│
├── DOCUMENT_TEMPLATES
│    └── DOCUMENT_TEMPLATE_VERSIONS
│
├── DOCUMENTS
│    └── DOCUMENT_VERSIONS
│
├── COMPANIES
│    └── CONTACTS
│
├── LEADS
│    └── OPPORTUNITIES
│         └── FOLLOW_UPS
│
├── NOTIFICATIONS
├── ACTIVITIES
├── AUDIT_LOGS
├── SETTINGS
└── INTEGRATIONS
```

---

# 75. FINAL DATA MODEL PRINCIPLE

Arsitektur database Deraly sekarang mengikuti prinsip:

```text
MASTER DATA
     │
     ├── Brand
     ├── Asset
     └── Template
             │
             ▼
       TEMPLATE ENGINE
             │
             ▼
       DESIGN INSTANCE
             │
             ▼
       DESIGN ELEMENTS
             │
             ▼
       CREATIVE STUDIO
             │
             ▼
          EXPORT
             │
             ├── Content
             ├── Campaign
             ├── Calendar
             └── Document
                    │
                    ▼
               Business
```

---

# 76. FINAL DECISION

Dengan model ini:

### Template

**Blueprint reusable.**

### Asset

**Physical reusable resource.**

### Design

**User-owned editable instance.**

### Design Element

**Atomic visual object.**

### Design Version

**Historical snapshot.**

### Content

**Marketing communication object.**

### Campaign

**Business marketing container.**

### Calendar

**Scheduling object.**

### Document

**Business communication artifact.**

### Lead

**Business development prospect.**

Model tersebut membuat setiap domain memiliki tanggung jawab yang jelas.

---

# 77. DEFINITION OF DATABASE DONE

ERD dianggap **BUILD-READY** apabila:

* [x] Tenant isolation jelas
* [x] PK/FK jelas
* [x] Creative Studio didukung
* [x] Template Engine didukung
* [x] Asset Library didukung
* [x] Template immutable setelah cloning
* [x] Design editable
* [x] Design element relational
* [x] Versioning tersedia
* [x] Campaign reuse tersedia
* [x] Content reuse tersedia
* [x] Document Engine terpisah
* [x] CRM future-ready
* [x] RLS architecture tersedia
* [x] Storage architecture tersedia
* [x] Audit tersedia
* [x] Migration order tersedia
* [x] MVP/Future boundary jelas

---

# 78. SOURCE OF TRUTH

Urutan dokumen teknis Deraly Platform sekarang:

```text
1. PRD v1.2
      ↓
2. ERD v1.1
      ↓
3. API Contract v1.0
      ↓
4. Design System
      ↓
5. Sitemap / Wireframe
      ↓
6. Technical Implementation Specification
      ↓
7. Antigravity Master Build Prompt
      ↓
8. Supabase Migration
      ↓
9. Next.js Implementation
      ↓
10. Testing
      ↓
11. Deployment
```

**Jangan melompati urutan ini.**

---

# 79. FINAL ARCHITECTURE STATEMENT

> **Deraly Platform menggunakan normalized relational data model dengan tenant isolation berbasis `organization_id` dan Supabase Row Level Security. Creative Studio menggunakan Design Object Model yang memisahkan Template Blueprint, Design Instance, Design Element, dan Version Snapshot. Template dapat digunakan berulang kali tanpa dimodifikasi ketika Design dibuat. Asset disimpan sebagai reusable resource melalui Supabase Storage dan direferensikan melalui relational foreign key. JSONB hanya digunakan untuk metadata dan properti visual yang bersifat extensible. Campaign, Content, Design, Calendar, Document, dan Business Development dipisahkan sebagai domain yang saling terhubung melalui relationship yang eksplisit dan tidak redundan.**

**Status: ERD v1.1 — Normalized & Build-Ready untuk dilanjutkan ke API Contract dan Technical Specification.**

---

### Instruksi untuk Antigravity

**ERD ini adalah database contract. Jangan mengimplementasikan seluruh roadmap hanya karena tabel future-ready tersedia. Prioritaskan P0/MVP, terutama Creative Studio, Template Engine, Asset Library, Content, Campaign, Calendar, dan Document Engine.**

**Creative Studio adalah MVP, bukan Phase 2.**

**Template ≠ Design.**

**Design ≠ flattened image.**

**`design_elements` adalah current editable state.**

**`design_versions` adalah historical snapshot.**

**Template tidak boleh berubah ketika Design dibuat atau diedit.**

**RLS adalah security boundary, bukan sekadar fitur tambahan.**

**Semua tenant-scoped data harus melewati `organization_id` + RLS.**

**Jangan menggunakan localStorage sebagai persistence utama.**

**Jangan menyimpan secret integration secara plaintext di database.**

**Jangan membuat API/UI untuk P2/P3 sebelum P0 stabil.**

---

**© 2026 PT Deraly Innovation Digital — Database Architecture Specification**
