import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

// This is a "cache-busting" technique. By adding a random header,
// we force the Supabase client to re-fetch the schema, bypassing any stale cache.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-cache-buster': Date.now().toString() },
  },
});
