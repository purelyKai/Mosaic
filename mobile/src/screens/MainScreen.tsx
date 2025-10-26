import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRoute, RouteProp, useNavigation, ParamListBase } from '@react-navigation/native';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { CategoryType, Place } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { ImageBoard } from '../components/ImageBoard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryContext } from '../context/CategoryContext';

type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;
type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const Tab = createBottomTabNavigator();

const DiscoverTab = () => {
  const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Hidden Beach',
    category: 'nature',
    description: 'A secluded beach with turquoise water.',
    imageUrl: 'https://picsum.photos/300/400',
    location: { lat: 12.34, lng: 56.78 },
    address: '123 Ocean Dr',
  },
  {
    id: '2',
    name: 'Downtown Coffee',
    category: 'drinks',
    description: 'Cozy spot for remote work.',
    imageUrl: 'https://picsum.photos/400/500',
    location: { lat: 12.35, lng: 56.79 },
    address: '456 City St',
  },

    {   
    id: '3',
    name: 'Art Museum',
    category: 'entertainment',
    description: 'Modern art exhibits.',
    imageUrl: 'https://picsum.photos/500/600',
    location: { lat: 12.36, lng: 56.80 },
    address: '789 Art Ln',
    },
    {   
    id: '4',
    name: 'Gourmet Bistro',
    category: 'food',
    description: 'Fine dining experience.',
    imageUrl: 'https://picsum.photos/600/700',
    location: { lat: 12.37, lng: 56.81 },
    address: '101 Food Ct',
    },
    {
    id: '5',
    name: 'City Park',
    category: 'nature',
    description: 'Lush green space in the city.',
    imageUrl: 'https://picsum.photos/700/800',
    location: { lat: 12.38, lng: 56.82 },
    address: '202 Park Ave',
    },
    {
    id: '6',
    name: 'Jazz Club',
    category: 'entertainment',
    description: 'Live jazz music every night.',
    imageUrl: 'https://picsum.photos/800/900',
    location: { lat: 12.39, lng: 56.83 },
    address: '303 Music Blvd',
    },
    {
    id: '7',
    name: 'Sushi Place',
    category: 'food',
    description: 'Fresh sushi and sashimi.',
    imageUrl: 'https://picsum.photos/900/1000',
    location: { lat: 12.40, lng: 56.84 },
    address: '404 Sushi St',
    
    }


];

  return (
    <View style={styles.container}>
      {/* Add CategoryFilter component */}
      {/* Add SwipeableStack component */}
      <ImageBoard
        places={mockPlaces}
        onSelect={(place) => console.log('Selected:', place.name)}
      />
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

const CustomHeader = ({
  navigation,
  route,
}: {
  navigation: BottomTabNavigationProp<ParamListBase, string, undefined>;
  route: RouteProp<ParamListBase>;
}) => {

  const { selectedCategory, setSelectedCategory } = useCategoryContext();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.background
      }}
    >
      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: SPACING.xs}} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
        <Text style={{fontWeight: 400}}>Back</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text onPress={() => setSelectedCategory('All')} style={selectedCategory === "All" ? styles.selectedCategoryText : styles.categoryText}>All</Text>
        <Text onPress={() => setSelectedCategory('Food')} style={selectedCategory === "Food" ? styles.selectedCategoryText : styles.categoryText}>Food</Text>
        <Text onPress={() => setSelectedCategory('Entertainment')} style={selectedCategory === "Entertainment" ? styles.selectedCategoryText : styles.categoryText}>Entertainment</Text>
        <Text onPress={() => setSelectedCategory('Nature')} style={selectedCategory === "Nature" ? styles.selectedCategoryText : styles.categoryText}>Nature</Text>
      </View>
    </SafeAreaView>
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
    headerStyle: { backgroundColor: COLORS.background },
    tabBarStyle: { backgroundColor: COLORS.background },
    header: ({ navigation, route }) => (
      <CustomHeader navigation={navigation} route={route} />
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
  backButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  categoryText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '400'
  },
  selectedCategoryText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    borderBottomColor: COLORS.text,
    borderBottomWidth: 2
  }
});

export default MainScreen;
