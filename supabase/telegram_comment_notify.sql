-- =============================================================================
-- Telegram notification for every new website comment.
--
-- Mirrors the consultation-lead → Telegram flow: a comment is inserted into
-- Supabase (acca_comments) from the site, and Supabase forwards it to the
-- Telegram bot. This version does it entirely inside Postgres using pg_net, so
-- there is nothing to deploy — just run this script once.
--
-- ── ONE-TIME SETUP ──────────────────────────────────────────────────────────
-- 1) Store the bot credentials in Supabase Vault (Dashboard → Project Settings
--    → Vault → "New secret"). Use the SAME bot/chat as the lead form:
--        Name: telegram_bot_token   Value: 123456:ABC-your-bot-token
--        Name: telegram_chat_id     Value: -1001234567890   (chat or channel id)
-- 2) Run this whole file in the SQL Editor (after acca_community.sql).
--
-- Plain-text message (no parse_mode) so visitor text can never break or inject
-- into the message. pg_net sends the request asynchronously — it never slows
-- down or blocks the comment insert.
-- =============================================================================

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_comment_to_telegram()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  bot_token text;
  chat_id   text;
  message   text;
begin
  select decrypted_secret into bot_token
    from vault.decrypted_secrets where name = 'telegram_bot_token' limit 1;
  select decrypted_secret into chat_id
    from vault.decrypted_secrets where name = 'telegram_chat_id' limit 1;

  -- If the secrets are not set yet, skip silently (never block the insert).
  if bot_token is null or chat_id is null then
    return new;
  end if;

  message :=
    '💬 نظر جدید روی سایت آکا' || E'\n\n' ||
    '👤 نام: '   || coalesce(new.name, '-')  || E'\n' ||
    '✉️ ایمیل: ' || coalesce(new.email, '-') || E'\n' ||
    '🎓 وضعیت: ' || coalesce(new.role, '-') || ' · ' || coalesce(new.location, '-') || E'\n' ||
    '📄 محل: '   || coalesce(new.entity_type, '-') || ' / ' || coalesce(new.entity_slug, '-') || E'\n\n' ||
    '🗨️ متن: '  || left(coalesce(new.body, ''), 1500);

  perform net.http_post(
    url     := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object(
                 'chat_id', chat_id,
                 'text', message,
                 'disable_web_page_preview', true
               )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_comment_to_telegram on public.acca_comments;
create trigger trg_notify_comment_to_telegram
  after insert on public.acca_comments
  for each row execute function public.notify_comment_to_telegram();

-- Quick test (optional): inserting a row should ping Telegram.
-- insert into public.acca_comments (client_id, entity_type, entity_slug, name, email, role, location, body, lang)
-- values (gen_random_uuid(), 'blog', 'test', 'تست', 't@example.com', 'student', 'turkey', 'پیام تست تلگرام', 'fa');
