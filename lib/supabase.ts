import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from environment or expo config
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are not set. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file or app.config.js');
}

// Default Supabase client (for unauthenticated requests)
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Create a Supabase client with Clerk authentication
 * This allows Supabase RLS policies to work with Clerk's JWT
 */
export function createAuthenticatedSupabaseClient(clerkToken: string): SupabaseClient {
  return createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
}

