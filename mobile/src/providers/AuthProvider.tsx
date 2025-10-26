import { AuthContext } from '../context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { User } from '../types/user.types'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>()
  const [user, setUser] = useState<User | null | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      console.log('Initial session fetch:', { session, error })

      if (error) {
        console.error('Error fetching session:', error)
      }

      setSession(session)
      // Don't set isLoading to false here - let the profile effect handle it
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session })
      setSession(session)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch the user data when the session changes
  useEffect(() => {
    const fetchUser = async () => {
      // Only set loading if session is not undefined (meaning we've finished initial fetch)
      if (session !== undefined) {
        setIsLoading(true)

        if (session) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching user:', error)
            setUser(null)
          } else {
            setUser(data as User)
          }
        } else {
          setUser(null)
        }

        setIsLoading(false)
      }
    }

    fetchUser()
  }, [session])

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        user,
        isLoggedIn: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
