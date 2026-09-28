-- DERALY PLATFORM - INITIAL SCHEMA MIGRATION 
-- FULL DOMAIN ARCHITECTURE (P0 MVP CORE)

-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE membership_status AS ENUM ('active', 'invited', 'suspended', 'left');
CREATE TYPE asset_type AS ENUM ('image', 'font', 'video', 'document', 'audio', 'archive', 'other');
CREATE TYPE template_type AS ENUM ('flyer', 'poster', 'banner', 'social_post', 'social_story', 'custom');
CREATE TYPE template_variable_type AS ENUM ('text', 'long_text', 'number', 'date', 'image', 'color', 'url', 'email', 'phone');
CREATE TYPE design_element_type AS ENUM ('text', 'image', 'logo', 'icon', 'shape', 'line', 'button', 'badge', 'qr', 'group');
CREATE TYPE design_status AS ENUM ('draft', 'review', 'approved', 'archived');
CREATE TYPE content_status AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE content_platform AS ENUM ('instagram', 'facebook', 'linkedin', 'whatsapp', 'website', 'other');
CREATE TYPE content_type AS ENUM ('post', 'story', 'reel', 'article', 'announcement');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE campaign_objective AS ENUM ('awareness', 'consideration', 'conversion', 'loyalty', 'other');
CREATE TYPE calendar_status AS ENUM ('planned', 'scheduled', 'published', 'failed', 'cancelled');
CREATE TYPE document_type AS ENUM ('proposal', 'mou', 'quotation', 'invoice', 'receipt', 'contract', 'other');
CREATE TYPE document_status AS ENUM ('draft', 'review', 'approved', 'sent', 'signed', 'void');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'mention');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'export');

-- =========================================================================
-- DOMAIN 1: IDENTITY & ACCESS (TENANT ROOT)
-- =========================================================================
CREATE TABLE organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    legal_name text,
    industry text,
    website text,
    email text,
    phone text,
    address text,
    city text,
    province text,
    postal_code text,
    country_code text DEFAULT 'ID',
    timezone text DEFAULT 'Asia/Jakarta',
    locale text DEFAULT 'id-ID',
    currency_code text DEFAULT 'IDR',
    subscription_plan text DEFAULT 'internal',
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    deleted_at timestamptz
);

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    avatar_asset_id uuid,
    phone text,
    job_title text,
    bio text,
    locale text DEFAULT 'id-ID',
    timezone text DEFAULT 'Asia/Jakarta',
    default_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    is_active boolean DEFAULT true,
    last_seen_at timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (organization_id, name)
);

CREATE TABLE permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    module text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE organization_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    status membership_status DEFAULT 'active',
    invited_by uuid REFERENCES auth.users(id),
    invited_at timestamptz,
    joined_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (organization_id, user_id)
);


-- =========================================================================
-- DOMAIN 2: BRAND
-- =========================================================================
CREATE TABLE brands (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    tagline text,
    description text,
    tone_of_voice text[],
    forbidden_words text[],
    preferred_cta text,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz,
    UNIQUE (organization_id, slug)
);

CREATE TABLE brand_colors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    hex_code text NOT NULL,
    role text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE (brand_id, name)
);

CREATE TABLE brand_fonts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text NOT NULL,
    font_family text NOT NULL,
    font_asset_id uuid, -- Reference to assets table
    weights text[],
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE (brand_id, role)
);


-- =========================================================================
-- DOMAIN 3: ASSET MANAGEMENT
-- =========================================================================
CREATE TABLE asset_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES asset_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    sort_order integer DEFAULT 0,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE assets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES asset_categories(id) ON DELETE SET NULL,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    asset_type asset_type NOT NULL,
    storage_bucket text NOT NULL,
    storage_path text NOT NULL,
    mime_type text,
    file_size bigint CHECK (file_size >= 0),
    width integer,
    height integer,
    duration_seconds integer,
    alt_text text,
    tags text[],
    metadata jsonb DEFAULT '{}',
    is_public boolean DEFAULT false,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz
);


