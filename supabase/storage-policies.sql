-- ============================================================
-- SUPABASE STORAGE — Buckets & Policies
-- Run this in the Supabase SQL Editor AFTER running schema.sql
-- ============================================================

-- Add cover_image_url column to campaigns (if not already present)
alter table campaigns add column if not exists cover_image_url text;

-- Create public storage buckets
insert into storage.buckets (id, name, public) values ('flyer-photos', 'flyer-photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('campaign-images', 'campaign-images', true) on conflict (id) do nothing;

-- Allow anyone to read from public buckets
create policy "Public read access" on storage.objects for select using (
  bucket_id in ('flyer-photos', 'avatars', 'campaign-images')
);

-- Allow authenticated users to upload to flyer-photos
create policy "Authenticated upload flyer-photos" on storage.objects for insert with check (
  bucket_id = 'flyer-photos' and auth.role() = 'authenticated'
);

-- Allow authenticated users to upload to avatars
create policy "Authenticated upload avatars" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own avatars
create policy "Authenticated update avatars" on storage.objects for update using (
  bucket_id = 'avatars' and auth.role() = 'authenticated'
);

-- Allow authenticated users to upload to campaign-images
create policy "Authenticated upload campaign-images" on storage.objects for insert with check (
  bucket_id = 'campaign-images' and auth.role() = 'authenticated'
);
