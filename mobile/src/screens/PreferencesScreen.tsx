import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { AuthContext, useAuthContext } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import SignOutButton from '../components/GoogleLogoutButton';
import PreferencesForm from '../components/PreferencesForm';
import { postPreferences } from '../API/Elastic';
import { supabase } from '@/lib/supabase';

type GroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Groups'>;


const categories: Record<string, string[]> = {
    'Dietary': [
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

  for (const [category, values] of Object.entries(categories)) {
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


const PreferencesScreen = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const { session } = useAuthContext()
  const userId = session?.user?.id
  const [selected, setSelected] = useState<string[]>([]);

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Preferences</Text>
        <SignOutButton />
      </View>

      <PreferencesForm updatePreferences={setSelected} preferences={selected} categories={categories}/>

      {userId && (<View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={async () => {
          try {
            // Save preferences to Elastic
            await postPreferences(userId, listToSentances(selected));
            
            // Update filled_questionnaire flag in Supabase
            const { error } = await supabase
              .from('users')
              .update({ filled_questionnaire: true })
              .eq('id', userId);
            
            if (error) {
              console.error('Error updating questionnaire flag:', error);
              throw error;
            }
            
            // Trigger auth state refresh by signing the user out and back in immediately
            // This will cause AuthProvider to refetch the user data with the updated flag
            const currentSession = await supabase.auth.getSession();
            if (currentSession.data.session) {
              // Just refresh the session to trigger a re-fetch
              await supabase.auth.refreshSession();
            }
            
            navigation.navigate('Groups');
          } catch (error) {
            console.error('Error saving preferences:', error);
            // Optionally, show an alert to the user
          }
        }}>
          <Text style={styles.buttonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>)}
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
  signOutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
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
  groupCard: {
    backgroundColor: COLORS.light,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  groupName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  groupLocation: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  groupCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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

export default PreferencesScreen;
