-- Start transaction
BEGIN;

-- First, drop existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Cleaners can view pending bookings" ON bookings;
    DROP POLICY IF EXISTS "Cleaners can pick pending bookings" ON bookings;
    DROP POLICY IF EXISTS "Cleaners can update assigned bookings" ON bookings;
    DROP POLICY IF EXISTS "Cleaners can upload payment proofs" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view payment proofs" ON storage.objects;
END $$;

-- Update booking policies for cleaners
CREATE POLICY "Cleaners can view pending bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (
        status = 'pending'
        AND EXISTS (
            SELECT 1 FROM cleaners c
            JOIN users u ON u.id = c.user_id
            WHERE u.auth_id = auth.uid()
            AND NOT u.is_deleted
        )
    );

CREATE POLICY "Cleaners can pick pending bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        status = 'pending'
        AND EXISTS (
            SELECT 1 FROM cleaners c
            JOIN users u ON u.id = c.user_id
            WHERE u.auth_id = auth.uid()
            AND NOT u.is_deleted
        )
    )
    WITH CHECK (
        status = 'picked'
        AND cleaner_id IN (
            SELECT id FROM cleaners 
            WHERE user_id IN (
                SELECT id FROM users 
                WHERE auth_id = auth.uid()
                AND NOT is_deleted
            )
        )
    );

CREATE POLICY "Cleaners can update assigned bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        cleaner_id IN (
            SELECT id FROM cleaners 
            WHERE user_id IN (
                SELECT id FROM users 
                WHERE auth_id = auth.uid()
                AND NOT is_deleted
            )
        )
        AND status IN ('picked', 'in_progress', 'paused')
        AND NOT is_deleted
    )
    WITH CHECK (
        status IN ('in_progress', 'paused', 'completed')
    );

-- Create storage policies for payment proofs
CREATE POLICY "Cleaners can upload payment proofs"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'receipts' AND
        EXISTS (
            SELECT 1 FROM cleaners c
            JOIN users u ON u.id = c.user_id
            WHERE u.auth_id = auth.uid()
            AND NOT u.is_deleted
        )
    );

CREATE POLICY "Anyone can view payment proofs"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'receipts');

-- Create performance indexes
DROP INDEX IF EXISTS idx_bookings_cleaner_status_active;
DROP INDEX IF EXISTS idx_bookings_payment_active;
DROP INDEX IF EXISTS idx_cleaners_user_active;

-- Create simpler indexes without complex predicates
CREATE INDEX idx_bookings_cleaner_status_active 
    ON bookings(cleaner_id, status, is_deleted);

CREATE INDEX idx_bookings_payment_active
    ON bookings(payment_collected_at, status, is_deleted);

CREATE INDEX idx_cleaners_user_active
    ON cleaners(user_id);

-- Create index on users is_deleted for join optimization
CREATE INDEX IF NOT EXISTS idx_users_is_deleted_active
    ON users(id, is_deleted)
    WHERE NOT is_deleted;

-- Add comments for documentation
COMMENT ON POLICY "Cleaners can view pending bookings" ON bookings IS 
    'Allows cleaners to view available pending bookings';

COMMENT ON POLICY "Cleaners can pick pending bookings" ON bookings IS 
    'Allows cleaners to pick up pending bookings';

COMMENT ON POLICY "Cleaners can update assigned bookings" ON bookings IS 
    'Allows cleaners to update status of their assigned bookings';

COMMENT ON POLICY "Cleaners can upload payment proofs" ON storage.objects IS 
    'Allows cleaners to upload payment proof images';

COMMENT ON POLICY "Anyone can view payment proofs" ON storage.objects IS 
    'Allows authenticated users to view payment proofs';

COMMIT;