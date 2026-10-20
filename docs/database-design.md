# Database Design and Security Specification

This document details the PostgreSQL schema, constraints, triggers, indexes, and Row-Level Security (RLS) policies implemented on Supabase.

---

## 1. Relational Schema Architecture

### `public.profiles` Table
Stores extended user profile attributes. Every record maps directly to an authenticated identity in `auth.users`.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    gender TEXT DEFAULT 'unspecified' CHECK (gender IN ('male', 'female', 'non-binary', 'other', 'unspecified')),
    hobbies TEXT[] DEFAULT '{}'::TEXT[],
    strengths TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### `public.profile_audit_logs` Table
Maintains an immutable historical record of all profile modifications executed at the database level.

```sql
CREATE TABLE IF NOT EXISTS public.profile_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

---

## 2. PostgreSQL Triggers and Functions

### A. Automatic `updated_at` Timestamp Trigger
To ensure the `updated_at` column is always accurate regardless of whether changes originated from the website, mobile app, or direct SQL:

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
```

> **Why this matters for senior developers:** Unlike relying on client clocks (which can be manipulated or skewed) or backend middleware, a PostgreSQL `BEFORE UPDATE` trigger guarantees data integrity directly inside the ACID transaction.

### B. Audit Log Trigger
Records state diffs automatically whenever a row is modified:

```sql
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

CREATE TRIGGER trigger_profile_audit
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_changes();
```

### C. Automatic Profile Provisioning Trigger
Automatically provisions a `profiles` entry when a new user completes signup in Supabase Auth:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, bio, gender, hobbies, strengths)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Row-Level Security (RLS) Policies

Row-Level Security guarantees that authenticated clients can only view and mutate their own records:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_audit_logs ENABLE ROW LEVEL SECURITY;

-- Select own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Insert own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Update own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- View own audit history
CREATE POLICY "Users can view own audit logs"
    ON public.profile_audit_logs FOR SELECT
    USING (auth.uid() = user_id);
```

---

## 4. Performance Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_audit_user_id ON public.profile_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_performed_at ON public.profile_audit_logs(performed_at DESC);
```
