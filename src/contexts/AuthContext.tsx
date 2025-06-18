'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService } from '@/lib/services/authService'
import type { User } from '@/types/database'

interface AuthUser extends User {
  session: any
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check initial authentication state
  useEffect(() => {
    checkAuth()
  }, [])

  // Redirect logic based on auth state and current path
  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login'
      const isAdminRoute = pathname.startsWith('/admin')
      
      console.log('🔄 AuthContext redirect check:', { 
        user: !!user, 
        loading, 
        pathname, 
        isLoginPage, 
        isAdminRoute 
      })
      
      if (!user && isAdminRoute) {
        // User not authenticated but trying to access admin routes
        console.log('🔄 Redirecting to login (no user + admin route)')
        router.push('/login')
      } else if (user && isLoginPage) {
        // User authenticated but on login page
        console.log('🔄 Redirecting to admin (user + login page)')
        router.push('/admin')
      }
    }
  }, [user, loading, pathname, router])

  const checkAuth = async () => {
    try {
      console.log('🔄 Checking authentication state...')
      const result = await AuthService.getCurrentUser()
      
      console.log('🔄 Auth check result:', { success: !!result.data, error: result.error })
      
      if (result.data) {
        console.log('🔄 Setting user:', result.data.email)
        setUser(result.data)
      } else {
        console.log('🔄 No user found, clearing state')
        setUser(null)
      }
    } catch (error) {
      console.error('🔄 Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await AuthService.signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const refreshUser = async () => {
    const result = await AuthService.getCurrentUser()
    if (result.data) {
      setUser(result.data)
    } else {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 