-- =========================================================================
-- DOMAIN 4: TEMPLATE ENGINE
-- =========================================================================
CREATE TABLE template_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES template_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    template_type template_type,
    description text,
    icon text,
    sort_order integer DEFAULT 0,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES template_categories(id) ON DELETE SET NULL,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    template_type template_type NOT NULL,
    format_code text NOT NULL,
    width integer NOT NULL CHECK (width > 0),
    height integer NOT NULL CHECK (height > 0),
    unit text DEFAULT 'px',
    thumbnail_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    background_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    current_version integer DEFAULT 1,
    usage_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz,
    UNIQUE (organization_id, code)
);

CREATE TABLE template_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    version integer NOT NULL,
    change_note text,
    schema_snapshot jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (template_id, version)
);

CREATE TABLE template_variables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    variable_key text NOT NULL,
    label text NOT NULL,
    variable_type template_variable_type NOT NULL,
    default_value text,
    placeholder text,
    is_required boolean DEFAULT false,
    max_length integer,
    sort_order integer DEFAULT 0,
    validation_rules jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (template_id, variable_key)
);

CREATE TABLE template_elements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES template_elements(id) ON DELETE CASCADE,
    element_type design_element_type NOT NULL,
    role text,
    variable_id uuid REFERENCES template_variables(id) ON DELETE SET NULL,
    asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    x numeric NOT NULL,
    y numeric NOT NULL,
    width numeric NOT NULL CHECK (width >= 0),
    height numeric NOT NULL CHECK (height >= 0),
    rotation numeric DEFAULT 0,
    opacity numeric DEFAULT 1 CHECK (opacity >= 0 AND opacity <= 1),
    z_index integer DEFAULT 0,
    visible boolean DEFAULT true,
    locked boolean DEFAULT false,
    content text,
    style jsonb DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


-- =========================================================================
-- DOMAIN 5: CREATIVE STUDIO
-- =========================================================================
CREATE TABLE designs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
    source_template_version integer,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    name text NOT NULL,
    design_type template_type NOT NULL,
    format_code text NOT NULL,
    width integer NOT NULL CHECK (width > 0),
    height integer NOT NULL CHECK (height > 0),
    unit text DEFAULT 'px',
    status design_status DEFAULT 'draft',
    current_version integer DEFAULT 1,
    preview_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz
);

CREATE TABLE design_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    design_id uuid NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    version integer NOT NULL,
    change_note text,
    snapshot jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (design_id, version)
);

CREATE TABLE design_elements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    design_id uuid NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES design_elements(id) ON DELETE CASCADE,
    source_template_element_id uuid, -- no fk back to template elements so it's safely disjoint if template modifies
    element_type design_element_type NOT NULL,
    role text,
    asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    x numeric NOT NULL,
    y numeric NOT NULL,
    width numeric NOT NULL CHECK (width >= 0),
    height numeric NOT NULL CHECK (height >= 0),
    rotation numeric DEFAULT 0,
    opacity numeric DEFAULT 1 CHECK (opacity >= 0 AND opacity <= 1),
    z_index integer DEFAULT 0,
    visible boolean DEFAULT true,
    locked boolean DEFAULT false,
    content text,
    style jsonb DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);


-- =========================================================================
-- DOMAIN 6: MARKETING CONTENT
-- =========================================================================
CREATE TABLE content_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES content_categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    color text,
    sort_order integer DEFAULT 0,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE contents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES content_categories(id) ON DELETE SET NULL,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    title text NOT NULL,
    slug text,
    excerpt text,
    body text,
    platform content_platform,
    content_type content_type,
    status content_status DEFAULT 'draft',
    tone text,
    hashtags text[],
    cta text,
    thumbnail_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    scheduled_at timestamptz,
    published_at timestamptz,
    owner_id uuid REFERENCES auth.users(id),
    approver_id uuid REFERENCES auth.users(id),
    approved_at timestamptz,
    current_version integer DEFAULT 1,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz
);

CREATE TABLE content_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    version integer NOT NULL,
    title text,
    body text,
    metadata jsonb DEFAULT '{}',
    change_note text,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (content_id, version)
);


