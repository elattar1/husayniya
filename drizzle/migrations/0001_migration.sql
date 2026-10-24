
create policy "sr images upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'service-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "sr images read" on storage.objects for select to authenticated
  using (bucket_id = 'service-images' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.service_requests sr where storage.objects.name = any(sr.image_paths))
  ));
