import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface LocationPickerProps {
  onLocationSelected: (location: {
    city: string;
    latitude: number;
    longitude: number;
    radius_miles: number;
  }) => void;
  onCancel: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelected, onCancel }) => {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cityName, setCityName] = useState('');
  const [radiusMiles, setRadiusMiles] = useState<string>('15');
  const mapRef = useRef<MapView>(null);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setMarkerCoordinate(coordinate);
    
    // Zoom in when marker is placed
    const newRegion = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);
  };

  const handleConfirm = () => {
    if (!markerCoordinate) {
      Alert.alert('Select Location', 'Please tap on the map to set a location');
      return;
    }

    if (!cityName.trim()) {
      Alert.alert('Enter Location Name', 'Please enter a name for this location');
      return;
    }

    const radius = parseInt(radiusMiles, 10);
    if (isNaN(radius) || radius < 1 || radius > 100) {
      Alert.alert('Invalid Radius', 'Please enter a radius between 1 and 100 miles');
      return;
    }

    onLocationSelected({
      city: cityName,
      latitude: markerCoordinate.latitude,
      longitude: markerCoordinate.longitude,
      radius_miles: radius,
    });
  };

  // Convert miles to meters for the circle (1 mile = 1609.34 meters)
  const radiusInMeters = (parseInt(radiusMiles, 10) || 15) * 1609.34;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Select Trip Location</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* City Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Location Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Tokyo, Paris, New York..."
            placeholderTextColor={COLORS.textSecondary}
            value={cityName}
            onChangeText={setCityName}
          />
          <Text style={styles.hint}>Enter a name for your trip location</Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                // provider={PROVIDER_GOOGLE}
                initialRegion={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {markerCoordinate && (
                <>
                    <Marker coordinate={markerCoordinate} />
                    <Circle
                    center={markerCoordinate}
                    radius={radiusInMeters}
                    fillColor="rgba(0, 122, 255, 0.1)"
                    strokeColor="rgba(0, 122, 255, 0.5)"
                    strokeWidth={2}
                    />
                </>
                )}
            </MapView>
            </View>

        {/* Radius Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Search Radius (miles)</Text>
          <TextInput
            style={styles.input}
            value={radiusMiles}
            onChangeText={setRadiusMiles}
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={3}
          />
          <Text style={styles.hint}>Enter radius between 1-100 miles</Text>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            1. Enter a name for your trip location{'\n'}
            2. Tap on the map to set the exact point{'\n'}
            3. Adjust the search radius if needed{'\n'}
            4. Tap "Confirm Location"
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cancelButton: {
    padding: SPACING.sm,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    height: 400,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.light,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  instructions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  instructionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
});
