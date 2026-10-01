create table if not exists public.course_conversations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, student_id, teacher_id)
);

create table if not exists public.course_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.course_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists course_conversations_teacher_created_idx
  on public.course_conversations (teacher_id, created_at desc);
create index if not exists course_conversations_student_created_idx
  on public.course_conversations (student_id, created_at desc);
create index if not exists course_messages_conversation_created_idx
  on public.course_messages (conversation_id, created_at);

alter table public.course_conversations enable row level security;
alter table public.course_messages enable row level security;

grant select, insert on public.course_conversations to authenticated;
grant select, insert on public.course_messages to authenticated;

drop policy if exists "Enrolled students can see course teachers"
  on public.teacher_courses;
create policy "Enrolled students can see course teachers"
  on public.teacher_courses for select to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_id = teacher_courses.course_id
        and e.payment_status = 'paid'
    )
  );

drop policy if exists "Participants can read course conversations"
  on public.course_conversations;
create policy "Participants can read course conversations"
  on public.course_conversations for select to authenticated
  using (student_id = (select auth.uid()) or teacher_id = (select auth.uid()));

drop policy if exists "Enrolled students can contact their course teacher"
  on public.course_conversations;
create policy "Enrolled students can contact their course teacher"
  on public.course_conversations for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_id = course_conversations.course_id
        and e.payment_status = 'paid'
    )
    and exists (
      select 1
      from public.teacher_courses tc
      where tc.course_id = course_conversations.course_id
        and tc.teacher_id = course_conversations.teacher_id
    )
  );

drop policy if exists "Participants can read course messages"
  on public.course_messages;
create policy "Participants can read course messages"
  on public.course_messages for select to authenticated
  using (
    exists (
      select 1
      from public.course_conversations c
      where c.id = course_messages.conversation_id
        and ((select auth.uid()) = c.student_id or (select auth.uid()) = c.teacher_id)
    )
  );

drop policy if exists "Participants can send course messages"
  on public.course_messages;
create policy "Participants can send course messages"
  on public.course_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.course_conversations c
      where c.id = course_messages.conversation_id
        and ((select auth.uid()) = c.student_id or (select auth.uid()) = c.teacher_id)
    )
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'course_messages'
    )
  then
    alter publication supabase_realtime add table public.course_messages;
  end if;
end
$$;
