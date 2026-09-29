-- Pastikan ekstensi pgcrypto aktif untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Buat user Marcus Vance (marcus@demarco.studio)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'marcus@demarco.studio',
  crypt('admin123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', '', '', '', ''
)
ON CONFLICT (id) DO UPDATE SET 
  encrypted_password = EXCLUDED.encrypted_password;

-- 2. Buat user Admin (admin@demarco.studio)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@demarco.studio',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', '', '', '', ''
)
ON CONFLICT (id) DO UPDATE SET 
  encrypted_password = EXCLUDED.encrypted_password;

-- 3. Setup Organisasi, Role, dan Membership sesuai ERD (Multi-tenant)

-- Buat organisasi default
INSERT INTO organizations (id, name, slug, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'De-Marco Studio', 'demarco-studio', true)
ON CONFLICT (id) DO NOTHING;

-- Buat role default untuk organisasi (misal system admin)
INSERT INTO roles (id, organization_id, name, display_name, is_system)
VALUES ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'admin', 'Administrator', true)
ON CONFLICT (id) DO NOTHING;

-- Tambahkan profil untuk admin baru
INSERT INTO profiles (id, email, full_name, default_organization_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@demarco.studio', 'Administrator', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  default_organization_id = EXCLUDED.default_organization_id;

-- Tambahkan profil untuk marcus
INSERT INTO profiles (id, email, full_name, default_organization_id)
VALUES ('00000000-0000-0000-0000-000000000000', 'marcus@demarco.studio', 'Marcus Vance', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  default_organization_id = EXCLUDED.default_organization_id;

-- Tambahkan admin dan marcus sebagai member organisasi
INSERT INTO organization_members (id, organization_id, user_id, role_id, status)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'active'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'active')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Supabase Auth Identities (WAJIB untuk login menggunakan email/password)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000000', 'marcus@demarco.studio')::jsonb, 'email', now(), now(), now()),
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', format('{"sub":"%s","email":"%s"}', '11111111-1111-1111-1111-111111111111', 'admin@demarco.studio')::jsonb, 'email', now(), now(), now())
ON CONFLICT DO NOTHING;
