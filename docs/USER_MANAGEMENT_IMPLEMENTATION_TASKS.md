# User Management System Implementation Tasks

## Overview
Implementation of a comprehensive user management system for the dental tourism platform admin panel, following a hybrid approach with Supabase Auth for authentication and custom users table for profile data.

## Current Context Analysis

### Database Schema Status
- ✅ `users` table exists with proper structure
- ✅ User roles enum: `super_admin`, `clinic_admin`, `doctor`, `marketing_team`, `operations_team`, `patient`
- ✅ User status enum: `active`, `inactive`, `pending`, `suspended`
- ✅ Auto-sync trigger `handle_new_user` exists (auth → users table)
- ✅ `clinic_admins` junction table exists for clinic associations

### Missing Components
- ❌ Database functions for user operations
- ❌ Frontend user management interface
- ❌ User creation/edit/delete flows
- ❌ Permission-based access controls

## Implementation Phases

## Phase 1: Database Functions & Security Setup

### Task 1.1: Create Core Database Functions
**Priority: High**
**Files to create:**
- `sql/user_management_functions.sql`

**Functions to implement:**
```sql
-- Update user profile with validation
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  profile_data JSONB
) RETURNS JSONB;

-- Soft delete user (set status to inactive)
CREATE OR REPLACE FUNCTION soft_delete_user(
  user_id UUID
) RETURNS BOOLEAN;

-- Reactivate user
CREATE OR REPLACE FUNCTION reactivate_user(
  user_id UUID
) RETURNS BOOLEAN;

-- Get users with filtering and pagination
CREATE OR REPLACE FUNCTION get_users_filtered(
  role_filter TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  clinic_id_filter UUID DEFAULT NULL,
  search_term TEXT DEFAULT NULL,
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
) RETURNS JSONB;
```

### Task 1.2: Row Level Security (RLS) Policies
**Priority: High**
**Files to create:**
- `sql/user_rls_policies.sql`

**Policies to implement:**
- Super admins: Full access to all users
- Clinic admins: Access to users in their clinics only
- Other roles: Read-only access to their own profile

### Task 1.3: Database Triggers Enhancement
**Priority: Medium**
**Files to modify:**
- Enhance existing `handle_new_user` trigger for better error handling

## Phase 2: TypeScript Types & API Setup

### Task 2.1: Extend Database Types
**Priority: High**
**Files to modify:**
- `src/types/database.ts`

**Types to add:**
```typescript
export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'clinic_admin' | 'doctor' | 'marketing_team' | 'operations_team' | 'patient';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  metadata: Record<string, any>;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: User['role'];
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: string;
  clinic_id?: string; // For clinic_admin role
}

export interface UpdateUserData {
  email?: string;
  role?: User['role'];
  status?: User['status'];
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: string;
  metadata?: Record<string, any>;
}
```

### Task 2.2: Create User Service Layer
**Priority: High**
**Files to create:**
- `src/lib/services/userService.ts`

**Service methods:**
- `createUser(userData: CreateUserData): Promise<ApiResponse<User>>`
- `updateUser(userId: string, userData: UpdateUserData): Promise<ApiResponse<User>>`
- `deleteUser(userId: string): Promise<ApiResponse<boolean>>`
- `reactivateUser(userId: string): Promise<ApiResponse<boolean>>`
- `getUsers(filters: UserFilters): Promise<PaginatedResponse<User>>`
- `getUserById(userId: string): Promise<ApiResponse<User>>`

### Task 2.3: API Routes
**Priority: High**
**Files to create:**
- `src/app/api/admin/users/route.ts` (GET, POST)
- `src/app/api/admin/users/[id]/route.ts` (GET, PUT, DELETE)
- `src/app/api/admin/users/[id]/reactivate/route.ts` (POST)

## Phase 3: UI Components Development

### Task 3.1: Core User Management Components
**Priority: High**
**Files to create:**
- `src/components/admin/users/UserManagementDashboard.tsx`
- `src/components/admin/users/UserList.tsx`
- `src/components/admin/users/UserCard.tsx`
- `src/components/admin/users/UserFilters.tsx`

**Features:**
- Responsive data table with sorting/filtering
- Role-based access controls
- Status indicators and badges
- Search functionality
- Pagination

### Task 3.2: User Creation Form
**Priority: High**
**Files to create:**
- `src/components/admin/users/CreateUserForm.tsx`
- `src/components/admin/users/CreateUserDialog.tsx`

**Features:**
- Two-step creation process (Auth → Profile)
- Form validation using react-hook-form + zod
- Role-specific field requirements
- Loading states and error handling
- Email uniqueness validation

### Task 3.3: User Edit Form
**Priority: High**
**Files to create:**
- `src/components/admin/users/EditUserForm.tsx`
- `src/components/admin/users/EditUserDialog.tsx`

**Features:**
- Pre-populated form data
- Conditional email update (both auth + database)
- Role change handling
- Status management
- Optimistic updates

