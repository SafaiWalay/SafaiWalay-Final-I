-- Start transaction for enum addition
BEGIN;

-- Add payment verification status to booking_status if not exists
DO $$ 
BEGIN
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'payment_verified' AFTER 'completed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMIT;

-- Start new transaction for remaining changes
BEGIN;

-- Create or replace payment verification trigger
CREATE OR REPLACE FUNCTION verify_payment_and_update_earnings()
RETURNS TRIGGER AS $$
DECLARE
    service_name text;
    earning_amount numeric(10,2);
    earnings_entry jsonb;
BEGIN
    -- Only proceed if payment_proof_url is being set
    IF NEW.payment_proof_url IS NOT NULL AND OLD.payment_proof_url IS NULL THEN
        -- Set payment collection timestamp
        NEW.payment_collected_at = CURRENT_TIMESTAMP;
        NEW.status = 'payment_verified'::booking_status;

        -- Get service name
        SELECT name INTO service_name
        FROM services
        WHERE id = NEW.service_id;

        -- Calculate earnings
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

-- Create trigger for payment verification
DROP TRIGGER IF EXISTS verify_payment_trigger ON bookings;
CREATE TRIGGER verify_payment_trigger
    BEFORE UPDATE OF payment_proof_url ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION verify_payment_and_update_earnings();

-- Add index for payment verification queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_verification
    ON bookings(payment_proof_url, payment_collected_at, status)
    WHERE status IN ('completed'::booking_status, 'payment_verified'::booking_status);

COMMIT;