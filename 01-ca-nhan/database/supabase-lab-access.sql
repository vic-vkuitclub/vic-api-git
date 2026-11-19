-- VIC API & Git Lab: grants and RLS for shared lab data.
-- Review this file before running it once in Supabase SQL Editor.
-- This script does not create/drop tables, alter schema/data, seed/reset rows,
-- or enable/disable RLS. It changes the two named tables and grants schema usage to anon.
--
-- Public access is intentional: anyone with the project URL and publishable key
-- can use the Data API as role `anon` to read/write products and read categories.
-- Use only when these tables contain lab data that may be changed by the class.
--
-- Before running, first inspect the project with docs/supabase-lab-preflight.sql.
-- This script aborts if either table has any existing RLS policy or if anon/PUBLIC
-- already has table privileges on another public table. Review manually; do not
-- drop policies or change grants elsewhere to make the script pass.

BEGIN;

DO $preflight$
DECLARE
  products_rls boolean;
  categories_rls boolean;
BEGIN
  IF to_regclass('public.products') IS NULL THEN
    RAISE EXCEPTION 'Required table public.products was not found; no changes applied';
  END IF;

  IF to_regclass('public.categories') IS NULL THEN
    RAISE EXCEPTION 'Required table public.categories was not found; no changes applied';
  END IF;

  IF to_regrole('anon') IS NULL OR to_regrole('authenticated') IS NULL THEN
    RAISE EXCEPTION 'Expected Supabase roles anon/authenticated were not found; no changes applied';
  END IF;

  SELECT relrowsecurity INTO products_rls
  FROM pg_class WHERE oid = 'public.products'::regclass;
  SELECT relrowsecurity INTO categories_rls
  FROM pg_class WHERE oid = 'public.categories'::regclass;

  IF NOT products_rls OR NOT categories_rls THEN
    RAISE EXCEPTION 'RLS must already be enabled on both tables; no changes applied';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('products', 'categories')
  ) THEN
    RAISE EXCEPTION 'Existing RLS policies found on products/categories. Review them manually; no changes applied';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_privileges
    WHERE table_schema = 'public'
      AND table_name NOT IN ('products', 'categories')
      AND grantee IN ('anon', 'PUBLIC')
      AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
  ) THEN
    RAISE EXCEPTION 'anon/PUBLIC already has table privileges on another public table. Review first; no changes applied';
  END IF;
END
$preflight$;

-- Remove broad/table and column grants only from these two lab tables.
-- This also avoids exposing TRUNCATE, REFERENCES, TRIGGER, id writes, or
-- category_id changes to the public client roles.
REVOKE ALL PRIVILEGES ON TABLE public.products, public.categories
  FROM PUBLIC, anon, authenticated;

REVOKE SELECT (id, category_id, name, price, stock),
       INSERT (id, category_id, name, price, stock),
       UPDATE (id, category_id, name, price, stock),
       REFERENCES (id, category_id, name, price, stock)
  ON TABLE public.products FROM PUBLIC, anon, authenticated;

REVOKE SELECT (id, name),
       INSERT (id, name),
       UPDATE (id, name),
       REFERENCES (id, name)
  ON TABLE public.categories FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon;

-- Read products; create rows without choosing an id; only edit name/price/stock;
-- delete rows. RLS policies below allow these actions on every product row.
GRANT SELECT, DELETE ON TABLE public.products TO anon;
GRANT INSERT (category_id, name, price, stock) ON TABLE public.products TO anon;
GRANT UPDATE (name, price, stock) ON TABLE public.products TO anon;

-- Categories are lookup data for the lab and remain read-only.
GRANT SELECT ON TABLE public.categories TO anon;

CREATE POLICY vic_lab_products_anon_select
  ON public.products FOR SELECT TO anon USING (true);

CREATE POLICY vic_lab_products_anon_insert
  ON public.products FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY vic_lab_products_anon_update
  ON public.products FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY vic_lab_products_anon_delete
  ON public.products FOR DELETE TO anon USING (true);

CREATE POLICY vic_lab_categories_anon_select
  ON public.categories FOR SELECT TO anon USING (true);

COMMIT;

-- After applying, verify with a publishable-key client:
-- products: GET, insert a temporary lab row, update it, then delete that row.
-- categories: SELECT succeeds; INSERT/UPDATE/DELETE are denied.
-- Do not test by resetting or deleting the seed data.
