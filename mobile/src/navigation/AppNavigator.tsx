import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import GroupsScreen from '../screens/GroupsScreen';
import MainScreen from '../screens/MainScreen';
import { RootStackParamList } from './types';
import FoodForm from '../components/PreferencesForm';
import PreferencesScreen from '../screens/PreferencesScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuthContext()
  console.log(isLoggedIn, isLoading)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="Groups" component={GroupsScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
