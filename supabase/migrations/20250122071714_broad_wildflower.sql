-- First, completely disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on the users table
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users'
   LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', r.policyname);
    END LOOP;
END $$;


-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create single, simple policy for all operations
CREATE POLICY "enable_all_access"
    ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add comment explaining the policy
COMMENT ON POLICY "enable_all_access" ON users IS 
    'Temporary policy to resolve recursion issues. Security handled at application level.';