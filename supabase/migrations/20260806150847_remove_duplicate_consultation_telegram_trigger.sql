drop trigger if exists trigger_notify_telegram_new_consultation_lead
  on public.consultation_leads;

drop function if exists public.notify_telegram_new_consultation_lead();
