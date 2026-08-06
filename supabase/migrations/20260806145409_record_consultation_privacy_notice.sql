alter table public.consultation_leads
  add column if not exists privacy_notice_version text,
  add column if not exists privacy_notice_shown_at timestamptz;

comment on column public.consultation_leads.privacy_notice_version is
  'Version of the consultation-form privacy notice shown before submission.';
comment on column public.consultation_leads.privacy_notice_shown_at is
  'Client-provided timestamp for when the consultation-form privacy notice was shown.';

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
        contact_method in ('whatsapp', 'telegram', 'instagram')
        and char_length(trim(coalesce(contact_value, ''))) between 3 and 120
        and (
          (
            privacy_consent = true
            and privacy_consent_at is not null
          )
          or
          (
            privacy_consent = false
            and privacy_consent_at is null
            and privacy_notice_version = 'consultation-form-notice-v1'
            and privacy_notice_shown_at between now() - interval '1 day' and now() + interval '5 minutes'
          )
        )
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
  privacy_record text;
begin
  select bot_token, chat_id, enabled
    into cfg
    from private.telegram_notification_config
   where id = true;

  if not found or not cfg.enabled or coalesce(trim(cfg.chat_id), '') = '' then
    return new;
  end if;

  privacy_record := case
    when new.privacy_notice_shown_at is not null then
      'اطلاعیه نمایش داده شد (' || coalesce(new.privacy_notice_version, 'بدون نسخه') || ')'
    when new.privacy_consent then 'رضایت ثبت شد'
    else 'نامشخص'
  end;

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
    'حریم خصوصی فرم: ', privacy_record
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

revoke all on function public.notify_telegram_consultation_lead()
  from public, anon, authenticated;

revoke all on table public.consultation_leads
  from anon, authenticated;
grant insert on table public.consultation_leads
  to anon, authenticated;
