import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

type FoodCategories = Record<string, string[]>;

const FOOD_CATEGORIES: FoodCategories = {
    'Dietary:': [
    'Vegan', 'Vegetarian', 'Gluten-Free',
  ],
  'Dining Styles & Venues': [
    'Bars', 'Cafes', 'Brunch', 'Fine Dining', 'Casual Dining',
    'Street Food', 'Food Trucks', 'Buffet', 'Takeout', 'Delivery', 'Farm-to-Table',
  ],
  'Activities': [
    'Outdoor', 'Live Music', 'Museums', 'Fitness', 'Spa',
    'Animals', 'Shows'
  ]
};

function categorizeSelections(selections: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const [category, values] of Object.entries(FOOD_CATEGORIES)) {
    result[category] = selections.filter(item => values.includes(item));
  }

  return result;
}

function categorySentances(categorized: Record<string, string[]>): string[] {
  return Object.entries(categorized)
    .filter(([_, values]) => values.length > 0)
    .map(
      ([category, values]) =>
        `User has ${category} preferences of ${values.join(', ')}.`
    );
}

function listToSentances(selections: string[]): string {

  const categorized: Record<string, string[]> = categorizeSelections(selections);
  const sentances: string[] = categorySentances(categorized)

  return sentances.join(' ');
}

type Props = {
  updatePreferences: (value: string[]) => void;
  preferences: string[];
};

const PreferencesForm: React.FC<Props> = ({ updatePreferences, preferences }) => {

const toggleCategory = (value: string) => {
  const updated = preferences.includes(value)
    ? preferences.filter(item => item !== value)
    : [...preferences, value];

  updatePreferences(updated);
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(FOOD_CATEGORIES).map(([theme, values]) => (
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
