import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { supabase } from '@/lib/supabase'

const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch {}

    await supabase.auth.signOut();
};

export default function () {
  GoogleSignin.configure({
    iosClientId: '968440012903-g9t5jtr2jc2khfuu3mtaa0q4bofrqccb.apps.googleusercontent.com',
    webClientId: '968440012903-ma04tus0j7j222v1euo1qcgeilc3jati.apps.googleusercontent.com',
  })

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        await signOut()
        try {
          await GoogleSignin.hasPlayServices()
          const userInfo = await GoogleSignin.signIn()
          console.log(userInfo)
          if (userInfo?.data?.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: userInfo.data.idToken,
            })
            console.log(error, data)
          } else {
            console.log("no token")
            throw new Error('no ID token present!')
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            console.log("cancelled")
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
            console.log("nin progress")
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
            console.log("na")
          } else {
            // some other error happened
            console.log(error)
            console.log("other")
          }
        }
      }}
    />
  )
}
