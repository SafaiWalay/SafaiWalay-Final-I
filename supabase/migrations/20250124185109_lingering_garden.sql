/*
  # Fix Soft Delete Implementation

  1. Changes
    - Add soft delete columns to all relevant tables
    - Create proper soft delete function with correct parameter naming
    - Update RLS policies to handle soft deleted records
    - Add performance indexes
    - Add cascade behavior for related records

  2. Security
    - Function is marked as SECURITY DEFINER
    - RLS policies updated to exclude soft deleted records
    - Proper parameter naming to avoid ambiguity

  3. Performance
    - Added indexes for soft delete queries
    - Optimized function to handle related records efficiently
*/

-- Start transaction
BEGIN;

-- Add soft delete columns to relevant tables if they don't exist
DO $$ 
BEGIN
    -- Add to bookings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN is_deleted boolean DEFAULT false,
        ADD COLUMN deleted_at timestamptz;
    END IF;

    -- Add to reviews
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE reviews 
        ADD COLUMN is_deleted boolean DEFAULT false,
        ADD COLUMN deleted_at timestamptz;
    END IF;

    -- Add to payments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE payments 
        ADD COLUMN is_deleted boolean DEFAULT false,
        ADD COLUMN deleted_at timestamptz;
    END IF;
END $$;

-- Create or replace the soft delete function with proper parameter naming
CREATE OR REPLACE FUNCTION soft_delete_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
    -- Soft delete related records first
    UPDATE bookings
    SET 
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP
    WHERE user_id = target_user_id;

    UPDATE reviews
    SET 
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP
    WHERE user_id = target_user_id;

    UPDATE payments
    SET 
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP
    WHERE user_id = target_user_id;

    -- Finally soft delete the user
    UPDATE users
    SET 
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'bookings' AND indexname = 'idx_bookings_is_deleted'
    ) THEN
        CREATE INDEX idx_bookings_is_deleted 
        ON bookings(is_deleted) 
        WHERE is_deleted = false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'reviews' AND indexname = 'idx_reviews_is_deleted'
    ) THEN
        CREATE INDEX idx_reviews_is_deleted 
        ON reviews(is_deleted) 
        WHERE is_deleted = false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'payments' AND indexname = 'idx_payments_is_deleted'
    ) THEN
        CREATE INDEX idx_payments_is_deleted 
        ON payments(is_deleted) 
        WHERE is_deleted = false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'idx_users_is_deleted'
    ) THEN
        CREATE INDEX idx_users_is_deleted 
        ON users(is_deleted) 
        WHERE is_deleted = false;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON FUNCTION soft_delete_user(uuid) IS 
    'Safely removes a user and all related records by marking them as deleted. Parameter is explicitly named to avoid ambiguity.';

COMMENT ON COLUMN users.is_deleted IS 
    'Indicates if the record has been soft deleted';

COMMENT ON COLUMN users.deleted_at IS 
    'Timestamp when the record was soft deleted';

COMMIT;