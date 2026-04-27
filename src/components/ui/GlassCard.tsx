import React from 'react';
import { View, type ViewProps, StyleSheet } from 'react-native';
import { palette } from '@/theme/palette';

type Props = ViewProps & {
  elevated?: boolean;
};

export function GlassCard({ style, elevated = false, ...rest }: Props) {
  return (
    <View
      style={[styles.card, elevated && styles.elevated, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.glass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
