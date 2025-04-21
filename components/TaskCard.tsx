import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CircularProgress } from './CircularProgress';
import { Task } from '@/types/task';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/helpers';
import { CheckCircle, Clock, DollarSign, FileText, CheckSquare } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const router = useRouter();
  const getTaskProgress = useTaskStore((state) => state.getTaskProgress);
  const categories = useTaskStore((state) => state.categories);
  const { darkMode } = useSettingsStore();
  
  const progress = getTaskProgress(task.id);
  const category = categories.find((c) => c.id === task.categoryId);
  
  const handlePress = () => {
    router.push(`/task/${task.id}`);
  };
  
  // Calculate completion status
  const isCompleted = task.subTasks.length > 0 && 
    task.subTasks.every(subTask => subTask.completed);
  
  // Count completed subtasks
  const completedSubTasks = task.subTasks.filter(st => st.completed).length;
  
  // Count completed progress steps
  const completedSteps = task.metadata.progressTracker?.steps?.filter(step => step.completed).length || 0;
  const totalSteps = task.metadata.progressTracker?.steps?.length || 0;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        darkMode && styles.darkContainer,
        isCompleted && styles.completedContainer,
        isCompleted && darkMode && styles.darkCompletedContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text 
          style={[
            styles.title, 
            darkMode && styles.darkText
          ]} 
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <CircularProgress 
          progress={progress} 
          size={40} 
          color={isCompleted ? colors.success : category?.color} 
        />
      </View>
      
      <Text 
        style={[
          styles.description,
          darkMode && styles.darkTextLight
        ]} 
        numberOfLines={2}
      >
        {task.description}
      </Text>
      
      <View style={styles.metadataContainer}>
        {category && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: category.color + (darkMode ? '40' : '20') },
            ]}
          >
            <Text
              style={[styles.categoryText, { color: darkMode ? colors.white : category.color }]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </View>
        )}
        
        <View style={styles.metadata}>
          {task.metadata.timeline && (
            <View style={styles.metadataItem}>
              <Clock size={14} color={darkMode ? colors.gray[300] : colors.textLight} />
              <Text style={[styles.metadataText, darkMode && styles.darkTextLight]}>{task.metadata.timeline}</Text>
            </View>
          )}
          
          {task.metadata.cost && (
            <View style={styles.metadataItem}>
              <DollarSign size={14} color={darkMode ? colors.gray[300] : colors.textLight} />
              <Text style={[styles.metadataText, darkMode && styles.darkTextLight]}>{task.metadata.cost}</Text>
            </View>
          )}
          
          {task.metadata.documentsNeeded && task.metadata.documentsNeeded.length > 0 && (
            <View style={styles.metadataItem}>
              <FileText size={14} color={darkMode ? colors.gray[300] : colors.textLight} />
              <Text style={[styles.metadataText, darkMode && styles.darkTextLight]}>
                {task.metadata.documentsNeeded.length} document{task.metadata.documentsNeeded.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          <View style={styles.metadataItem}>
            <CheckSquare size={14} color={isCompleted ? colors.success : (darkMode ? colors.gray[300] : colors.textLight)} />
            <Text style={[
              styles.metadataText,
              darkMode && styles.darkTextLight,
              isCompleted && { color: colors.success, fontWeight: '500' }
            ]}>
              {completedSubTasks}/{task.subTasks.length}
            </Text>
          </View>
          
          {totalSteps > 0 && (
            <View style={styles.metadataItem}>
              <CheckCircle size={14} color={completedSteps === totalSteps ? colors.success : (darkMode ? colors.gray[300] : colors.textLight)} />
              <Text style={[
                styles.metadataText,
                darkMode && styles.darkTextLight,
                completedSteps === totalSteps && { color: colors.success, fontWeight: '500' }
              ]}>
                {completedSteps}/{totalSteps}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {isCompleted && (
        <View style={styles.completedBadge}>
          <CheckCircle size={12} color={colors.success} />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
      
      <Text style={[styles.date, darkMode && { color: colors.gray[500] }]}>
        {isCompleted ? 'Completed: ' : 'Updated: '}{formatDate(task.updatedAt)}
      </Text>
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
    shadowColor: colors.black,
    shadowOpacity: 0.2,
  },
  completedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  darkCompletedContainer: {
    borderLeftColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  metadataContainer: {
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: colors.textLight,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
  },
  date: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'right',
    marginTop: 4,
  },
});