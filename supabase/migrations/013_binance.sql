-- 013_binance.sql
-- Add binance_id column to users so collaborators can enter their
-- Binance ID or email for payment processing.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS binance_id TEXT;
