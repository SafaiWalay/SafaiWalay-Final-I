/*
  # Complete SafaiWalay Database Schema

  1. Core Features
    - User authentication and roles
    - Service management
    - Booking system
    - Payment processing
    - Review system
    - Cleaner management

  2. Security
    - Row Level Security (RLS) policies
    - Role-based access control
    - Audit logging

  3. Data Validation
    - Status transitions
    - Payment validation
    - Booking validation

  4. Performance
    - Appropriate indexes
    - Materialized views for reporting
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create necessary schemas
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS reports;

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'cleaner');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'online', 'card');
CREATE TYPE cleaner_status AS ENUM ('available', 'busy', 'offline');

-- Core Tables
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id uuid UNIQUE,
    email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
    phone text CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$'),
    address text CHECK (address IS NULL OR char_length(address) BETWEEN 10 AND 500),
    role user_role DEFAULT 'user',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE cleaners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status cleaner_status DEFAULT 'available',
    rating numeric(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    total_jobs integer DEFAULT 0,
    completed_jobs integer DEFAULT 0,
    bio text CHECK (bio IS NULL OR char_length(bio) BETWEEN 10 AND 1000),
    available_days integer[] DEFAULT ARRAY[1,2,3,4,5,6,0], -- 0=Sunday, 1=Monday, etc.
    working_hours jsonb DEFAULT '{"start": "09:00", "end": "18:00"}',
    service_areas text[] DEFAULT ARRAY[]::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 100),
    description text CHECK (description IS NULL OR char_length(description) BETWEEN 10 AND 1000),
    price numeric(10,2) NOT NULL CHECK (price > 0),
    duration interval NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    cleaner_id uuid REFERENCES cleaners(id),
    service_id uuid REFERENCES services(id),
    status booking_status DEFAULT 'pending',
    scheduled_at timestamptz NOT NULL,
    address text NOT NULL CHECK (char_length(address) BETWEEN 10 AND 500),
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
    started_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    coordinates point,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id),
    user_id uuid REFERENCES users(id),
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id text UNIQUE,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id),
    user_id uuid REFERENCES users(id),
    cleaner_id uuid REFERENCES cleaners(id),
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text CHECK (comment IS NULL OR char_length(comment) BETWEEN 10 AND 1000),
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT one_review_per_booking UNIQUE (booking_id)
);

-- Audit logging
CREATE TABLE audit.logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    changed_by uuid,
    created_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();',
            t, t
        );
    END LOOP;
END;
$$;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            CREATE TRIGGER audit_%I_changes
            AFTER INSERT OR UPDATE OR DELETE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION audit.log_changes();',
            t, t
        );
    END LOOP;
END;
$$;

-- Create payment validation trigger
CREATE OR REPLACE FUNCTION validate_payment_amount()
RETURNS TRIGGER AS $$
DECLARE
    booking_amount numeric;
BEGIN
    SELECT amount INTO booking_amount
    FROM bookings
    WHERE id = NEW.booking_id;

    IF NEW.amount != booking_amount THEN
        RAISE EXCEPTION 'Payment amount (%) does not match booking amount (%)', 
            NEW.amount, booking_amount;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_payment_matches_booking
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION validate_payment_amount();

-- Create booking status validation trigger
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

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users"
    ON users FOR ALL
    TO authenticated
    USING (is_admin());

-- Cleaners
CREATE POLICY "Public can view active cleaners"
    ON cleaners FOR SELECT
    TO authenticated
    USING (status = 'available');

CREATE POLICY "Cleaners can update own profile"
    ON cleaners FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Cleaners can update their own status"
    ON cleaners FOR UPDATE
    TO authenticated
    USING (user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
    ))
    WITH CHECK (user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
    ));

-- Services
CREATE POLICY "Anyone can view active services"
    ON services FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage services"
    ON services FOR ALL
    TO authenticated
    USING (is_admin());

-- Bookings
CREATE POLICY "Users can view own bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
        AND status IN ('pending', 'confirmed')
    );

CREATE POLICY "Cleaners can view assigned bookings"
    ON bookings FOR SELECT
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

CREATE POLICY "Cleaners can update assigned bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        cleaner_id IN (
            SELECT id FROM cleaners 
            WHERE user_id IN (
                SELECT id FROM users 
                WHERE auth_id = auth.uid()
            )
        )
        AND status IN ('confirmed', 'in_progress')
    )
    WITH CHECK (
        status IN ('in_progress', 'completed')
    );

CREATE POLICY "Admins can manage all bookings"
    ON bookings FOR ALL
    TO authenticated
    USING (is_admin());

-- Payments
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Reviews
CREATE POLICY "Anyone can view published reviews"
    ON reviews FOR SELECT
    USING (is_published = true);

CREATE POLICY "Users can create reviews for completed bookings"
    ON reviews FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_id
            AND bookings.user_id IN (
                SELECT id FROM users WHERE auth_id = auth.uid()
            )
            AND bookings.status = 'completed'
        )
    );

-- Create indexes
CREATE INDEX idx_users_email_trgm ON users USING gin (email gin_trgm_ops);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
CREATE INDEX idx_services_name_trgm ON services USING gin (name gin_trgm_ops);
CREATE INDEX idx_bookings_address_trgm ON bookings USING gin (address gin_trgm_ops);
CREATE INDEX idx_bookings_status_date ON bookings (status, scheduled_at);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_cleaners_rating ON cleaners(rating DESC) WHERE status = 'available';
CREATE INDEX idx_bookings_user_cleaner ON bookings(user_id, cleaner_id, status);

-- Create materialized view for reporting
CREATE MATERIALIZED VIEW reports.cleaner_performance AS
SELECT 
    c.id AS cleaner_id,
    u.name AS cleaner_name,
    c.rating,
    COUNT(b.id) AS total_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'completed') AS completed_bookings,
    AVG(r.rating) AS average_rating,
    SUM(p.amount) FILTER (WHERE p.status = 'completed') AS total_earnings
FROM cleaners c
JOIN users u ON u.id = c.user_id
LEFT JOIN bookings b ON b.cleaner_id = c.id
LEFT JOIN reviews r ON r.cleaner_id = c.id
LEFT JOIN payments p ON p.booking_id = b.id
GROUP BY c.id, u.name
WITH NO DATA;

CREATE UNIQUE INDEX idx_cleaner_performance_id ON reports.cleaner_performance (cleaner_id);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reports.cleaner_performance;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE users IS 'User accounts including customers, cleaners, and admins';
COMMENT ON TABLE cleaners IS 'Cleaner profiles with availability and ratings';
COMMENT ON TABLE services IS 'Available cleaning services with pricing';
COMMENT ON TABLE bookings IS 'Service bookings with status tracking';
COMMENT ON TABLE payments IS 'Payment records for bookings';
COMMENT ON TABLE reviews IS 'Customer reviews for completed services';
COMMENT ON TABLE audit.logs IS 'Audit trail for all database changes';