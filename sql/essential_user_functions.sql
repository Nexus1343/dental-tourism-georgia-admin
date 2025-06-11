-- ============================================================================
-- ESSENTIAL USER MANAGEMENT FUNCTIONS
-- Core functions needed for basic user management functionality
-- ============================================================================

-- Function 1: Update user profile
-- Usage: SELECT update_user_profile('user-uuid', '{"first_name": "John", "last_name": "Doe"}'::jsonb);
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  profile_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_user RECORD;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update user profile
  UPDATE users 
  SET 
    first_name = COALESCE((profile_data->>'first_name'), first_name),
    last_name = COALESCE((profile_data->>'last_name'), last_name),
    phone = COALESCE((profile_data->>'phone'), phone),
    preferred_language = COALESCE((profile_data->>'preferred_language'), preferred_language),
    role = COALESCE((profile_data->>'role')::user_role, role),
    status = COALESCE((profile_data->>'status')::user_status, status),
    metadata = CASE 
      WHEN profile_data ? 'metadata' THEN (metadata || (profile_data->'metadata'))
      ELSE metadata 
    END,
    updated_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_user;

  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(updated_user)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function 2: Get users with basic filtering
-- Usage: SELECT get_users(null, 'active', 'john', 1, 10);
CREATE OR REPLACE FUNCTION get_users(
  role_filter TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  search_term TEXT DEFAULT NULL,
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  users_data JSONB;
  total_count INTEGER;
  offset_val INTEGER;
BEGIN
  -- Calculate offset
  offset_val := (page_num - 1) * page_size;

  -- Get filtered users
  WITH filtered_users AS (
    SELECT 
      id, email, role, status, first_name, last_name, 
      phone, preferred_language, created_at, updated_at, 
      last_login_at, metadata
    FROM users
    WHERE 1=1
      AND (role_filter IS NULL OR role::TEXT = role_filter)
      AND (status_filter IS NULL OR status::TEXT = status_filter)
      AND (
        search_term IS NULL 
        OR first_name ILIKE '%' || search_term || '%'
        OR last_name ILIKE '%' || search_term || '%'
        OR email ILIKE '%' || search_term || '%'
        OR (first_name || ' ' || last_name) ILIKE '%' || search_term || '%'
      )
    ORDER BY created_at DESC
    LIMIT page_size
    OFFSET offset_val
  )
  SELECT jsonb_agg(to_jsonb(filtered_users)) INTO users_data
  FROM filtered_users;

  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM users
  WHERE 1=1
    AND (role_filter IS NULL OR role::TEXT = role_filter)
    AND (status_filter IS NULL OR status::TEXT = status_filter)
    AND (
      search_term IS NULL 
      OR first_name ILIKE '%' || search_term || '%'
      OR last_name ILIKE '%' || search_term || '%'
      OR email ILIKE '%' || search_term || '%'
      OR (first_name || ' ' || last_name) ILIKE '%' || search_term || '%'
    );

  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(users_data, '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', page_num,
      'page_size', page_size,
      'total_count', total_count,
      'total_pages', CEIL(total_count::FLOAT / page_size)
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function 3: Get user by ID
-- Usage: SELECT get_user_by_id('user-uuid');
CREATE OR REPLACE FUNCTION get_user_by_id(
  user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data RECORD;
BEGIN
  SELECT * INTO user_data
  FROM users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(user_data)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function 4: Soft delete user (change status to inactive)
-- Usage: SELECT soft_delete_user('user-uuid');
CREATE OR REPLACE FUNCTION soft_delete_user(
  user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_user RECORD;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update status to inactive
  UPDATE users 
  SET 
    status = 'inactive',
    updated_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_user;

  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(updated_user)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function 5: Reactivate user (change status to active)
-- Usage: SELECT reactivate_user('user-uuid');
CREATE OR REPLACE FUNCTION reactivate_user(
  user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_user RECORD;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update status to active
  UPDATE users 
  SET 
    status = 'active',
    updated_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_user;

  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(updated_user)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================================================
-- SIMPLE TRIGGER FOR NEW USER SYNC (if needed)
-- ============================================================================

-- Keep the existing handle_new_user function simple
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    role,
    status,
    preferred_language,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'patient'::user_role,
    'pending'::user_status,
    'en',
    NEW.created_at,
    NEW.updated_at
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error syncing user % to public.users: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Update user profile
SELECT update_user_profile(
  'user-uuid-here',
  '{"first_name": "John", "last_name": "Doe", "phone": "+1234567890"}'::jsonb
);

-- Example 2: Get all users (first page, 10 users)
SELECT get_users(null, null, null, 1, 10);

-- Example 3: Get users by role
SELECT get_users('clinic_admin', null, null, 1, 10);

-- Example 4: Search users by name
SELECT get_users(null, null, 'john', 1, 20);

-- Example 5: Get user by ID
SELECT get_user_by_id('user-uuid-here');

-- Example 6: Soft delete user
SELECT soft_delete_user('user-uuid-here');

-- Example 7: Reactivate user
SELECT reactivate_user('user-uuid-here');
*/ 