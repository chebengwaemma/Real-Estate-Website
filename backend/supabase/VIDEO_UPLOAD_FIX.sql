-- =============================================================================
-- VIDEO_UPLOAD_FIX.sql
-- Run once in Supabase Dashboard → SQL Editor (or via CLI).
-- Adds a public bucket for admin-uploaded video files (MP4 / WebM).
-- Thumbnails stay in the existing `videos` image bucket.
-- Safe to re-run.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'video-files',
  'video-files',
  true,
  1048576000,
  array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files'));

drop policy if exists "media_admin_write" on storage.objects;
create policy "media_admin_write"
  on storage.objects for insert
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files')
    and public.is_admin()
  );

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files')
    and public.is_admin()
  )
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files')
    and public.is_admin()
  );

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers', 'video-files')
    and public.is_admin()
  );

select id, name, public, file_size_limit from storage.buckets
where id in ('videos', 'video-files', 'sponsor-logos', 'blog-covers')
order by id;
