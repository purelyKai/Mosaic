import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

type Props = {
  updatePreferences: (value: string[]) => void;
  preferences: string[];
  categories: Record<string, string[]>
};

const PreferencesForm: React.FC<Props> = ({ updatePreferences, preferences, categories }) => {

const toggleCategory = (value: string) => {
  const updated = preferences.includes(value)
    ? preferences.filter(item => item !== value)
    : [...preferences, value];

  updatePreferences(updated);
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(categories).map(([theme, values]) => (
        <View key={theme} style={styles.section}>
          <Text style={styles.sectionTitle}>{theme}</Text>
          <View style={styles.grid}>
            {values.map(value => {
              const isSelected = preferences.includes(value);
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.box, isSelected && styles.selectedBox]}
                  onPress={() => toggleCategory(value)}
                >
                  <Text style={[styles.boxText, isSelected && styles.selectedText]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default PreferencesForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  box: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
    margin: 4,
  },
  selectedBox: {
    backgroundColor: '#4CAF50',
  },
  boxText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  selectedValues: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
