-- =============================================================================
-- Telegram notification for every new website comment.
--
-- Reuses the EXACT mechanism already powering consultation-lead notifications:
-- it reads the same bot credentials from `private.telegram_notification_config`
-- and sends via pg_net (net.http_post). So it goes to the SAME Telegram bot —
-- no new secrets, no extra setup. Just run this once (after acca_community.sql).
-- =============================================================================

create or replace function public.notify_telegram_new_comment()
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
    'نظر جدید روی سایت ACCA', E'\n',
    'نام: ', coalesce(new.name, '-'), E'\n',
    'ایمیل: ', coalesce(new.email, '-'), E'\n',
    'وضعیت: ', coalesce(new.role, '-'), ' · ', coalesce(new.location, '-'), E'\n',
    'محل: ', coalesce(new.entity_type, '-'), ' / ', coalesce(new.entity_slug, '-'), E'\n',
    'متن: ', left(coalesce(new.body, ''), 1500), E'\n',
    'زمان ثبت: ', to_char(new.created_at at time zone 'Europe/Istanbul', 'YYYY-MM-DD HH24:MI')
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

drop trigger if exists trigger_notify_telegram_new_comment on public.acca_comments;
create trigger trigger_notify_telegram_new_comment
  after insert on public.acca_comments
  for each row execute function public.notify_telegram_new_comment();
