import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type UserRole = 'Admin' | 'Editor' | 'Viewer' | 'Visualizador'
export type UserStatus = 'Pending' | 'Authorized' | 'Revoked'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  signUp: (email: string, password: string, data?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  changePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Auth session initialization error:', error.message)
          // Gracefully intercept invalid/missing refresh token errors
          if (
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('Invalid Refresh Token')
          ) {
            // Programmatically force a clean sign out to purge stale local storage
            supabase.auth.signOut().catch((signOutErr) => {
              console.warn('Silent sign-out cleanup failed:', signOutErr.message)
            })
          }
        }
        setSession(session)
        setUser(session?.user ?? null)
        if (!session?.user) {
          setLoading(false)
        }
      })
      .catch((err) => {
        // Fallback for unhandled promise rejections during session fetch
        console.error('Unhandled session retrieval exception:', err)
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null)
      }
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.warn('Profile fetch warning:', error.message)
          }
          if (data) setProfile(data as Profile)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Profile fetch exception:', err)
          setLoading(false)
        })
    }
  }, [user])

  const signUp = async (email: string, password: string, data?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data,
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const changePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        signUp,
        signIn,
        signOut,
        changePassword,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
