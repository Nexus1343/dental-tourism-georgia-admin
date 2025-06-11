Here's a comprehensive prompt you can give to Cursor AI:

---

**TASK: Implement User Management System with Supabase Auth + Database Integration**

## Context
I'm building a dental tourism platform with a hybrid user management system:
- Supabase Auth handles authentication (email + password)
- Custom `users` table stores complete profile data
- Database triggers automatically sync auth users to users table with minimal data (UUID + email)

## Implementation Requirements

### 1. User Creation Flow (Two-Step Process)
Create a user management interface that follows this flow:
1. **Step 1**: Create user in Supabase Auth using `supabase.auth.admin.createUser()`
2. **Step 2**: Immediately update the users table with complete profile data
3. **Error Handling**: If Step 2 fails, handle rollback appropriately
4. **Validation**: Validate all form data before submission

### 2. User Update Flow
- Update user profile data directly in the `users` table
- If email changes, also update it in Supabase Auth
- Use proper error handling and validation

### 3. User Deletion Flow
- Implement soft delete by updating user status to 'inactive'
- Do NOT delete from auth or users table
- Provide option to reactivate users

### 4. Required Database Functions
First, create these Supabase database functions:

```sql
-- Function to update user profile with validation
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  profile_data JSONB
) RETURNS BOOLEAN

-- Function to soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(
  user_id UUID
) RETURNS BOOLEAN

-- Function to reactivate user
CREATE OR REPLACE FUNCTION reactivate_user(
  user_id UUID
) RETURNS BOOLEAN
```

### 5. Frontend Components Needed

**UserManagement Dashboard:**
- List all users with filtering/search
- Role-based access (admins can see all, clinic admins see their clinic users)
- Pagination and sorting
- Status indicators (active/inactive/pending)

**CreateUserForm:**
- All fields from users table schema
- Proper validation
- Two-step creation process
- Loading states and error handling

**EditUserForm:**
- Pre-populated with current user data
- Handle profile updates
- Email change handling (both auth and database)

**UserActions:**
- Soft delete with confirmation
- Reactivate inactive users
- Role management (for super admins)

### 6. User Table Schema Reference
```typescript
type User = {
  id: string; // UUID
  email: string;
  role: 'super_admin' | 'clinic_admin' | 'doctor' | 'marketing_team' | 'operations_team' | 'patient';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language: string; // default 'en'
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  metadata: Record<string, any>; // JSON field
}
```

### 7. Permission Requirements
- Super admins: Full access to all users
- Clinic admins: Access to users in their clinic only
- Other roles: Cannot access user management
- Users can edit their own basic profile (not role/status)

### 8. Technical Implementation Notes

**Supabase Client Setup:**
- Use admin client for user creation
- Use regular client for profile updates
- Implement proper RLS policies

**Error Handling:**
- Graceful handling of auth creation failures
- Database update failures with appropriate user feedback
- Network errors and timeouts

**State Management:**
- Loading states for all operations
- Optimistic updates where appropriate
- Cache invalidation after updates

**Form Validation:**
- Email format validation
- Required field validation
- Role-specific field requirements
- Phone number format validation

### 9. API Integration Pattern
```typescript
// Create User Example Flow
const createUser = async (userData) => {
  try {
    // Step 1: Create in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Step 2: Update profile
    const { error: profileError } = await supabase
      .rpc('update_user_profile', {
        user_id: authUser.user.id,
        profile_data: userData
      });
      
    if (profileError) {
      // Handle rollback if needed
      throw profileError;
    }
    
    return { success: true, user: authUser.user };
  } catch (error) {
    // Handle errors appropriately
    return { success: false, error };
  }
};
```

### 10. UI/UX Requirements
- Clean, professional interface matching the dental platform theme
- Clear success/error messaging
- Confirmation dialogs for destructive actions
- Loading indicators for all async operations
- Responsive design for mobile/tablet use

### 11. Testing Considerations
- Test user creation with various role types
- Test error scenarios (network failures, validation errors)
- Test permission boundaries
- Test soft delete and reactivation flows

**Tech Stack Context:**
- Next.js with TypeScript
- Supabase for backend
- Tailwind CSS for styling
- React Hook Form for form handling
- SWR or TanStack Query for data fetching

**Priority:** Implement in this order:
1. Database functions
2. User listing/viewing
3. User creation
4. User editing
5. User deletion/reactivation
6. Advanced features (bulk operations, etc.)

Implement this system following the hybrid approach where auth creation happens first, followed by immediate profile completion, ensuring data consistency and proper error handling throughout.

---
