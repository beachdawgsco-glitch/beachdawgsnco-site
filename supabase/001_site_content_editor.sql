-- Beach Dawgs site editor: content table, save RPC, photo bucket, backup export of content.
create table if not exists public.beach_content(
  key text primary key check (key in ('site','packages','faq','gallery')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.beach_content enable row level security;
drop policy if exists beach_content_public_read on public.beach_content;
create policy beach_content_public_read on public.beach_content for select to anon, authenticated using (true);
revoke insert, update, delete on public.beach_content from anon, authenticated;

create or replace function beach_private.save_content(k text, d jsonb)
returns void language plpgsql security definer set search_path to '' as $$
declare r text:=beach_private.current_role();
begin
 if r is null then raise exception 'Staff access and MFA required';end if;
 if k not in ('site','packages','faq','gallery') then raise exception 'Unknown content section';end if;
 if r='staff' and k<>'gallery' then raise exception 'Staff can only manage gallery photos';end if;
 if jsonb_typeof(d) is distinct from 'object' or octet_length(d::text)>200000 then raise exception 'Invalid content';end if;
 insert into public.beach_content(key,data,updated_at,updated_by) values(k,d,now(),auth.uid())
  on conflict(key) do update set data=excluded.data,updated_at=now(),updated_by=auth.uid();
 insert into public.beach_audit(actor,action) values(auth.uid(),'content_'||k);
end $$;
create or replace function public.beach_save_content(k text, d jsonb)
returns void language sql set search_path to '' as $$select beach_private.save_content(k,d)$$;
revoke all on function beach_private.save_content(text,jsonb) from public, anon;
revoke all on function public.beach_save_content(text,jsonb) from public, anon;
grant execute on function beach_private.save_content(text,jsonb) to authenticated;
grant execute on function public.beach_save_content(text,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('site-media','site-media',true,10485760,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists site_media_insert on storage.objects;
create policy site_media_insert on storage.objects for insert to authenticated
 with check (bucket_id='site-media' and beach_private.current_role() is not null);
drop policy if exists site_media_delete on storage.objects;
create policy site_media_delete on storage.objects for delete to authenticated
 using (bucket_id='site-media' and beach_private.current_role() in ('owner','manager'));

create or replace function beach_private.export_records()
returns jsonb language plpgsql security definer set search_path to '' as $$
begin
 if beach_private.current_role() is distinct from 'owner' then raise exception 'Owner access and MFA required';end if;
 return jsonb_build_object('profiles',coalesce((select jsonb_agg(to_jsonb(p)) from public.beach_profiles p),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(to_jsonb(v)) from public.beach_vehicles v),'[]'::jsonb),
 'privacy_requests',coalesce((select jsonb_agg(to_jsonb(r)) from public.beach_privacy_requests r),'[]'::jsonb),
 'content',coalesce((select jsonb_agg(jsonb_build_object('key',c.key,'data',c.data)) from public.beach_content c),'[]'::jsonb));
end $$;
