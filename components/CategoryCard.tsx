import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ProgressBar } from './ProgressBar';
import { Category } from '@/types/task';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { colors } from '@/constants/colors';
import { CheckCircle } from 'lucide-react-native';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const getCategoryProgress = useTaskStore((state) => state.getCategoryProgress);
  const getTasksByCategory = useTaskStore((state) => state.getTasksByCategory);
  
  const progress = getCategoryProgress(category.id);
  const tasks = getTasksByCategory(category.id);
  
  const handlePress = () => {
    router.push(`/category/${category.id}`);
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, darkMode && styles.darkContainer]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.colorIndicator,
            { backgroundColor: category.color },
          ]}
        />
        <Text style={[styles.title, darkMode && styles.darkText]}>{category.name}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={progress} 
          color={category.color} 
          backgroundColor={darkMode ? colors.gray[700] : colors.gray[200]}
        />
        <Text style={[styles.progressText, darkMode && styles.darkTextLight]}>{Math.round(progress)}%</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, darkMode && styles.darkText]}>{tasks.length}</Text>
          <Text style={[styles.statLabel, darkMode && styles.darkTextLight]}>Tasks</Text>
        </View>
        
        <View style={styles.stat}>
          <View style={styles.statValueContainer}>
            <CheckCircle size={14} color={colors.success} />
            <Text style={[styles.statValue, darkMode && styles.darkText]}>
              {tasks.filter(t => 
                t.subTasks.length > 0 && 
                t.subTasks.every(st => st.completed)
              ).length}
            </Text>
          </View>
          <Text style={[styles.statLabel, darkMode && styles.darkTextLight]}>Completed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: colors.gray[800],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    minWidth: 36,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
});