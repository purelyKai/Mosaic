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

const GroupTab = ({ route }: { route: any }) => {
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigation = useNavigation<MainScreenNavigationProp>();
  const mainRoute = useRoute<MainScreenRouteProp>();
  const { groupId } = mainRoute.params;

  React.useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      const { getTripMembers } = await import('../services/tripService');
      const tripMembers = await getTripMembers(groupId);
      setMembers(tripMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTrip = async () => {
    const { Alert } = await import('react-native');
    Alert.alert(
      'Leave Trip',
      'Are you sure you want to leave this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { leaveTrip } = await import('../services/tripService');
              await leaveTrip(groupId);
              Alert.alert('Success', 'You have left the trip');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave trip');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.groupContainer}>
      {/* Members Section */}
      <View style={styles.membersSection}>
        <View style={styles.membersSectionHeader}>
          <Text style={styles.membersSectionTitle}>Trip Members</Text>
          <TouchableOpacity onPress={handleLeaveTrip} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave Trip</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  {member.photo_url ? (
                    <View style={styles.memberAvatarImage} />
                  ) : (
                    <Text style={styles.memberAvatarText}>
                      {member.display_name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.display_name.substring(0, 10)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Itinerary Section - Placeholder */}
      <View style={styles.itinerarySection}>
        <Text style={styles.itinerarySectionTitle}>Itinerary</Text>
        <View style={styles.itineraryPlaceholder}>
          <Text style={styles.itineraryPlaceholderText}>
            Coming soon...
          </Text>
          <Text style={styles.itineraryPlaceholderSubtext}>
            Your trip itinerary will appear here
          </Text>
        </View>
      </View>
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
  },
  // Group Tab Styles
  groupContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  membersSection: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  membersSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  leaveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.light,
    borderRadius: 8,
  },
  leaveButtonText: {
    fontSize: FONT_SIZES.sm,
    color: '#EF4444',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 70,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  memberAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.light,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
  },
  itinerarySection: {
    flex: 1,
    padding: SPACING.lg,
  },
  itinerarySectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  itineraryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryPlaceholderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  itineraryPlaceholderSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default MainScreen;
