
  create table "public"."files" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "size" bigint not null,
    "type" text not null,
    "storage_path" text not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "deleted_at" timestamp with time zone,
    "is_folder" boolean default false,
    "parent_id" uuid
      );


alter table "public"."files" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" text,
    "role" text not null default 'user'::text
      );


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX files_pkey ON public.files USING btree (id);

CREATE INDEX idx_files_deleted_at ON public.files USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);

CREATE INDEX idx_files_parent_id ON public.files USING btree (parent_id);

CREATE INDEX idx_files_user_id ON public.files USING btree (user_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."files" add constraint "files_pkey" PRIMARY KEY using index "files_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."files" add constraint "files_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.files(id) ON DELETE CASCADE not valid;

alter table "public"."files" validate constraint "files_parent_id_fkey";

alter table "public"."files" add constraint "files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."files" validate constraint "files_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'user'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

grant delete on table "public"."files" to "anon";

grant insert on table "public"."files" to "anon";

grant references on table "public"."files" to "anon";

grant select on table "public"."files" to "anon";

grant trigger on table "public"."files" to "anon";

grant truncate on table "public"."files" to "anon";

grant update on table "public"."files" to "anon";

grant delete on table "public"."files" to "authenticated";

grant insert on table "public"."files" to "authenticated";

grant references on table "public"."files" to "authenticated";

grant select on table "public"."files" to "authenticated";

grant trigger on table "public"."files" to "authenticated";

grant truncate on table "public"."files" to "authenticated";

grant update on table "public"."files" to "authenticated";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant references on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant trigger on table "public"."files" to "service_role";

grant truncate on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


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
