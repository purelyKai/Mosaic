import { useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { SplashScreen } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export function SplashScreenController() {
  const { isLoading } = useAuthContext()
  
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])
  
  return null
}
