import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Group } from '../types';
import { apiService } from '../services/api.service';
import { useAuthContext } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import SignOutButton from '../components/GoogleLogoutButton';

type GroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Groups'>;

const GroupsScreen = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const {} = useAuthContext();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      // TEMPORARY: Using mock data for testing
      // TODO: Uncomment when backend is ready
      // const userGroups = await apiService.getUserGroups();
      // setGroups(userGroups);
      
      const { mockGroups } = await import('../utils/mockData');
      setGroups(mockGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('Main', { groupId });
  };

  const renderGroupCard = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => handleGroupPress(item.id)}
    >
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupLocation}>{item.location.city}</Text>
      <Text style={styles.groupCode}>Code: {item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <SignOutButton />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No trips yet</Text>
          <Text style={styles.emptySubtext}>Create or join a trip to get started</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => console.log('Create group')}>
          <Text style={styles.buttonText}>Create Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => console.log('Join group')}
        >
          <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Join Trip</Text>
        </TouchableOpacity>
      </View>
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

export default GroupsScreen;
