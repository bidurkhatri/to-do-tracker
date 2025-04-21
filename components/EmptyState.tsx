import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Button } from './Button';
import { ClipboardList } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  const { darkMode } = useSettingsStore();
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <ClipboardList size={48} color={darkMode ? colors.gray[300] : colors.gray[400]} />}
      </View>
      
      <Text style={[styles.title, darkMode && styles.darkText]}>{title}</Text>
      
      {description && <Text style={[styles.description, darkMode && styles.darkTextLight]}>{description}</Text>}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  darkText: {
    color: colors.white,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  button: {
    marginTop: 8,
  },
});