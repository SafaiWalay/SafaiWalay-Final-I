/*
  # Consolidated Migration File
  
  This migration combines multiple changes into a single file:
  1. Test Users & Cleaners
  2. Services Data
  3. Booking Status & Workflow
  4. Reviews & Metadata
  5. Earnings System
  6. Soft Delete
  7. Admin Optimizations
*/

-- Ensure we're in a transaction
BEGIN;

-- First, drop all existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Cleaners can view own withdrawals" ON earnings_withdrawals;
    DROP POLICY IF EXISTS "Cleaners can request withdrawals" ON earnings_withdrawals;
    DROP POLICY IF EXISTS "Admins can manage withdrawals" ON earnings_withdrawals;
    DROP POLICY IF EXISTS "Cleaners can upload payment proofs" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view payment proofs" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view own data" ON users;
    DROP POLICY IF EXISTS "Cleaners can view pending bookings" ON bookings;
    DROP POLICY IF EXISTS "Cleaners can pick pending bookings" ON bookings;
    DROP POLICY IF EXISTS "Cleaners can update assigned bookings" ON bookings;
END $$;

-- First, ensure users exist and update them safely
DO $$ 
BEGIN
    -- Admin user
    IF EXISTS (SELECT 1 FROM users WHERE auth_id = 'b1ab300c-90fa-4f2c-b78a-530a599d39c5'::uuid) THEN
        UPDATE users 
        SET 
            email = 'admin@safaiwalay.com',
            name = 'Admin User',
            role = 'admin',
            phone = '+919876543210',
            address = '123 Admin Street'
        WHERE auth_id = 'b1ab300c-90fa-4f2c-b78a-530a599d39c5'::uuid;
    ELSE
        INSERT INTO users (auth_id, email, name, role, phone, address)
        VALUES (
            'b1ab300c-90fa-4f2c-b78a-530a599d39c5'::uuid,
            'admin@safaiwalay.com',
            'Admin User',
            'admin',
            '+919876543210',
            '123 Admin Street'
        );
    END IF;

    -- Cleaner user
    IF EXISTS (SELECT 1 FROM users WHERE auth_id = '366b23b3-21d4-4061-8854-2eb49b46a05f'::uuid) THEN
        UPDATE users 
        SET 
            email = 'cleaner@safaiwalay.com',
            name = 'John Cleaner',
            role = 'cleaner',
            phone = '+919876543211',
            address = '456 Cleaner Avenue'
        WHERE auth_id = '366b23b3-21d4-4061-8854-2eb49b46a05f'::uuid;
    ELSE
        INSERT INTO users (auth_id, email, name, role, phone, address)
        VALUES (
            '366b23b3-21d4-4061-8854-2eb49b46a05f'::uuid,
            'cleaner@safaiwalay.com',
            'John Cleaner',
            'cleaner',
            '+919876543211',
            '456 Cleaner Avenue'
        );
    END IF;

    -- Test user
    IF EXISTS (SELECT 1 FROM users WHERE auth_id = 'add8d815-200c-4422-af2d-002b3a58a7a9'::uuid) THEN
        UPDATE users 
        SET 
            email = 'test@safaiwalay.com',
            name = 'Test User',
            role = 'user',
            phone = '+919876543212',
            address = '789 Test Road'
        WHERE auth_id = 'add8d815-200c-4422-af2d-002b3a58a7a9'::uuid;
    ELSE
        INSERT INTO users (auth_id, email, name, role, phone, address)
        VALUES (
            'add8d815-200c-4422-af2d-002b3a58a7a9'::uuid,
            'test@safaiwalay.com',
            'Test User',
            'user',
            '+919876543212',
            '789 Test Road'
        );
    END IF;
END $$;

-- Create or update cleaner profile
DO $$
DECLARE
    cleaner_user_id uuid;
