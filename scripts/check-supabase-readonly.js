import { checkSupabaseReadOnly } from '../server/supabase.js';

try {
  const result = await checkSupabaseReadOnly();
  if (!result.ok) {
    console.error(`Supabase read-only check failed (code: ${result.code}).`);
    process.exitCode = 1;
  } else {
    console.log(`Supabase read-only check passed; products rows returned: ${result.rows}.`);
  }
} catch {
  console.error('Supabase read-only check failed; config or network is unavailable.');
  process.exitCode = 1;
}
