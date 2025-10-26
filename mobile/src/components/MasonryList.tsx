import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface MasonryListProps<T> {
  data: T[];
  numColumns?: number;
  renderItem: (item: T, index: number, colIndex: number) => React.ReactNode;
  spacing?: number;
}

export function MasonryList<T>({
  data,
  numColumns = 2,
  renderItem,
  spacing = 8,
}: MasonryListProps<T>) {
  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: numColumns }, () => []);
    data.forEach((item, index) => {
      cols[index % numColumns].push(item);
    });
    return cols;
  }, [data, numColumns]);

  const columnWidth = (Dimensions.get('window').width - spacing * (numColumns + 1)) / numColumns;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing / 2 }]}>
        {columns.map((col, colIndex) => (
        <View
            key={colIndex}
            style={[styles.column, { flex: 1, marginHorizontal: spacing / 2 }]}
        >
            {col.map((item, index) => (
                <Animated.View
                    key={index}
                    entering={FadeInUp.delay((index + colIndex * 5) * 80).springify()}
                    style={{ marginBottom: spacing }}
                >
                    {renderItem(item, index, colIndex)}
                </Animated.View>
            ))}
        </View>
        ))}
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  column: {
    flex: 1,
  },
});