BEGIN
    -- Get the user_id for the cleaner
    SELECT id INTO cleaner_user_id
    FROM users
    WHERE auth_id = '366b23b3-21d4-4061-8854-2eb49b46a05f'::uuid;

    -- Create or update cleaner profile
    IF EXISTS (SELECT 1 FROM cleaners WHERE user_id = cleaner_user_id) THEN
        UPDATE cleaners
        SET
            status = 'available',
            rating = 4.5,
            bio = 'Professional cleaner with 5 years of experience',
            available_days = ARRAY[1,2,3,4,5,6],
            working_hours = '{"start": "09:00", "end": "18:00"}'::jsonb,
            service_areas = ARRAY['Nagpur','Hingna','Kamptee']
        WHERE user_id = cleaner_user_id;
    ELSE
        INSERT INTO cleaners (
            user_id,
            status,
            rating,
            bio,
            available_days,
            working_hours,
            service_areas
        )
        VALUES (
            cleaner_user_id,
            'available',
            4.5,
            'Professional cleaner with 5 years of experience',
            ARRAY[1,2,3,4,5,6],
            '{"start": "09:00", "end": "18:00"}'::jsonb,
            ARRAY['Nagpur','Hingna','Kamptee']
        );
    END IF;
END $$;

-- Insert or update services
DO $$ 
BEGIN
    -- Solar Panel Cleaning
    IF EXISTS (SELECT 1 FROM services WHERE name = 'Solar Panel Cleaning') THEN
        UPDATE services 
        SET 
            description = 'Professional solar panel cleaning service to maintain optimal efficiency',
            price = 600,
            duration = interval '2 hours',
            is_active = true
        WHERE name = 'Solar Panel Cleaning';
    ELSE
        INSERT INTO services (name, description, price, duration, is_active)
        VALUES (
            'Solar Panel Cleaning',
            'Professional solar panel cleaning service to maintain optimal efficiency',
            600,
            interval '2 hours',
            true
        );
    END IF;

    -- Carpet Cleaning
    IF EXISTS (SELECT 1 FROM services WHERE name = 'Carpet Cleaning') THEN
        UPDATE services 
        SET 
            description = 'Deep carpet cleaning service for all types of carpets',
            price = 500,
            duration = interval '3 hours',
            is_active = true
        WHERE name = 'Carpet Cleaning';
    ELSE
        INSERT INTO services (name, description, price, duration, is_active)
        VALUES (
            'Carpet Cleaning',
            'Deep carpet cleaning service for all types of carpets',
            500,
            interval '3 hours',
            true
        );
    END IF;

    -- Water Tank Cleaning
    IF EXISTS (SELECT 1 FROM services WHERE name = 'Water Tank Cleaning') THEN
        UPDATE services 
        SET 
            description = 'Professional water tank cleaning service (Price for 10000L capacity)',
            price = 1000,
            duration = interval '4 hours',
            is_active = true
        WHERE name = 'Water Tank Cleaning';
    ELSE
        INSERT INTO services (name, description, price, duration, is_active)
        VALUES (
            'Water Tank Cleaning',
            'Professional water tank cleaning service (Price for 10000L capacity)',
            1000,
            interval '4 hours',
            true
        );
    END IF;

    -- Patio & Parking
    IF EXISTS (SELECT 1 FROM services WHERE name = 'Patio & Parking Cleaning') THEN
        UPDATE services 
        SET 
            description = 'Complete cleaning service for patios and parking areas',
            price = 999,
            duration = interval '3 hours',
            is_active = true
        WHERE name = 'Patio & Parking Cleaning';
    ELSE
        INSERT INTO services (name, description, price, duration, is_active)
        VALUES (
            'Patio & Parking Cleaning',
            'Complete cleaning service for patios and parking areas',
            999,
            interval '3 hours',
            true
        );
    END IF;

    -- Terrace & Roof
    IF EXISTS (SELECT 1 FROM services WHERE name = 'Terrace & Roof Cleaning') THEN
        UPDATE services 
        SET 
            description = 'Professional terrace and roof cleaning service',
            price = 1299,
            duration = interval '4 hours',
            is_active = true
        WHERE name = 'Terrace & Roof Cleaning';
    ELSE
        INSERT INTO services (name, description, price, duration, is_active)
        VALUES (
            'Terrace & Roof Cleaning',
            'Professional terrace and roof cleaning service',
            1299,
            interval '4 hours',
            true
        );
    END IF;

    -- Car Wash
    IF EXISTS (SELECT 1 FROM services WHERE name = 'Car Wash') THEN
        UPDATE services 
        SET 
            description = 'Professional car washing and detailing service',
            price = 499,
            duration = interval '1 hour',
            is_active = true
        WHERE name = 'Car Wash';
    ELSE
        INSERT INTO services (name, description, price, duration, is_active)
        VALUES (
            'Car Wash',
            'Professional car washing and detailing service',
            499,
            interval '1 hour',
            true
        );
    END IF;
