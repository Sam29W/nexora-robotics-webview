import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Server-side Supabase Admin Client.
 * Initialized with SUPABASE_SERVICE_ROLE_KEY to bypass client RLS when executing
 * authenticated backend logic after token validation.
 *
 * SECURITY NOTICE: The service role key is NEVER exposed to browsers or mobile apps.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Public Supabase Client (for verifying user tokens against Supabase Auth)
 */
export const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});
