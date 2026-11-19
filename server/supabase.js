import { createClient } from '@supabase/supabase-js';
import { loadPublicConfig } from '../config/load-config.mjs';

let client;

export function getSupabase() {
  if (client) return client;

  const config = loadPublicConfig();
  client = createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export function getLabContext() {
  return {
    getSupabase,
    get LAB_CATEGORY_ID() {
      return loadPublicConfig().LAB_CATEGORY_ID;
    },
  };
}

export async function checkSupabaseReadOnly() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('products').select('id').limit(1);
  if (error) {
    return { ok: false, code: error.code || 'SUPABASE_QUERY_FAILED' };
  }
  return { ok: true, rows: Array.isArray(data) ? data.length : 0 };
}
