import React, { useMemo } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Place } from '../types';
import { MaterialIcons } from '@expo/vector-icons'; // or any icon lib you're using

interface Props {
  place: Place;
  colIndex?: number;
  itemIndex?: number;
  isSelected: boolean;
  onPress?: (place: Place) => void;
}

export const PlaceCard: React.FC<Props> = ({
  place,
  colIndex = 0,
  itemIndex = 0,
  isSelected,
  onPress,
}) => {
  const heightPresets = [140, 180, 220, 260];

  const randomHeight = useMemo(() => {
    const baseIndex = (itemIndex + colIndex * 2) % heightPresets.length;
    return heightPresets[baseIndex];
  }, [itemIndex, colIndex]);

  return (
    <TouchableOpacity onPress={() => onPress?.(place)} style={styles.card} activeOpacity={0.9}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: place.imageUrl }}
          style={[styles.image, { height: randomHeight }]}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.overlay}>
            <MaterialIcons name="favorite" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.category}>{place.category}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
  },
  infoContainer: {
    padding: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
});
