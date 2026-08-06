# Tracking and retargeting runbook

This project loads measurement and advertising tags only after an explicit
visitor choice. The consultation consent checkbox is only for processing the
consultation request; it is not advertising consent.

## Runtime configuration

Set these variables in the Vercel project and redeploy:

```text
VITE_GTM_ID=GTM-MGFQ7ZGX
VITE_META_PIXEL_ID=<Meta Dataset / Pixel ID>
```

`VITE_META_PIXEL_ID` is an identifier, not an access token. Never expose a Meta
Conversions API access token in a `VITE_*` variable or client-side code.

Meta Pixel is installed directly by `src/lib/analytics.js`. Do not also add a
Meta base tag to GTM, because that would double-fire browser events. GTM remains
the delivery mechanism for Google Analytics and can consume the custom events
listed below.

## Consent behaviour

- Before a visitor makes a choice, neither GTM nor Meta Pixel makes a network
  request. Google consent mode defaults are queued locally as denied.
- **Accept all** enables analytics and marketing tags.
- **Analytics only** enables GTM/GA, but keeps Meta Pixel disabled.
- **Essential only** keeps both categories disabled.
- A persistent Privacy Settings button lets a visitor change or withdraw the
  choice. Withdrawal updates Google consent and stops new marketing events;
  tags already loaded cannot be unloaded from the current document, so the page
  reloads after a material consent change.
- The stored choice is versioned. Increment the consent version in
  `src/lib/analytics.js` when the disclosed purposes or vendors materially
  change so visitors are asked again.

## Event contract

Events intentionally contain no name, phone number, social username, email,
age, GPA, education, free text, or raw query string.

| Site action | dataLayer event | Meta browser event | When it fires |
| --- | --- | --- | --- |
| Route view | `page_view` | `PageView` | Every SPA route view after relevant consent |
| Program/university/content view | `view_content` | `ViewContent` | High-intent content pages |
| Consultation CTA | `consultation_open` | custom event | Modal open |
| First form interaction | `lead_form_start` | custom event | Once per modal open |
| WhatsApp/phone/email link | `outbound_contact` | `Contact` | Delegated outbound click |
| Instagram link | `instagram_click` | `InstagramClick` | Delegated outbound click |
| Telegram link | `telegram_click` | `TelegramClick` | Delegated outbound click |
| Successful lead insert | `generate_lead` | `Lead` | Only after Supabase returns success |

The lead submission creates a unique `event_id`, stores it in
`source_context.event_id`, and sends the same ID to the browser-side `Lead`
event. A future server-side Conversions API integration must reuse this exact ID
for browser/server deduplication.

## Meta setup and QA

1. In Meta Events Manager, create or select the ACCA EDU Dataset/Pixel and copy
   its numeric ID to `VITE_META_PIXEL_ID`.
2. Connect the Dataset to the intended ad account, verify `accaco.com`, and
   ensure the business, billing method, and ad account are active.
3. Redeploy, then test a fresh private-browser session:
   - Before consent: no request to `googletagmanager.com` or
     `connect.facebook.net`.
   - Analytics only: GTM loads; Meta does not.
   - Accept all: Meta Pixel Helper and Events Manager Test Events show one
     `PageView`, then the relevant funnel events.
   - A rejected/failed form must not send `Lead`; a successful form sends one.
4. Confirm GA4/GTM mappings for the dataLayer event names above.

If GTM maps the custom `page_view` dataLayer event to GA4, disable the GA4
configuration tag's automatic initial page view (or exclude the first custom
event). Otherwise the initial route can be counted twice.

Recommended initial Custom Audiences:

- all consented website visitors, 180 days;
- `ViewContent` visitors, 30 days;
- `Contact` visitors, 30 days;
- `consultation_open` without `Lead`, 30 days;
- exclude `Lead` visitors, 180 days, from prospecting and unfinished-lead ads.

Do not build audience rules from age, education, or GPA submitted in the form.

## Leads Centre is a separate system

Browser Pixel and Conversions API events improve attribution, optimisation, and
audience building; they do not import old conversations or Supabase rows into
Meta Leads Centre. Direct WhatsApp links also bypass the consultation form, so a
conversation can exist without a website lead row.

If the operating team needs every WhatsApp conversation in one pipeline, add a
separate supported WhatsApp Business/CRM integration and define ownership,
deduplication, and retention there. Do not infer a lead record merely from a
Pixel click.

## Future server-side CAPI phase

Implement Conversions API only in a protected server/Edge Function with its
access token stored as a server secret. Add server-side validation, abuse
protection and rate limiting before exposing a public submit endpoint. Send a
server-side `Lead` only after the lead is durably stored, use the saved
`event_id` for deduplication, and make notification/CAPI failures non-blocking
so they cannot roll back lead capture.