END $$;

-- Add new status values to booking_status type
DO $$ 
BEGIN
  -- Check if 'picked' value exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'booking_status'
    AND e.enumlabel = 'picked'
  ) THEN
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'picked' AFTER 'pending';
  END IF;

  -- Check if 'paused' value exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'booking_status'
    AND e.enumlabel = 'paused'
  ) THEN
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'paused' AFTER 'in_progress';
  END IF;
END $$;

-- Add new columns to bookings table
DO $$ 
BEGIN
  -- Add picked_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'picked_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN picked_at timestamptz;
  END IF;

  -- Add paused_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'paused_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN paused_at timestamptz;
  END IF;

  -- Add total_pause_duration column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'total_pause_duration'
  ) THEN
    ALTER TABLE bookings ADD COLUMN total_pause_duration integer DEFAULT 0;
  END IF;

  -- Add payment_collected_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_collected_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_collected_at timestamptz;
  END IF;

  -- Add payment_proof_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_proof_url'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_proof_url text;
  END IF;
END $$;

-- Drop and recreate the booking status validation trigger
DROP TRIGGER IF EXISTS validate_booking_status_change_trigger ON bookings;
DROP FUNCTION IF EXISTS validate_booking_status_change();

CREATE OR REPLACE FUNCTION validate_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate status transitions
    IF NOT (
        -- Initial transitions
        (OLD.status = 'pending' AND NEW.status = 'picked') OR
        -- Main flow
        (OLD.status = 'picked' AND NEW.status = 'in_progress') OR
        (OLD.status = 'in_progress' AND NEW.status IN ('completed', 'paused')) OR
        -- Pause flow
        (OLD.status = 'paused' AND NEW.status IN ('in_progress', 'completed')) OR
        -- Cancellation
        (OLD.status IN ('pending', 'picked') AND NEW.status = 'cancelled')
    ) THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;

    -- Set timestamps based on status
    CASE NEW.status
        WHEN 'picked' THEN
            NEW.picked_at = CURRENT_TIMESTAMP;
        WHEN 'in_progress' THEN
            IF OLD.status = 'picked' THEN
                NEW.started_at = CURRENT_TIMESTAMP;
            END IF;
        WHEN 'paused' THEN
            NEW.paused_at = CURRENT_TIMESTAMP;
        WHEN 'completed' THEN
            NEW.completed_at = CURRENT_TIMESTAMP;
            NEW.paused_at = NULL;
        WHEN 'cancelled' THEN
            NEW.cancelled_at = CURRENT_TIMESTAMP;
    END CASE;

    -- Clear pause timestamp when resuming
    IF OLD.status = 'paused' AND NEW.status = 'in_progress' THEN
        -- Calculate pause duration in minutes
        NEW.total_pause_duration = COALESCE(OLD.total_pause_duration, 0) + 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - OLD.paused_at))/60;
        NEW.paused_at = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_booking_status_change_trigger
    BEFORE UPDATE OF status ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION validate_booking_status_change();

