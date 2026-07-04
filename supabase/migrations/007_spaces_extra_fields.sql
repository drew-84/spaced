-- Migration 007: additional space fields collected by the Ofrecer wizard
-- Adds the columns the 7-step form gathers but that 004 never stored:
--   • full address + region (steps 2)   • availability slots + min booking (step 3)
--   • video URLs (step 4)                • capacity + house rules (step 6)
-- All non-sensitive, so safe on the public-read spaces table.

alter table public.spaces
  add column if not exists address         text,
  add column if not exists region          text,
  add column if not exists availability     text[] default '{}',
  add column if not exists min_booking_min  int,
  add column if not exists max_capacity     int,
  add column if not exists house_rules      text,
  add column if not exists video_urls       text[] default '{}';
