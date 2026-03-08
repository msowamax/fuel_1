-- ========================================================
-- LOGO SUPPORT & CLEANUP MIGRATION
-- ========================================================

-- 1. Add logo_url to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Cleanup Shifts (Optional: Drops the table if you want to completely remove it)
-- DROP TABLE IF EXISTS shifts;

-- 3. Remove any old triggers relating to shifts if they exist
-- DROP TRIGGER IF EXISTS on_ticket_created ON fuel_tickets;
