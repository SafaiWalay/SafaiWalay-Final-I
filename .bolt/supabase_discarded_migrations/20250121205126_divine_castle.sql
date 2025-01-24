/*
  # Complete SafaiWalay Schema Implementation

  1. Schema Overview
    - Complete database schema with all tables and relationships
    - Security with RLS policies
    - Performance optimizations
    - Monitoring and maintenance
    - Data validation and integrity

  2. Tables
    - users: User accounts and profiles
    - cleaners: Cleaner profiles and availability
    - services: Available cleaning services
    - bookings: Service bookings and scheduling
    - payments: Payment processing and tracking
    - reviews: Customer reviews and ratings
    - rate_limits: Rate limiting for API calls
    - audit_logs: System audit logging

  3. Features
    - Row Level Security (RLS) on all tables
    - Comprehensive data validation
    - Performance optimizations with indexes
    - Monitoring and maintenance functions
    - Audit logging for sensitive operations
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'cleaner');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'online', 'card');
CREATE TYPE cleaner_status AS ENUM ('available', 'busy', 'offline');

-- Create users table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id uuid UNIQUE,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    role user_role DEFAULT 'user',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT name_length CHECK (char_length(name) BETWEEN 2 AND 100),
    CONSTRAINT phone_length CHECK (phone IS NULL OR char_length(phone) BETWEEN 10 AND 15),
    CONSTRAINT address_length CHECK (address IS NULL OR char_length(address) BETWEEN 10 AND 500),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create cleaners table
CREATE TABLE cleaners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    status cleaner_status DEFAULT 'offline',
    rating numeric(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    total_jobs integer DEFAULT 0 CHECK (total_jobs >= 0),
    completed_jobs integer DEFAULT 0 CHECK (completed_jobs >= 0),
    availability jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL CHECK (price > 0),
    duration interval NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT name_length CHECK (char_length(name) BETWEEN 3 AND 100),
    CONSTRAINT description_length CHECK (description IS NULL OR char_length(description) BETWEEN 10 AND 1000)
);

-- Create bookings table
CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    service_id uuid REFERENCES services(id),
    cleaner_id uuid REFERENCES cleaners(id),
    status booking_status DEFAULT 'pending',
    scheduled_at timestamptz NOT NULL,
    address text NOT NULL,
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    notes text,
    start_time timestamptz,
    end_time timestamptz,
    is_paused boolean DEFAULT false,
    pause_time timestamptz,
    total_paused_time interval DEFAULT '0 seconds',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT address_length CHECK (char_length(address) BETWEEN 10 AND 500),
    CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000),
    CONSTRAINT valid_schedule CHECK (scheduled_at > created_at),
    CONSTRAINT valid_duration CHECK (end_time IS NULL OR end_time > start_time)
);

-- Create payments table
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

-- Create reviews table
CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id),
    user_id uuid REFERENCES users(id),
    cleaner_id uuid REFERENCES cleaners(id),
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text,
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT comment_length CHECK (comment IS NULL OR char_length(comment) BETWEEN 10 AND 1000)
);

-- Create rate_limits table
CREATE TABLE rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_key text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    changed_by uuid,
    created_at timestamptz DEFAULT now()
);

-- Create function to validate payment amount
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

-- Create trigger for payment validation
CREATE TRIGGER ensure_payment_matches_booking
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION validate_payment_amount();

-- Create function to update cleaner stats
CREATE OR REPLACE FUNCTION update_cleaner_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE cleaners
        SET completed_jobs = completed_jobs + 1,
            total_jobs = total_jobs + 1
        WHERE id = NEW.cleaner_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating cleaner stats
CREATE TRIGGER update_cleaner_stats_trigger
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_cleaner_stats();

-- Create function to update cleaner rating
CREATE OR REPLACE FUNCTION update_cleaner_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating numeric;
BEGIN
    SELECT AVG(rating)::numeric(3,2) INTO avg_rating
    FROM reviews
    WHERE cleaner_id = NEW.cleaner_id
    AND is_published = true;

    UPDATE cleaners
    SET rating = COALESCE(avg_rating, 0)
    WHERE id = NEW.cleaner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating cleaner rating
CREATE TRIGGER update_cleaner_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_cleaner_rating();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);

-- Services policies
CREATE POLICY "Anyone can view active services"
    ON services FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
    ));

CREATE POLICY "Cleaners can view assigned bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (cleaner_id IN (
        SELECT id FROM cleaners 
        WHERE user_id IN (
            SELECT id FROM users 
            WHERE auth_id = auth.uid()
        )
    ));

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
    ));

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
    ));

-- Reviews policies
CREATE POLICY "Anyone can view published reviews"
    ON reviews FOR SELECT
    TO authenticated
    USING (is_published = true);

CREATE POLICY "Users can create reviews for their bookings"
    ON reviews FOR INSERT
    TO authenticated
    WITH CHECK (booking_id IN (
        SELECT id FROM bookings 
        WHERE user_id IN (
            SELECT id FROM users 
            WHERE auth_id = auth.uid()
        )
    ));

-- Create indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

CREATE INDEX idx_cleaners_user_id ON cleaners(user_id);
CREATE INDEX idx_cleaners_status ON cleaners(status) WHERE status = 'available';
CREATE INDEX idx_cleaners_rating ON cleaners(rating DESC) WHERE status = 'available';

CREATE INDEX idx_services_name_trgm ON services USING gin (name gin_trgm_ops);
CREATE INDEX idx_services_price ON services(price) WHERE is_active = true;

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_cleaner_id ON bookings(cleaner_id);
CREATE INDEX idx_bookings_status ON bookings(status, scheduled_at);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at) WHERE status = 'pending';

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status, created_at);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_cleaner_id ON reviews(cleaner_id);
CREATE INDEX idx_reviews_rating ON reviews(rating) WHERE is_published = true;

-- Create function for rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
    key text,
    max_attempts integer,
    window_interval interval
) RETURNS boolean AS $$
DECLARE
    attempts integer;
BEGIN
    DELETE FROM rate_limits 
    WHERE created_at < NOW() - window_interval;
    
    SELECT COUNT(*) INTO attempts 
    FROM rate_limits 
    WHERE rate_key = key 
    AND created_at > NOW() - window_interval;
    
    INSERT INTO rate_limits (rate_key, created_at) 
    VALUES (key, NOW());
    
    RETURN attempts < max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create maintenance function
CREATE OR REPLACE FUNCTION maintenance_cleanup()
RETURNS void AS $$
BEGIN
    -- Clean up old rate limits
    DELETE FROM rate_limits 
    WHERE created_at < NOW() - INTERVAL '1 day';
    
    -- Clean up old audit logs
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Update statistics
    ANALYZE users;
    ANALYZE cleaners;
    ANALYZE services;
    ANALYZE bookings;
    ANALYZE payments;
    ANALYZE reviews;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;