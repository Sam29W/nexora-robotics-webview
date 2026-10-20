-- ==============================================================================
-- NEXORA ROBOTICS - SUPABASE DATABASE MIGRATION
-- Migration 001: Profiles, Triggers, RLS, and Audit Logging
-- ==============================================================================

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    gender TEXT DEFAULT 'unspecified',
    hobbies TEXT[] DEFAULT '{}'::TEXT[],
    strengths TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexing
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);

-- 3. Automatic updated_at PostgreSQL Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4. Audit Log Table for tracking profile changes
CREATE TABLE IF NOT EXISTS public.profile_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profile_audit_user_id ON public.profile_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_performed_at ON public.profile_audit_logs(performed_at DESC);

-- 5. Audit Log Trigger Function
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profile_audit_logs (user_id, action, old_data, new_data, performed_at)
    VALUES (
        NEW.id,
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        timezone('utc'::text, now())
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_profile_audit ON public.profiles;
CREATE TRIGGER trigger_profile_audit
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_changes();

-- 6. Automatic Profile Creation upon Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, bio, gender, hobbies, strengths)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1),
            'Nexora Pioneer'
        ),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'Robotics Explorer and Nexora Pioneer.',
        'unspecified',
        ARRAY['Robotics', 'AI', 'Autonomous Systems'],
        ARRAY['Curiosity', 'Innovation']
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.profile_audit_logs;

-- RLS: Profile ownership constraints
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS: Audit logs are viewable only by the owner
CREATE POLICY "Users can view own audit logs"
    ON public.profile_audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 8. Storage bucket setup for avatars (optional auto-run or via dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Anyone can view avatars, authenticated users can upload their own
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload avatar" ON storage.objects;

CREATE POLICY "Public avatar access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users upload avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );
