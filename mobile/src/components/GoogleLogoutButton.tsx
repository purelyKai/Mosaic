import { supabase } from '@/lib/supabase'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import React from 'react'
import { Button } from 'react-native'

const handleSignOut = async () => {
  try {
    // Sign out from Google first
    await GoogleSignin.signOut()
  } catch (error) {
    console.error('Error signing out from Google:', error)
  }

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out from Supabase:', error)
  }
}

export default function GoogleLogoutButton() {
  return <Button title="Sign out" onPress={handleSignOut} />
}
