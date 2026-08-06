alter table public.consultation_leads
  add column if not exists contact_method text,
  add column if not exists contact_value text,
  add column if not exists source_page text,
  add column if not exists source_url text,
  add column if not exists source_title text,
  add column if not exists source_image_url text,
  add column if not exists source_context jsonb not null default '{}'::jsonb,
  add column if not exists privacy_consent boolean not null default false,
  add column if not exists privacy_consent_at timestamptz;

comment on column public.consultation_leads.contact_method is
  'Preferred callback channel: whatsapp, telegram, or instagram.';
comment on column public.consultation_leads.source_context is
  'Structured page, article, university, scholarship, or program context captured at CTA click.';
comment on column public.consultation_leads.privacy_consent_at is
  'Client-provided KVKK/privacy consent timestamp.';

drop policy if exists "Allow valid website lead inserts"
  on public.consultation_leads;
create policy "Allow valid website lead inserts"
  on public.consultation_leads
  for insert
  to anon, authenticated
  with check (
    source = 'website'
    and status = 'new'
    and coalesce(trim(first_name), '') <> ''
    and coalesce(trim(last_name), '') <> ''
    and coalesce(trim(education), '') <> ''
    and (age is null or age between 12 and 80)
    and (
      (
        coalesce(trim(phone), '') <> ''
        and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
      )
      or
      (
        privacy_consent = true
        and privacy_consent_at is not null
        and contact_method in ('whatsapp', 'telegram', 'instagram')
        and char_length(trim(coalesce(contact_value, ''))) between 3 and 120
      )
    )
  );

create or replace function public.notify_telegram_consultation_lead()
returns trigger
language plpgsql
security definer
set search_path = public, private, extensions
as $$
declare
  cfg record;
  telegram_message text;
  request_id bigint;
begin
  select bot_token, chat_id, enabled
    into cfg
    from private.telegram_notification_config
   where id = true;

  if not found or not cfg.enabled or coalesce(trim(cfg.chat_id), '') = '' then
    return new;
  end if;

  telegram_message := concat(
    'درخواست مشاوره جدید ACCA', E'\n',
    'نام: ', trim(concat_ws(' ', new.first_name, new.last_name)), E'\n',
    'سن / مدرک / معدل: ', coalesce(new.age::text, '-'), ' · ',
      coalesce(new.education, '-'), ' · ', coalesce(new.gpa, '-'), E'\n',
    'راه ارتباطی: ', coalesce(new.contact_method, '-'), ' · ',
      coalesce(new.contact_value, new.phone, new.email, '-'), E'\n',
    'منبع: ', coalesce(new.source, 'website'), ' / ',
      coalesce(new.source_page, '-'), E'\n',
    'انتخاب کاربر: ', coalesce(new.source_title, '-'), E'\n',
    'لینک: ', coalesce(new.source_url, '-'), E'\n',
    'جزئیات: ', left(coalesce(new.source_context::text, '{}'), 1200), E'\n',
    'رضایت KVKK: ', case when new.privacy_consent then 'بله' else 'خیر' end
  );

  select net.http_post(
    url := 'https://api.telegram.org/bot' || cfg.bot_token || '/sendMessage',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'chat_id', cfg.chat_id,
      'text', telegram_message,
      'disable_web_page_preview', true
    )
  ) into request_id;

  return new;
end;
$$;

revoke all on function public.notify_telegram_consultation_lead() from public;

drop trigger if exists trigger_notify_telegram_consultation_lead
  on public.consultation_leads;
create trigger trigger_notify_telegram_consultation_lead
  after insert on public.consultation_leads
  for each row execute function public.notify_telegram_consultation_lead();
