import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import GoogleLoginButton from '../components/GoogleLoginButton';

const AuthScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mosaic</Text>
      <Text style={styles.subtitle}>Plan trips together</Text>
      <GoogleLoginButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
});

export default AuthScreen;