-- =========================================================================
-- DOMAIN 7: CAMPAIGN
-- =========================================================================
CREATE TABLE campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    objective campaign_objective,
    target_audience text,
    budget numeric(15,2),
    spent numeric(15,2) DEFAULT 0,
    currency_code text DEFAULT 'IDR',
    start_date date,
    end_date date,
    status campaign_status DEFAULT 'draft',
    cover_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    owner_id uuid REFERENCES auth.users(id),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz
);

CREATE TABLE campaign_contents (
    campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    added_at timestamptz DEFAULT now(),
    added_by uuid REFERENCES auth.users(id),
    PRIMARY KEY (campaign_id, content_id)
);

CREATE TABLE campaign_designs (
    campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    design_id uuid NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    role text,
    added_at timestamptz DEFAULT now(),
    added_by uuid REFERENCES auth.users(id),
    PRIMARY KEY (campaign_id, design_id)
);


-- =========================================================================
-- DOMAIN 8: CONTENT CALENDAR
-- =========================================================================
CREATE TABLE content_calendar (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    content_id uuid REFERENCES contents(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    design_id uuid REFERENCES designs(id) ON DELETE CASCADE,
    platform content_platform,
    scheduled_at timestamptz NOT NULL,
    status calendar_status DEFAULT 'planned',
    notes text,
    color text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id)
);


-- =========================================================================
-- DOMAIN 9: DOCUMENT ENGINE (P0 MVP BASE)
-- =========================================================================
CREATE TABLE document_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    document_type document_type NOT NULL,
    template_content text NOT NULL,
    variables jsonb NOT NULL DEFAULT '[]',
    header_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    footer_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    cover_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    styles jsonb DEFAULT '{}',
    page_size text DEFAULT 'A4',
    page_orientation text DEFAULT 'portrait',
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    current_version integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz
);

CREATE TABLE document_template_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_template_id uuid NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
    version integer NOT NULL,
    template_content text NOT NULL,
    variables jsonb NOT NULL,
    styles jsonb DEFAULT '{}',
    change_note text,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (document_template_id, version)
);

CREATE TABLE documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id uuid REFERENCES document_templates(id) ON DELETE SET NULL,
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
    -- (CRM References diabaikan krn CRM masuk P1, atau null)
    company_id uuid,
    contact_id uuid,
    lead_id uuid,
    opportunity_id uuid,
    document_number text NOT NULL,
    title text NOT NULL,
    document_type document_type NOT NULL,
    status document_status DEFAULT 'draft',
    variables_data jsonb DEFAULT '{}',
    rendered_content text,
    issued_date date,
    valid_until date,
    total_amount numeric(15,2),
    currency_code text DEFAULT 'IDR',
    notes text,
    pdf_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    docx_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    preview_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    current_version integer DEFAULT 1,
    owner_id uuid REFERENCES auth.users(id),
    approver_id uuid REFERENCES auth.users(id),
    approved_at timestamptz,
    sent_at timestamptz,
    signed_at timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    deleted_at timestamptz
);

CREATE TABLE document_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version integer NOT NULL,
    rendered_content text,
    variables_data jsonb DEFAULT '{}',
    pdf_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    docx_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    change_note text,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (document_id, version)
);


-- =========================================================================
-- DOMAIN 11: SYSTEM
-- =========================================================================
CREATE TABLE notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'info',
    title text NOT NULL,
    body text,
    entity_type text,
    entity_id uuid,
    action_url text,
    is_read boolean DEFAULT false,
    read_at timestamptz,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name text NOT NULL,
    record_id uuid,
    action audit_action NOT NULL,
    old_data jsonb,
    new_data jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category text NOT NULL,
    key text NOT NULL,
    value jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (organization_id, category, key)
);

-- =========================================================================
-- INDEXES & RLS ACTIVATION (BASIC RULES)
-- =========================================================================
-- For brevity, create basic indices and ENABLE RLS for all tenant-scoped tables
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_profiles_user ON profiles(id);

CREATE INDEX idx_assets_org ON assets(organization_id);
CREATE INDEX idx_designs_org ON designs(organization_id);
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_contents_org ON contents(organization_id);
CREATE INDEX idx_templates_org ON templates(organization_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
