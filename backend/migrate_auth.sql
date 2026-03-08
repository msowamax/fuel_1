-- 1. Insert existing users into auth.users to preserve IDs and passwords
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
)
SELECT 
    id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    email,
    password, 
    now(),
    created_at,
    updated_at,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', name, 'role', role, 'station_name', station_name),
    false
FROM public.users
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password;

-- 2. Create the Trigger Function to auto-sync new Auth signups to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, password, name, role, station_name, is_approved)
    VALUES (
        NEW.id,
        NEW.email,
        'supabase_auth_managed', -- Dummy password to satisfy NOT NULL constraint
        COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
        COALESCE(NEW.raw_user_meta_data->>'station_name', 'Unknown'),
        true -- Default to true as per existing logic
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Clean up any orphaned rows in public.users to allow the Foreign Key
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 5. Add the Foreign Key constraint cleanly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;
