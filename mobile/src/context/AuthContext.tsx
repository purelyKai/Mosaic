import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, getCurrentUser, signOut as supabaseSignOut } from '../services/supabase.service';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // TEMPORARY: Start with no user to show login flow
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock sign in function for testing
  const mockSignIn = () => {
    setUser({
      id: 'mock-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: '',
      accessToken: 'mock-token',
    });
  };

  useEffect(() => {
    // TODO: Uncomment when ready to implement real auth
    // Check active session
    // checkUser();

    // Listen for auth changes
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     console.log('Auth state changed:', event);
    //     if (session?.user) {
    //       await updateUser(session);
    //     } else {
    //       setUser(null);
    //     }
    //     setLoading(false);
    //   }
    // );

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  const checkUser = async () => {
    // TODO: Uncomment when ready to implement real auth
    // try {
    //   const currentUser = await getCurrentUser();
    //   if (currentUser) {
    //     const session = await supabase.auth.getSession();
    //     if (session.data.session) {
    //       await updateUser(session.data.session);
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error checking user:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const updateUser = async (session: Session) => {
    const supabaseUser = session.user;
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
      photoURL: supabaseUser.user_metadata?.avatar_url || '',
      accessToken: session.access_token,
    });
  };

  const signOut = async () => {
    // TODO: Uncomment when ready for real auth
    // await supabaseSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, mockSignIn } as any}>
      {children}
    </AuthContext.Provider>
  );
};
