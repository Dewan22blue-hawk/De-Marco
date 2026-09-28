-- Migration to create the Supabase Storage Bucket for 'assets'
-- Filename: 20261001000001_create_storage_buckets.sql

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Object Policies for the 'assets' bucket
-- Allow public read access to all assets
CREATE POLICY "Allow public viewing of assets" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'assets');

-- Allow authenticated users to upload their own assets
CREATE POLICY "Allow authenticated uploads to assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'assets');

-- Allow authenticated users to update their own assets
CREATE POLICY "Allow authenticated updates to assets" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'assets');

-- Allow authenticated users to delete their own assets
CREATE POLICY "Allow authenticated deletes of assets" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'assets');