### Task 3.4: User Actions Components
**Priority: Medium**
**Files to create:**
- `src/components/admin/users/UserActions.tsx`
- `src/components/admin/users/DeleteUserDialog.tsx`
- `src/components/admin/users/ReactivateUserDialog.tsx`

**Features:**
- Confirmation dialogs for destructive actions
- Bulk operations support
- Status change actions
- Activity indicators

## Phase 4: Admin Pages & Routing

### Task 4.1: Users Admin Page
**Priority: High**
**Files to create:**
- `src/app/admin/users/page.tsx`
- `src/app/admin/users/create/page.tsx`
- `src/app/admin/users/[id]/page.tsx`
- `src/app/admin/users/[id]/edit/page.tsx`

**Features:**
- Dashboard overview with user statistics
- User listing with advanced filtering
- Individual user detail pages
- Breadcrumb navigation

### Task 4.2: Update Navigation
**Priority: Medium**
**Files to modify:**
- `src/components/layout/Sidebar.tsx`

**Changes:**
- Add submenu for Users section:
  - All Users
  - Create New User
  - User Roles (future)

## Phase 5: Permissions & Security

### Task 5.1: Permission Hook
**Priority: High**
**Files to create:**
- `src/hooks/usePermissions.ts`

**Features:**
- Role-based permission checking
- Component-level access control
- Route protection logic

### Task 5.2: Auth Context Enhancement
**Priority: High**
**Files to create/modify:**
- `src/contexts/AuthContext.tsx` (if not exists)
- `src/hooks/useAuth.ts`

**Features:**
- Current user session management
- Role and permission context
- Protected route components

### Task 5.3: Protected Routes
**Priority: Medium**
**Files to create:**
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/RoleGuard.tsx`

## Phase 6: Advanced Features & Polish

### Task 6.1: User Activity & Audit
**Priority: Low**
**Files to create:**
- `src/components/admin/users/UserActivityLog.tsx`
- Database table: `user_activity_logs`

### Task 6.2: Bulk Operations
**Priority: Low**
**Files to create:**
- `src/components/admin/users/BulkUserActions.tsx`

**Features:**
- Multi-select functionality
- Bulk status changes
- Bulk role assignments
- Export user data

### Task 6.3: User Import/Export
**Priority: Low**
**Files to create:**
- `src/components/admin/users/UserImport.tsx`
- `src/components/admin/users/UserExport.tsx`

## Technical Implementation Notes

### Error Handling Strategy
- Graceful auth creation failure handling
- Database transaction rollback on profile update failure
- User-friendly error messages
- Logging for audit purposes

### Performance Considerations
- Implement pagination for large user lists
- Use React Query/SWR for data caching
- Optimistic updates for better UX
- Debounced search functionality

### Validation Schema (Zod)
```typescript
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['super_admin', 'clinic_admin', 'doctor', 'marketing_team', 'operations_team', 'patient']),
  first_name: z.string().min(1, "First name required").optional(),
  last_name: z.string().min(1, "Last name required").optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number").optional(),
  preferred_language: z.string().default('en'),
  clinic_id: z.string().uuid().optional()
});
```

## Testing Strategy

### Unit Tests
- Service layer functions
- Validation schemas
- Permission hooks
- Component logic

### Integration Tests
- API endpoints
- Database functions
- User creation flow
- Permission enforcement

### E2E Tests
- Complete user management workflows
- Role-based access scenarios
- Error handling paths

## Deployment & Migration

### Database Migration
1. Deploy database functions
2. Apply RLS policies
3. Test with existing data

### Frontend Deployment
1. Deploy in feature branch
2. Test with admin users
3. Gradual rollout to production

## Success Criteria

### Functional Requirements
- ✅ Super admins can manage all users
- ✅ Clinic admins can manage users in their clinics
- ✅ Two-step user creation (Auth + Profile)
- ✅ Soft delete functionality
- ✅ User reactivation capability
- ✅ Role-based access control

### Performance Requirements
- User list loads in < 2 seconds
- User creation completes in < 5 seconds
- Search results appear in < 1 second
- Responsive design on all devices

### Security Requirements
- Proper RLS policy enforcement
- Secure password requirements
- Audit trail for user changes
- Input validation and sanitization

## Implementation Timeline

### Week 1: Database & Backend
- Database functions
- RLS policies
- Service layer
- API endpoints

### Week 2: Core UI Components
- User list and dashboard
- Create/edit forms
- Basic user actions

### Week 3: Advanced Features
- Permissions system
- Protected routes
- User activity tracking

### Week 4: Testing & Polish
- Comprehensive testing
- Bug fixes
- Performance optimization
- Documentation

## Post-Implementation

### Documentation Updates
- Admin user guide
- API documentation
- Development setup guide

### Training & Rollout
- Admin user training
- Support documentation
- Monitoring setup

---

**Next Steps:**
1. Review and approve this implementation plan
2. Set up development environment
3. Begin with Phase 1: Database Functions
4. Implement features incrementally following the defined phases

**Dependencies:**
- Supabase admin client setup
- Form validation library (zod + react-hook-form)
- UI component library (already using shadcn/ui)
- Data fetching library (SWR or TanStack Query) 