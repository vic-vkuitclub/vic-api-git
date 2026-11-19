-- Read-only checks to run before docs/supabase-lab-access.sql.
-- These queries do not change Supabase data, schema, grants, or policies.

-- Confirm the expected tables exist and RLS remains enabled.
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('products', 'categories')
ORDER BY c.relname;

-- Review policies on the two lab tables. The access script stops if any exist.
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'categories')
ORDER BY tablename, policyname;

-- Check whether anon or PUBLIC already has table privileges on any public table.
-- The access script stops if grants exist outside products/categories.
SELECT table_schema, table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY table_name, grantee, privilege_type;

-- Inspect column grants on the two lab tables.
SELECT table_name, column_name, grantee, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name IN ('products', 'categories')
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY table_name, column_name, grantee, privilege_type;

-- Review the shared lab data before granting public CRUD access.
SELECT id, category_id, name, price, stock
FROM public.products
ORDER BY id;

SELECT id, name
FROM public.categories
ORDER BY id;
