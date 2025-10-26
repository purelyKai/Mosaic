import { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import { User } from '../types/user.types'

export type AuthData = {
  session: Session | null | undefined
  user: User | null | undefined
  isLoading: boolean
  isLoggedIn: boolean
}

export const AuthContext = createContext<AuthData>({
  session: undefined,
  user: undefined,
  isLoading: true,
  isLoggedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)
