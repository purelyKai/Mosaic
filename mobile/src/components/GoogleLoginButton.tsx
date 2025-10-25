import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { supabase } from '@/lib/supabase'

// Configure Google Sign-In once when module loads
GoogleSignin.configure({
  iosClientId: '968440012903-g9t5jtr2jc2khfuu3mtaa0q4bofrqccb.apps.googleusercontent.com',
  webClientId: '968440012903-ma04tus0j7j222v1euo1qcgeilc3jati.apps.googleusercontent.com',
})

const handleGoogleSignIn = async () => {
  try {
    // Sign out first to ensure clean state
    try {
      await GoogleSignin.signOut()
    } catch (error) {
      // Ignore sign out errors
    }

    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()

    if (userInfo?.data?.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      })

      if (error) {
        console.error('Supabase sign in error:', error)
        throw error
      }

      console.log('Successfully signed in:', data.user?.email)
    } else {
      throw new Error('No ID token received from Google Sign-In')
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled the sign-in flow')
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Sign-in already in progress')
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('Play services not available or outdated')
    } else {
      console.error('Google Sign-In error:', error)
    }
  }
}

export default function GoogleLoginButton() {
  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={handleGoogleSignIn}
    />
  )
}
