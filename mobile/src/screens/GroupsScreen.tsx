import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Trip } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import GoogleLogoutButton from '../components/GoogleLogoutButton';
import { getUserTrips, createTrip, joinTrip } from '../services/tripService';
import { LocationPicker } from '../components/LocationPicker';

type GroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Groups'>;

const GroupsScreen = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  
  // Create trip form
  const [tripName, setTripName] = useState('');
  const [locationData, setLocationData] = useState<{
    city: string;
    latitude: number;
    longitude: number;
    radius_miles: number;
  } | null>(null);
  
  // Join trip form
  const [tripCode, setTripCode] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  // Refresh trips when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTrips();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const userTrips = await getUserTrips();
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreateTrip = () => {
    setTripName('');
    setLocationData(null);
    setShowCreateModal(true);
  };

  const handleLocationSelected = (location: typeof locationData) => {
    setLocationData(location);
    setShowLocationPicker(false);
    setShowCreateModal(true);
  };

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    if (!locationData) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    try {
      setCreating(true);
      const newTrip = await createTrip({
        name: tripName,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        radius_miles: locationData.radius_miles,
      });
      
      Alert.alert('Success', `Trip created! Code: ${newTrip.code}`);
      setShowCreateModal(false);
      setTripName('');
      setLocationData(null);
      await loadTrips();
    } catch (error: any) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', error.message || 'Failed to create trip');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!tripCode.trim()) {
      Alert.alert('Error', 'Please enter a trip code');
      return;
    }

    try {
      setJoining(true);
      const trip = await joinTrip(tripCode.toUpperCase());
      Alert.alert('Success', `Joined trip: ${trip.name}`);
      setShowJoinModal(false);
      setTripCode('');
      await loadTrips();
    } catch (error: any) {
      console.error('Error joining trip:', error);
      Alert.alert('Error', error.message || 'Failed to join trip');
    } finally {
      setJoining(false);
    }
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('Main', { groupId: tripId });
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => handleTripPress(item.id)}
    >
      <Text style={styles.tripName}>{item.name}</Text>
      <Text style={styles.tripLocation}>{item.city}</Text>
      <Text style={styles.tripRadius}>{item.radius_miles} miles radius</Text>
      <Text style={styles.tripCode}>Code: {item.code}</Text>
    </TouchableOpacity>
  );

  if (showLocationPicker) {
    return (
      <LocationPicker
        onLocationSelected={handleLocationSelected}
        onCancel={() => {
          setShowLocationPicker(false);
          setShowCreateModal(true);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <GoogleLogoutButton />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No trips yet</Text>
          <Text style={styles.emptySubtext}>Create or join a trip to get started</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStartCreateTrip}>
          <Text style={styles.buttonText}>Create Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setShowJoinModal(true)}
        >
          <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Join Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Create Trip Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Trip</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Trip Name"
              placeholderTextColor={COLORS.textSecondary}
              value={tripName}
              onChangeText={setTripName}
              autoFocus
            />
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                setShowCreateModal(false);
                setShowLocationPicker(true);
              }}
            >
              <Text style={styles.locationButtonText}>
                {locationData ? `📍 ${locationData.city} (${locationData.radius_miles}mi)` : '📍 Select Location'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCreateModal(false)}
                disabled={creating}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonSecondaryText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateTrip}
                disabled={creating || !locationData}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Join Trip Modal */}
      <Modal visible={showJoinModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Trip</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter Trip Code"
              placeholderTextColor={COLORS.textSecondary}
              value={tripCode}
              onChangeText={setTripCode}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowJoinModal(false)}
                disabled={joining}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonSecondaryText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleJoinTrip}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Join</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  tripCard: {
    backgroundColor: COLORS.light,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  tripName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tripLocation: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tripRadius: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tripCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  locationButton: {
    backgroundColor: COLORS.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  locationButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalButtonSecondaryText: {
    color: COLORS.primary,
  },
  buttonContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
  },
});

export default GroupsScreen;
