import { readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function discoverMembers(rootDirectory) {
  const codeapiDirectory = path.resolve(rootDirectory, 'codeapi');
  let entries;

  try {
    const rootStat = await lstat(codeapiDirectory);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) return [];
    entries = await readdir(codeapiDirectory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const members = [];
  for (const entry of entries) {
    if (!SLUG_PATTERN.test(entry.name)) continue;

    const memberDirectory = path.join(codeapiDirectory, entry.name);
    const publicDirectory = path.join(memberDirectory, 'public');
    const indexFile = path.join(publicDirectory, 'index.html');
    try {
      const memberStat = await lstat(memberDirectory);
      const publicStat = await lstat(publicDirectory);
      const indexStat = await lstat(indexFile);
      if (!memberStat.isDirectory() || memberStat.isSymbolicLink()) continue;
      if (!publicStat.isDirectory() || publicStat.isSymbolicLink()) continue;
      if (!indexStat.isFile() || indexStat.isSymbolicLink()) continue;
      // Dùng nguyên tên folder làm tên hiển thị trên trang chủ.
      members.push({ slug: entry.name, name: entry.name });
    } catch {
      // A partial or invalid member folder is omitted without breaking the gallery.
    }
  }

  return members.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function loadMemberRouters(members, rootDirectory, context) {
  const loaded = new Map();
  for (const member of members) {
    const backendDirectory = path.join(rootDirectory, 'codeapi', member.slug, 'backend');
    const routesFile = path.join(backendDirectory, 'routes.js');
    try {
      const backendStat = await lstat(backendDirectory);
      const stat = await lstat(routesFile);
      if (!backendStat.isDirectory() || backendStat.isSymbolicLink() || !stat.isFile() || stat.isSymbolicLink()) {
        loaded.set(member.slug, { error: 'Missing backend/routes.js' });
        continue;
      }
      const moduleUrl = `${pathToFileURL(routesFile).href}?loaded=${Date.now()}`;
      const routeModule = await import(moduleUrl);
      if (typeof routeModule.createRouter !== 'function') {
        throw new Error('Expected an exported createRouter(context) function');
      }
      loaded.set(member.slug, { router: routeModule.createRouter(context) });
    } catch (error) {
      console.error(`[member:${member.slug}] route module could not be loaded: ${error.message}`);
      loaded.set(member.slug, { error: 'Backend route module could not be loaded' });
    }
  }
  return loaded;
}
