import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client, ready for when you replace the in-memory store.
 * Set these in app/.env.local (see .env.example):
 *   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
 * The anon key is safe in the app: row-level security (supabase/schema.sql)
 * decides what each signed-in phone number can read or write.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;
