-- Seed Data for Demarco Platform MVP
-- (Users and Organizations are now seeded in the 20261001000002_create_test_user.sql migration)
-- 2. Insert Campaigns
INSERT INTO campaigns (id, organization_id, name, code, objective, status)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Q4 Holiday Sale', 'CMP-Q4-01', 'conversion', 'active'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Brand Awareness Oct', 'CMP-AW-01', 'awareness', 'active'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Retargeting Segment A', 'CMP-RT-01', 'conversion', 'active'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'B2B Lead Gen', 'CMP-B2B-01', 'consideration', 'active')
ON CONFLICT DO NOTHING;

-- 3. Insert Designs
INSERT INTO designs (id, organization_id, name, design_type, format_code, width, height, status, created_by)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Promo Poster 1', 'poster', 'A4', 2480, 3508, 'approved', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'IG Story Sale', 'social_story', 'IG_STORY', 1080, 1920, 'approved', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Web Banner Ad', 'banner', 'WEB_BANNER', 1200, 628, 'draft', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;
