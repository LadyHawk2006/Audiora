"use client"
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import supabase from '@/lib/supabase'

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  sendPasswordReset: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialCheckComplete, setInitialCheckComplete] = useState(false)

  // Check session and set user
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      setUser(session?.user ?? null)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
      setInitialCheckComplete(true)
    }
  }, [])

  useEffect(() => {
    // Only run the initial check once
    if (!initialCheckComplete) {
      checkSession()
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only update if the initial check is complete
        if (initialCheckComplete) {
          setUser(session?.user ?? null)
        }
        
        switch (event) {
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            break
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery in progress')
            break
          case 'SIGNED_IN':
            console.log('User signed in')
            break
          case 'SIGNED_OUT':
            console.log('User signed out')
            break
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [checkSession, initialCheckComplete])

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Optional: Clear local storage/session storage if you store anything
      localStorage.clear()
      sessionStorage.clear()
  
      // Clear user from local state
      setUser(null)
  
      return true
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
 

  // Sign up new user
  const signUp = async (email, password, metadata = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Send password reset email
  const sendPasswordReset = async (email) => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw error
      setUser(prev => ({ ...prev, user_metadata: updates }))
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading: isLoading || !initialCheckComplete,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    signUp,
    sendPasswordReset,
    updatePassword,
    updateProfile,
    clearError: () => setError(null),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}