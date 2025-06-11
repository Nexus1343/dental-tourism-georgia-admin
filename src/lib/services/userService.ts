import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserFilters,
  ApiResponse, 
  PaginatedResponse,
  DatabaseResponse 
} from '@/types/database'

export class UserService {
  
  /**
   * Ensure admin client is available (server-side only)
   */
  private static ensureAdminClient() {
    if (!supabaseAdmin) {
      throw new Error('Admin operations are only available on the server-side')
    }
    return supabaseAdmin
  }
  
  /**
   * Get users with filtering and pagination
   */
  static async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    try {
      const { data, error } = await supabase.rpc('get_users', {
        role_filter: filters.role || null,
        status_filter: filters.status || null,
        search_term: filters.search || null,
        page_num: filters.page || 1,
        page_size: filters.pageSize || 20
      })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const response = data as DatabaseResponse<User[]>
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error occurred')
      }

      return {
        data: response.data || [],
        count: response.pagination?.total_count || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.page_size || 20,
        totalPages: response.pagination?.total_pages || 0
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.rpc('get_user_by_id', {
        user_id: userId
      })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const response = data as DatabaseResponse<User>
      
      if (!response.success) {
        return { error: response.error || 'User not found' }
      }

      return { data: response.data }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Create new user (two-step process: Auth + Profile)
   */
  static async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      const adminClient = this.ensureAdminClient()
      
      // Step 1: Create user in Supabase Auth (using admin client)
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })

      if (authError) {
        throw new Error(`Auth creation failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('User creation failed: No user data returned')
      }

      // Step 2: Update profile in users table (using admin client)
      const profileData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        preferred_language: userData.preferred_language || 'en',
        role: userData.role,
        status: 'active' // Set new users as active
      }

      const { data: profileResult, error: profileError } = await adminClient.rpc('update_user_profile', {
        user_id: authData.user.id,
        profile_data: profileData
      })

      if (profileError) {
        // TODO: Consider rolling back auth user creation
        throw new Error(`Profile update failed: ${profileError.message}`)
      }

      const response = profileResult as DatabaseResponse<User>
      
      if (!response.success) {
        throw new Error(response.error || 'Profile update failed')
      }

      return { 
        data: response.data,
        message: 'User created successfully' 
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, userData: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        user_id: userId,
        profile_data: userData
      })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const response = data as DatabaseResponse<User>
      
      if (!response.success) {
        return { error: response.error || 'Update failed' }
      }

      return { 
        data: response.data,
        message: 'User updated successfully' 
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Soft delete user (set status to inactive)
   */
  static async deleteUser(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase.rpc('soft_delete_user', {
        user_id: userId
      })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const response = data as DatabaseResponse<User>
      
      if (!response.success) {
        return { error: response.error || 'Delete failed' }
      }

      return { 
        data: true,
        message: 'User deactivated successfully' 
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Reactivate user (set status to active)
   */
  static async reactivateUser(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase.rpc('reactivate_user', {
        user_id: userId
      })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const response = data as DatabaseResponse<User>
      
      if (!response.success) {
        return { error: response.error || 'Reactivation failed' }
      }

      return { 
        data: true,
        message: 'User reactivated successfully' 
      }
    } catch (error) {
      console.error('Error reactivating user:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
} 