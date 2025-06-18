import { supabase } from '@/lib/supabase'
import type { User, ApiResponse } from '@/types/database'

interface LoginCredentials {
  email: string
  password: string
}

interface AuthUser extends User {
  session: any
}

export class AuthService {
  /**
   * Sign in user and check if they have super_admin role
   */
  static async signIn(credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> {
    try {
      console.log('🔐 Starting authentication for:', credentials.email)
      
      // Step 1: Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      console.log('🔐 Auth result:', { authData: !!authData, authError })

      if (authError) {
        console.error('🔐 Auth error:', authError)
        if (authError.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password' }
        }
        return { error: authError.message }
      }

      if (!authData.user || !authData.session) {
        return { error: 'Authentication failed' }
      }

      // Step 2: Get user profile from the database
      console.log('🔐 Fetching user profile for ID:', authData.user.id)
      
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      console.log('🔐 Profile result:', { userProfile, profileError })

      if (profileError) {
        console.error('🔐 Profile error:', profileError)
        // Sign out the user if profile fetch fails
        await supabase.auth.signOut()
        return { error: `Failed to load user profile: ${profileError.message}` }
      }

      console.log('🔐 User profile:', userProfile)

      if (!userProfile) {
        console.error('🔐 No user profile found')
        await supabase.auth.signOut()
        return { error: 'User profile not found' }
      }

      // Step 3: Check if user has super_admin role
      console.log('🔐 Checking role:', userProfile.role)
      if (userProfile.role !== 'super_admin') {
        console.error('🔐 Role check failed:', userProfile.role)
        await supabase.auth.signOut()
        return { error: 'Access denied. Only super administrators can access this system.' }
      }

      // Step 4: Check if user is active
      console.log('🔐 Checking status:', userProfile.status)
      if (userProfile.status !== 'active') {
        console.error('🔐 Status check failed:', userProfile.status)
        await supabase.auth.signOut()
        return { error: 'Your account is not active. Please contact an administrator.' }
      }

      // Update last login time
      try {
        await supabase.rpc('update_user_profile', {
          user_id: authData.user.id,
          profile_data: { last_login_at: new Date().toISOString() }
        })
      } catch (updateError) {
        // Non-critical error, don't fail the login
        console.warn('Failed to update last login time:', updateError)
      }

      return {
        data: {
          ...userProfile,
          session: authData.session
        },
        message: 'Successfully signed in'
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred during sign in' }
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      return { 
        data: true,
        message: 'Successfully signed out' 
      }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'An unexpected error occurred during sign out' }
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        return { error: sessionError.message }
      }

      if (!sessionData.session || !sessionData.session.user) {
        return { data: null }
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single()

      if (profileError) {
        return { error: 'Failed to load user profile' }
      }

      if (!userProfile) {
        return { error: 'User profile not found' }
      }

      // Check if user still has super_admin role
      if (userProfile.role !== 'super_admin') {
        await this.signOut()
        return { error: 'Access denied. Super admin role required.' }
      }

      // Check if user is still active
      if (userProfile.status !== 'active') {
        await this.signOut()
        return { error: 'Your account is not active.' }
      }

      return {
        data: {
          ...userProfile,
          session: sessionData.session
        }
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return { error: 'Failed to get current user' }
    }
  }

  /**
   * Check if there's an active session
   */
  static async hasActiveSession(): Promise<boolean> {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession()
      return !error && !!sessionData.session
    } catch {
      return false
    }
  }
} 