-- Add metadata column to reviews if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE reviews ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add initial reviews
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Get the test user's ID
    SELECT id INTO test_user_id
    FROM users
    WHERE auth_id = 'add8d815-200c-4422-af2d-002b3a58a7a9'::uuid;

    -- Insert reviews if they don't exist
    INSERT INTO reviews (id, user_id, rating, comment, is_published, metadata)
    VALUES
        (
            gen_random_uuid(),
            test_user_id,
            5,
            'Exceptional cleaning service, highly recommended!',
            true,
            jsonb_build_object(
                'display_name', 'Royal Gayatri Park 2 Society Maintenance',
                'location', 'Waghdhara, Hingna Road'
            )
        ),
        (
            gen_random_uuid(),
            test_user_id,
            5,
            'Outstanding service quality and professional staff.',
            true,
            jsonb_build_object(
                'display_name', 'Roshan Khatri',
                'location', 'Khamla, Nagpur'
            )
        ),
        (
            gen_random_uuid(),
            test_user_id,
            5,
            'Great attention to detail and reliable service.',
            true,
            jsonb_build_object(
                'display_name', 'UTL Solar Solar Panel Distributer',
                'location', 'Isasani, Hingna Road'
            )
        )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Add earnings columns to cleaners table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cleaners' 
        AND column_name = 'earnings_balance'
    ) THEN
        ALTER TABLE cleaners ADD COLUMN earnings_balance numeric(10,2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cleaners' 
        AND column_name = 'earnings_history'
    ) THEN
        ALTER TABLE cleaners ADD COLUMN earnings_history jsonb DEFAULT '[]';
    END IF;
END $$;

-- Create earnings_withdrawals table
CREATE TABLE IF NOT EXISTS earnings_withdrawals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id uuid REFERENCES cleaners(id),
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    requested_at timestamptz DEFAULT now(),
    processed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on earnings_withdrawals
ALTER TABLE earnings_withdrawals ENABLE ROW LEVEL SECURITY;

-- Create earnings policies
CREATE POLICY "Cleaners can view own withdrawals"
    ON earnings_withdrawals
    FOR SELECT
    TO authenticated
    USING (
        cleaner_id IN (
            SELECT id FROM cleaners
            WHERE user_id IN (
                SELECT id FROM users
                WHERE auth_id = auth.uid()
            )
        )
    );

