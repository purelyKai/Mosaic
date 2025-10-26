import React, { useState, useEffect, useRef } from 'react';
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
import { getFeed } from '../API/Elastic';
import { supabase } from '@/lib/supabase'

type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;
type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const Tab = createBottomTabNavigator();

const DiscoverTab = ({ groupId }: { groupId: string }) => {

  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlaces((prev) =>
      prev.includes(place.id)
        ? prev.filter((id) => id !== place.id) // remove if already selected
        : [...prev, place.id] // add if not selected
    );
  };

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      const getPlaces = async () => {
        try {
          // Find the trip by id
          const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', groupId)
            .maybeSingle()  // Use maybeSingle instead of single to handle not found

          if (tripError) {
            console.error('Error finding trip:', tripError)
            throw new Error('Failed to search for trip')
          }
          console.log("groupId in getPlaces: ", groupId)
          console.log("trip in getPlaces: ", trip)

          if (trip){
            hasRun.current = true;

            const placesInRadius = await getFeed(trip);
            if(placesInRadius){
              setPlaces(placesInRadius);
            }
            console.log("places in radius",placesInRadius)
        }
        } catch (error) {
          console.error(error);
        }
      };
      getPlaces();
    }
  });

  return (
    <View style={styles.container}>
      {/* Add CategoryFilter component */}
      {/* Add SwipeableStack component */}
      <ImageBoard
        places={places}
        selectedPlaceIds={selectedPlaces}
        onSelect={handleSelectPlace}
      />
    </View>
  );
};

const GroupTab = ({ groupId }: { groupId: string }) => {
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigation = useNavigation<MainScreenNavigationProp>();

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
              
              // Navigate back to Groups screen (will trigger focus listener and refresh)
              navigation.navigate('Groups');
              
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert('Success', 'You have left the trip');
              }, 500);
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
        padding: SPACING.md,
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
        options={{
          title: 'Discover Places',
        }}
      >
        {() => <DiscoverTab groupId={groupId} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Group"
        options={{
          title: 'Group',
        }}
      >
        {() => <GroupTab groupId={groupId} />}
      </Tab.Screen>
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
