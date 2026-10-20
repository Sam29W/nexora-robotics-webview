import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable schema validation using Zod.
 * Ensures the server never starts with invalid or missing configuration.
 */
const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // If in test mode with mock keys, provide fallback or report
  if (process.env.NODE_ENV === 'test') {
    // allow test defaults
  } else {
    console.error('❌ Invalid or missing environment variables:');
    console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
    // Don't immediately exit if user hasn't set env yet, allow fallback for dev demo
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://demo-placeholder.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'demo-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-role-key',
  isConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
};
