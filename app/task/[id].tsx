import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { SubTaskItem } from '@/components/SubTaskItem';
import { ProgressBar } from '@/components/ProgressBar';
import { MetadataSection } from '@/components/MetadataSection';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { formatDate, parseBulletPoints } from '@/utils/helpers';
import { Plus, Edit2, Trash2, ArrowLeft, Check, List, CheckCircle } from 'lucide-react-native';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  
  const task = useTaskStore((state) =>
    state.tasks.find((t) => t.id === id)
  );
  const categories = useTaskStore((state) => state.categories);
  const getTaskProgress = useTaskStore((state) => state.getTaskProgress);
  const toggleSubTask = useTaskStore((state) => state.toggleSubTask);
  const addSubTask = useTaskStore((state) => state.addSubTask);
  const updateSubTask = useTaskStore((state) => state.updateSubTask);
  const deleteSubTask = useTaskStore((state) => state.deleteSubTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  
  const [newSubTaskHeading, setNewSubTaskHeading] = useState('');
  const [newSubTaskDescription, setNewSubTaskDescription] = useState('');
  const [newSubTaskBulletPoints, setNewSubTaskBulletPoints] = useState('');
  const [newSubTaskTimeline, setNewSubTaskTimeline] = useState('');
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  
  if (!task) {
    return (
      <View style={[styles.notFound, darkMode && styles.darkContainer]}>
        <Text style={[styles.notFoundText, darkMode && styles.darkText]}>Task not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }
  
  const progress = getTaskProgress(task.id);
  const category = categories.find((c) => c.id === task.categoryId);
  
  // Check if all subtasks are completed
  const isCompleted = task.subTasks.length > 0 && 
    task.subTasks.every(subTask => subTask.completed);
  
  const handleToggleSubTask = (subTaskId: string) => {
    toggleSubTask(task.id, subTaskId);
  };
  
  const handleAddSubTask = () => {
    if (newSubTaskDescription.trim() || newSubTaskHeading.trim()) {
      const bulletPoints = parseBulletPoints(newSubTaskBulletPoints);
      
      addSubTask(task.id, {
        heading: newSubTaskHeading.trim() || undefined,
        description: newSubTaskDescription.trim(),
        bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
        timeline: newSubTaskTimeline.trim() || undefined,
      });
      
      setNewSubTaskHeading('');
      setNewSubTaskDescription('');
      setNewSubTaskBulletPoints('');
      setNewSubTaskTimeline('');
      setIsAddingSubTask(false);
    }
  };
  
  const handleEditSubTask = (subTaskId: string, updatedSubTask: Partial<{ heading?: string; description: string; bulletPoints?: string[]; timeline?: string }>) => {
    updateSubTask(task.id, subTaskId, updatedSubTask);
  };
  
  const handleDeleteSubTask = (subTaskId: string) => {
    Alert.alert(
      'Delete Sub-Task',
      'Are you sure you want to delete this sub-task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteSubTask(task.id, subTaskId),
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteTask(task.id);
            router.back();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditTask = () => {
    router.push(`/task/edit/${task.id}`);
  };
  
  const handleCompleteProgressStep = (stepId: string) => {
    if (!task.metadata.progressTracker) return;
    
    const updatedSteps = task.metadata.progressTracker.steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    );
    
    // Find the next incomplete step
    const nextIncompleteStep = updatedSteps.find(step => !step.completed);
    
    updateTask(task.id, {
      metadata: {
        ...task.metadata,
        progressTracker: {
          steps: updatedSteps,
          currentStep: nextIncompleteStep?.id,
        }
      }
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={darkMode ? colors.white : colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleEditTask}
                style={styles.headerAction}
              >
                <Edit2 size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteTask}
                style={styles.headerAction}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.header, darkMode && styles.darkHeader]}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, darkMode && styles.darkText]}>{task.title}</Text>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <CheckCircle size={16} color={colors.white} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
            </View>
            
            {category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: category.color + (darkMode ? '40' : '20') },
                ]}
              >
                <Text
                  style={[styles.categoryText, { color: darkMode ? colors.white : category.color }]}
                >
                  {category.name}
                </Text>
              </View>
            )}
            
            <Text style={[styles.description, darkMode && styles.darkTextLight]}>{task.description}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelContainer}>
                <Text style={[styles.progressLabel, darkMode && styles.darkTextLight]}>Progress</Text>
                <Text style={[styles.progressText, darkMode && styles.darkText]}>{Math.round(progress)}%</Text>
              </View>
              <ProgressBar
                progress={progress}
                color={isCompleted ? colors.success : (category?.color || colors.primary)}
                backgroundColor={darkMode ? colors.gray[700] : colors.gray[200]}
                height={10}
              />
            </View>
          </View>
          
          {task.metadata.progressTracker && task.metadata.progressTracker.steps && task.metadata.progressTracker.steps.length > 0 && (
            <View style={[styles.progressTrackerContainer, darkMode && styles.darkSection]}>
              <ProgressTracker 
                steps={task.metadata.progressTracker.steps}
                currentStepId={task.metadata.progressTracker.currentStep}
                onStepComplete={handleCompleteProgressStep}
                color={category?.color || colors.primary}
              />
            </View>
          )}
          
          <View style={[styles.subTasksContainer, darkMode && styles.darkSection]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Sub-Tasks</Text>
                <Text style={[styles.subTaskCount, darkMode && styles.darkTextLight]}>
                  {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} completed
                </Text>
              </View>
              {!isAddingSubTask && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setIsAddingSubTask(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  <Plus size={18} color={colors.white} />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isAddingSubTask && (
              <View style={[styles.addSubTaskContainer, darkMode && styles.darkAddSubTaskContainer]}>
                <TextInput
                  style={[styles.input, darkMode && styles.darkInput]}
                  value={newSubTaskHeading}
                  onChangeText={setNewSubTaskHeading}
                  placeholder="Heading (optional)"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <TextInput
                  ref={inputRef}
                  style={[styles.input, darkMode && styles.darkInput]}
                  value={newSubTaskDescription}
                  onChangeText={setNewSubTaskDescription}
                  placeholder="Enter sub-task description"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                  multiline
                />
                
                <View style={styles.bulletPointsHeader}>
                  <Text style={[styles.bulletPointsLabel, darkMode && styles.darkText]}>
                    Bullet Points (optional)
                  </Text>
                  <List size={16} color={darkMode ? colors.gray[400] : colors.gray[500]} />
                </View>
                
                <TextInput
                  style={[styles.textArea, darkMode && styles.darkInput]}
                  value={newSubTaskBulletPoints}
                  onChangeText={setNewSubTaskBulletPoints}
                  placeholder="• Enter bullet points here\n• Start each line with a bullet point\n• Add as many as you need"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <TextInput
                  style={[styles.input, darkMode && styles.darkInput]}
                  value={newSubTaskTimeline}
                  onChangeText={setNewSubTaskTimeline}
                  placeholder="Timeline (optional, e.g., 1-2 days)"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <View style={styles.addSubTaskActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setIsAddingSubTask(false);
                      setNewSubTaskHeading('');
                      setNewSubTaskDescription('');
                      setNewSubTaskBulletPoints('');
                      setNewSubTaskTimeline('');
                    }}
                    variant="outline"
                    style={{ marginRight: 8 }}
                  />
                  <Button
                    title="Add"
                    onPress={handleAddSubTask}
                    disabled={!newSubTaskDescription.trim() && !newSubTaskHeading.trim()}
                    icon={<Check size={16} color={colors.white} />}
                  />
                </View>
              </View>
            )}
            
            {task.subTasks.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={[styles.emptySubTasks, darkMode && styles.darkTextLight]}>
                  No sub-tasks yet. Add some to track progress.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyStateButton, { backgroundColor: category?.color || colors.primary }]}
                  onPress={() => {
                    setIsAddingSubTask(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                >
                  <Plus size={18} color={colors.white} />
                  <Text style={styles.emptyStateButtonText}>Add First Sub-Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.subTasksList}>
                {task.subTasks.map((subTask) => (
                  <SubTaskItem
                    key={subTask.id}
                    subTask={subTask}
                    onToggle={() => handleToggleSubTask(subTask.id)}
                    onEdit={(updatedSubTask) => handleEditSubTask(subTask.id, updatedSubTask)}
                    onDelete={() => handleDeleteSubTask(subTask.id)}
                    accentColor={category?.color}
                  />
                ))}
              </View>
            )}
          </View>
          
          <MetadataSection metadata={task.metadata} accentColor={category?.color} />
          
          <View style={styles.footer}>
            <Text style={[styles.dateText, darkMode && { color: colors.gray[500] }]}>
              Created: {formatDate(task.createdAt)}
            </Text>
            <Text style={[styles.dateText, darkMode && { color: colors.gray[500] }]}>
              Last Updated: {formatDate(task.updatedAt)}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  darkContainer: {
    backgroundColor: colors.gray[900],
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  darkHeader: {
    backgroundColor: colors.gray[800],
    borderBottomColor: colors.gray[700],
  },
  darkSection: {
    backgroundColor: colors.gray[800],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  completedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrackerContainer: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subTasksContainer: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subTaskCount: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptySubTasks: {
    fontSize: 14,
    color: colors.gray[400],
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  subTasksList: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  addSubTaskContainer: {
    marginBottom: 16,
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
  },
  darkAddSubTaskContainer: {
    backgroundColor: colors.gray[700],
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 8,
    color: colors.text,
  },
  darkInput: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[600],
    color: colors.white,
  },
  bulletPointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  bulletPointsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 8,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
  },
  addSubTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: colors.gray[400],
    marginBottom: 4,
  },
});