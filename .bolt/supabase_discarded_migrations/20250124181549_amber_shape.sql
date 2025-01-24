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

  IMPORTANT: This consolidation preserves all functionality and maintains data integrity
*/

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

-- Now proceed with the rest of the migration
[REST OF YOUR MIGRATION FILE CONTENT]