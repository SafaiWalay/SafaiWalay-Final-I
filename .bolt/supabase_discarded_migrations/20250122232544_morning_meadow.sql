/*
  # Add payment proof functionality

  1. Changes
    - Add payment_proof_url column to bookings table
    - Add payment_collected_at column to bookings table
    - Create storage bucket for payment proofs
    - Add storage policies for payment proofs
    - Add indexes for payment-related queries

  2. Security
    - Enable RLS for storage bucket
    - Add policies for cleaner upload access
    - Add policies for public viewing access
*/

-- Add new columns to bookings table if they don't exist
DO $$ 
BEGIN
  -- Add payment_proof_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_proof_url'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_proof_url text;
  END IF;

  -- Add payment_collected_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_collected_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_collected_at timestamptz;
  END IF;
END $$;

-- Create storage bucket for payment proofs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'receipts', 'receipts', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'receipts'
);

-- Set up storage bucket policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
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

-- Add indexes for payment-related queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'bookings' AND indexname = 'idx_bookings_payment_status'
  ) THEN
    CREATE INDEX idx_bookings_payment_status 
    ON bookings(status, payment_collected_at)
    WHERE status = 'completed';
  END IF;
END $$;