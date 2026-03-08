-- Supabase Security Consolidation Script (Fixed Version)
-- Optimized for Supabase/PostgreSQL 14+

-- 1. Enable Row Level Security (RLS) on all core tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fuel_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fuel_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Fix search path for security-critical functions (Safer Method)
-- This uses a DO block to avoid syntax errors if the function or PG version differs.
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
             WHERE pg_proc.proname = 'process_fuel_deduction' AND pg_namespace.nspname = 'public') THEN
    ALTER FUNCTION public.process_fuel_deduction() SET search_path = public;
  END IF;
END $$;

-- 3. Cleanup: Remove the legacy shifts table
DROP TABLE IF EXISTS public.shifts CASCADE;

-- 4. Baseline Security: Lock down tables
-- Since no specific policies are defined here, and RLS is enabled, 
-- direct public (anon) access is effectively blocked. 
-- The backend (service_role) will continue to work normally.

-- Done! These changes address the high-severity security warnings.
