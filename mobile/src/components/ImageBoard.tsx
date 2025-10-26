import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { MasonryList } from './MasonryList';
import { PlaceCard } from './PlaceCard';
import { Place } from '../types';

interface Props {
  places: Place[];
  onSelect?: (place: Place) => void;
}

export const ImageBoard: React.FC<Props> = ({ places, onSelect }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MasonryList
        data={places}
        numColumns={2}
        spacing={10}
        renderItem={(place, index, colIndex) => (
            <PlaceCard place={place} itemIndex={index} colIndex={colIndex} onPress={onSelect} />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 8,
    width: '100%',
  },
});
