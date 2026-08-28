-- Sports game cover images (upload or external URL stored in image_url)
alter table public.sports_games
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sports-games',
  'sports-games',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "Public read media buckets" on storage.objects;
create policy "Public read media buckets"
  on storage.objects for select
  using (bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files', 'sports-games'));

drop policy if exists "Admins upload media buckets" on storage.objects;
create policy "Admins upload media buckets"
  on storage.objects for insert
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files', 'sports-games')
    and public.is_admin()
  );

drop policy if exists "Admins update media buckets" on storage.objects;
create policy "Admins update media buckets"
  on storage.objects for update
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files', 'sports-games')
    and public.is_admin()
  )
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files', 'sports-games')
    and public.is_admin()
  );

drop policy if exists "Admins delete media buckets" on storage.objects;
create policy "Admins delete media buckets"
  on storage.objects for delete
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files', 'sports-games')
    and public.is_admin()
  );
