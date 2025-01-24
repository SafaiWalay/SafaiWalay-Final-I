-- Create or replace restore_user function
CREATE OR REPLACE FUNCTION restore_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
    -- Restore related records first
    UPDATE bookings
    SET 
        is_deleted = false,
        deleted_at = NULL
    WHERE user_id = target_user_id;

    UPDATE reviews
    SET 
        is_deleted = false,
        deleted_at = NULL
    WHERE user_id = target_user_id;

    UPDATE payments
    SET 
        is_deleted = false,
        deleted_at = NULL
    WHERE user_id = target_user_id;

    -- Finally restore the user
    UPDATE users
    SET 
        is_deleted = false,
        deleted_at = NULL
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION restore_user(uuid) IS 
    'Restores a soft-deleted user and all related records by setting is_deleted to false';