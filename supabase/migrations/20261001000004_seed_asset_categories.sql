-- =========================================================================
-- ASSET CATEGORIES SEEDING (PHASE 04)
-- =========================================================================

-- Helper to insert categories safely for any organization (or as system defaults)
-- For MVP, we'll insert them without organization_id first as 'system' categories
-- if your schema allows it, or we'll need to map them to the default org.

INSERT INTO asset_categories (organization_id, name, slug, is_system, sort_order)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Logo', 'logo', true, 1),
    ('00000000-0000-0000-0000-000000000001', 'Background', 'background', true, 2),
    ('00000000-0000-0000-0000-000000000001', 'Product', 'product', true, 3),
    ('00000000-0000-0000-0000-000000000001', 'Photo', 'photo', true, 4),
    ('00000000-0000-0000-0000-000000000001', 'Icon', 'icon', true, 5),
    ('00000000-0000-0000-0000-000000000001', 'Illustration', 'illustration', true, 6),
    ('00000000-0000-0000-0000-000000000001', 'Pattern', 'pattern', true, 7),
    ('00000000-0000-0000-0000-000000000001', 'Partner', 'partner', true, 8),
    ('00000000-0000-0000-0000-000000000001', 'Certificate', 'certificate', true, 9),
    ('00000000-0000-0000-0000-000000000001', 'Marketing', 'marketing', true, 10);

-- If your schema doesn't have a unique constraint on slug yet:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_categories_slug_org ON asset_categories(slug, organization_id) WHERE organization_id IS NULL;
