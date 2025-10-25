import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { CategoryType } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;
type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const Tab = createBottomTabNavigator();

const DiscoverTab = () => {
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Discover Tab</Text>
      <Text style={styles.placeholderSubtext}>Swipe through places</Text>
      {/* Add CategoryFilter component */}
      {/* Add SwipeableStack component */}
    </View>
  );
};

const GroupTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Group Tab</Text>
      <Text style={styles.placeholderSubtext}>View members and recommendations</Text>
      {/* Add MemberList component */}
      {/* Add Recommendations section */}
    </View>
  );
};

const MainScreen = () => {
  const route = useRoute<MainScreenRouteProp>();
  const navigation = useNavigation<MainScreenNavigationProp>();
  const { groupId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={DiscoverTab}
        options={{
          title: 'Discover Places',
        }}
      />
      <Tab.Screen 
        name="Group" 
        component={GroupTab}
        options={{
          title: 'Group',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default MainScreen;
