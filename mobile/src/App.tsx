import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AuthProvider from './providers/AuthProvider';
import { AppNavigator } from './navigation/AppNavigator';
import { SplashScreenController } from './components/SplashScreenController';
import CategoryProvider from './providers/CategoryProvider';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CategoryProvider>
          <SplashScreenController />
          <AppNavigator />
          <StatusBar style="auto" />
        </CategoryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