CREATE POLICY "Cleaners can request withdrawals"
    ON earnings_withdrawals
    FOR INSERT
    TO authenticated
    WITH CHECK (
        cleaner_id IN (
            SELECT id FROM cleaners
            WHERE user_id IN (
                SELECT id FROM users
                WHERE auth_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage withdrawals"
    ON earnings_withdrawals
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create update_cleaner_earnings function and trigger
CREATE OR REPLACE FUNCTION update_cleaner_earnings()
RETURNS TRIGGER AS $$
DECLARE
    service_name text;
    earning_amount numeric(10,2);
    earnings_entry jsonb;
BEGIN
    -- Only proceed if status changed to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Get service name
        SELECT name INTO service_name
        FROM services
        WHERE id = NEW.service_id;

        -- Set earning amount based on service
        earning_amount := CASE 
            WHEN service_name = 'Car Wash' THEN 150.00
            ELSE 200.00
        END;

        -- Create earnings entry
        earnings_entry := jsonb_build_object(
            'booking_id', NEW.id,
            'amount', earning_amount,
            'service', service_name,
            'earned_at', CURRENT_TIMESTAMP
        );

        -- Update cleaner earnings
        UPDATE cleaners
        SET 
            earnings_balance = COALESCE(earnings_balance, 0) + earning_amount,
            earnings_history = COALESCE(earnings_history, '[]'::jsonb) || earnings_entry
        WHERE id = NEW.cleaner_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create earnings trigger
DROP TRIGGER IF EXISTS update_cleaner_earnings_trigger ON bookings;
CREATE TRIGGER update_cleaner_earnings_trigger
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_cleaner_earnings();

-- Add soft delete columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create soft delete function
CREATE OR REPLACE FUNCTION soft_delete_user(user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET 
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for soft delete
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    TO authenticated
    USING (
        (auth.uid() = auth_id AND NOT is_deleted)
        OR 
        EXISTS (
            SELECT 1 FROM admin_users a
            WHERE a.auth_id = auth.uid()
        )
    );


-- Create materialized view for admin users
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_users AS
SELECT auth_id
FROM users
WHERE role = 'admin'
AND NOT is_deleted;

-- Create index for admin users view
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_id ON admin_users(auth_id);

-- Create function to refresh admin users view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to refresh view
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON users;
CREATE TRIGGER refresh_admin_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_admin_users();

-- Replace is_admin function with optimized version
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE auth_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name)
SELECT 'receipts', 'receipts'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'receipts'
);

-- Set up storage bucket policies
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Cleaners can upload payment proofs" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view payment proofs" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Cleaners can upload payment proofs"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'receipts' AND
        EXISTS (
            SELECT 1 FROM cleaners c
            JOIN users u ON u.id = c.user_id
            WHERE u.auth_id = auth.uid()
        )
    );

    CREATE POLICY "Anyone can view payment proofs"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'receipts');
END $$;

-- Create performance indexes
DO $$
BEGIN
    -- Bookings indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'bookings' AND indexname = 'idx_bookings_cleaner_status'
    ) THEN
        CREATE INDEX idx_bookings_cleaner_status 
        ON bookings(cleaner_id, status);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'bookings' AND indexname = 'idx_bookings_picked_at'
    ) THEN
        CREATE INDEX idx_bookings_picked_at 
        ON bookings(picked_at) 
        WHERE status = 'picked';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'bookings' AND indexname = 'idx_bookings_payment'
    ) THEN
        CREATE INDEX idx_bookings_payment 
        ON bookings(payment_collected_at) 
        WHERE status = 'completed';
    END IF;

    -- Earnings indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'earnings_withdrawals' AND indexname = 'idx_earnings_withdrawals_cleaner_status'
    ) THEN
        CREATE INDEX idx_earnings_withdrawals_cleaner_status 
        ON earnings_withdrawals(cleaner_id, status);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'earnings_withdrawals' AND indexname = 'idx_earnings_withdrawals_created'
    ) THEN
        CREATE INDEX idx_earnings_withdrawals_created 
        ON earnings_withdrawals(created_at DESC);
    END IF;

    -- Soft delete index
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
COMMENT ON MATERIALIZED VIEW admin_users IS 'Cached list of admin users to prevent recursion in RLS policies';
COMMENT ON FUNCTION is_admin() IS 'Efficiently checks if current user is admin using materialized view';
COMMENT ON FUNCTION refresh_admin_users() IS 'Refreshes admin users materialized view when users table changes';
COMMENT ON FUNCTION soft_delete_user IS 'Safely removes a user by marking them as deleted instead of physical deletion';
COMMENT ON TABLE earnings_withdrawals IS 'Tracks cleaner earnings withdrawal requests';
COMMENT ON POLICY "Cleaners can view own withdrawals" ON earnings_withdrawals IS 'Allows cleaners to view their own withdrawal requests';
COMMENT ON POLICY "Cleaners can request withdrawals" ON earnings_withdrawals IS 'Allows cleaners to create withdrawal requests for their earnings';
COMMENT ON POLICY "Admins can manage withdrawals" ON earnings_withdrawals IS 'Allows administrators to manage all withdrawal requests';

-- Refresh materialized views
REFRESH MATERIALIZED VIEW admin_users;

COMMIT;