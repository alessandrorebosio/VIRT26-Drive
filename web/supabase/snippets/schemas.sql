create table public.files (
  id uuid not null default gen_random_uuid (),
  name text not null,
  size bigint not null,
  type text not null,
  storage_path text not null,
  user_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  deleted_at timestamp with time zone null,
  is_folder boolean null default false,
  parent_id uuid null,
  constraint files_pkey primary key (id),
  constraint files_parent_id_fkey foreign KEY (parent_id) references files (id) on delete CASCADE,
  constraint files_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  username text null,
  role text not null default 'user'::text,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check ((role = any (array['admin'::text, 'user'::text])))
) TABLESPACE pg_default;

create index idx_files_parent_id on public.files(parent_id);
create index idx_files_user_id on public.files(user_id);
create index idx_files_deleted_at on public.files(deleted_at) where deleted_at is not null;

create policy "Users can delete their own files"
  on "public"."files"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));

create policy "Users can insert their own files"
  on "public"."files"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));

create policy "Users can update their own files"
  on "public"."files"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id));

create policy "Users can view their own files"
  on "public"."files"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));

create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = id));

create policy "Users can only update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));

create policy "Users see themselves"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));
