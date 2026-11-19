import { readFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';

// Server only. Ship both the encrypted config and .lab/config.key with the app.
export function loadPublicConfig() {
  try {
    const key = Buffer.from(
      readFileSync(new URL('../.lab/config.key', import.meta.url), 'utf8').trim(),
      'base64',
    );
    const payload = JSON.parse(
      readFileSync(new URL('./public-config.enc.json', import.meta.url), 'utf8'),
    );

    if (key.length !== 32 || payload.version !== 1 || payload.algorithm !== 'aes-256-gcm') {
      throw new Error('Unsupported configuration format');
    }

    const decipher = createDecipheriv(
      payload.algorithm,
      key,
      Buffer.from(payload.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, 'base64')),
      decipher.final(),
    ]);
    const config = JSON.parse(plaintext.toString('utf8'));

    const url = new URL(config.SUPABASE_URL);
    if (
      url.protocol !== 'https:' ||
      typeof config.SUPABASE_PUBLISHABLE_KEY !== 'string' ||
      !config.SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_') ||
      !Number.isSafeInteger(config.LAB_CATEGORY_ID) ||
      config.LAB_CATEGORY_ID <= 0
    ) {
      throw new Error('Invalid configuration values');
    }

    return Object.freeze({
      SUPABASE_URL: config.SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY: config.SUPABASE_PUBLISHABLE_KEY,
      LAB_CATEGORY_ID: config.LAB_CATEGORY_ID,
    });
  } catch {
    throw new Error(
      'Không đọc được cấu hình lab. Kiểm tra config/public-config.enc.json và .lab/config.key.',
    );
  }
}
