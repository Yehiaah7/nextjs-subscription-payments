-- Ensure avatar storage policies match app behavior:
-- - uploads go to avatars/<auth.uid()>/avatar.jpg
-- - reads use public URLs

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatars_authenticated_insert_own" on storage.objects;
create policy "avatars_authenticated_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_authenticated_update_own" on storage.objects;
create policy "avatars_authenticated_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_authenticated_delete_own" on storage.objects;
create policy "avatars_authenticated_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (
    owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);
