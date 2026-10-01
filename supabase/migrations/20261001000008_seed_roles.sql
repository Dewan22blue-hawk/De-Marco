-- Insert Member role
INSERT INTO roles (id, organization_id, name, display_name, is_system)
VALUES ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'member', 'Member', true)
ON CONFLICT DO NOTHING;

-- Insert Owner role
INSERT INTO roles (id, organization_id, name, display_name, is_system)
VALUES ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'owner', 'Owner', true)
ON CONFLICT DO NOTHING;
