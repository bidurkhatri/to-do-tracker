import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { SubTask, ProgressStep } from '@/types/task';
import { generateId, parseBulletPoints } from '@/utils/helpers';
import { ArrowLeft, Plus, X, FileText, List, Calendar, Clock } from 'lucide-react-native';
import { MarkdownEditor } from '@/components/MarkdownEditor';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const categories = useTaskStore((state) => state.categories);
  const addTask = useTaskStore((state) => state.addTask);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  
  // Subtask states
  const [subTasks, setSubTasks] = useState<
    Array<{ id: string; heading?: string; description: string; bulletPoints?: string[]; timeline?: string }>
  >([]);
  const [newSubTaskHeading, setNewSubTaskHeading] = useState('');
  const [newSubTaskDescription, setNewSubTaskDescription] = useState('');
  const [newSubTaskBulletPoints, setNewSubTaskBulletPoints] = useState('');
  const [newSubTaskTimeline, setNewSubTaskTimeline] = useState('');
  
  // Metadata states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [cost, setCost] = useState('');
  const [timeline, setTimeline] = useState('');
  const [documentsNeeded, setDocumentsNeeded] = useState('');
  const [contingencies, setContingencies] = useState('');
  
  // Progress tracker states
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepDueDate, setNewStepDueDate] = useState('');
  
  const handleAddSubTask = () => {
    if (newSubTaskDescription.trim() || newSubTaskHeading.trim()) {
      const bulletPoints = parseBulletPoints(newSubTaskBulletPoints);
      
      setSubTasks([
        ...subTasks,
        {
          id: generateId(),
          heading: newSubTaskHeading.trim() || undefined,
          description: newSubTaskDescription.trim(),
          bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
          timeline: newSubTaskTimeline.trim() || undefined,
        },
      ]);
      
      setNewSubTaskHeading('');
      setNewSubTaskDescription('');
      setNewSubTaskBulletPoints('');
      setNewSubTaskTimeline('');
    }
  };
  
  const handleRemoveSubTask = (id: string) => {
    setSubTasks(subTasks.filter((st) => st.id !== id));
  };
  
  const handleAddProgressStep = () => {
    if (newStepTitle.trim()) {
      setProgressSteps([
        ...progressSteps,
        {
          id: generateId(),
          title: newStepTitle.trim(),
          description: newStepDescription.trim() || undefined,
          dueDate: newStepDueDate.trim() || undefined,
          completed: false,
        },
      ]);
      
      setNewStepTitle('');
      setNewStepDescription('');
      setNewStepDueDate('');
    }
  };
  
  const handleRemoveProgressStep = (id: string) => {
    setProgressSteps(progressSteps.filter((step) => step.id !== id));
  };
  
  const handleCreateTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task');
      return;
    }
    
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    // Parse documents needed into an array
    const documentsArray = documentsNeeded
      .split('\n')
      .map(doc => doc.trim())
      .filter(doc => doc.length > 0);
    
    const taskId = addTask({
      title,
      description,
      categoryId: selectedCategoryId,
      subTasks: subTasks.map((st) => ({
        ...st,
        completed: false,
      })),
      metadata: {
        contact: {
          name: contactName.trim() || undefined,
          email: contactEmail.trim() || undefined,
          phone: contactPhone.trim() || undefined,
        },
        cost: cost.trim() || undefined,
        timeline: timeline.trim() || undefined,
        documentsNeeded: documentsArray.length > 0 ? documentsArray : undefined,
        contingencies: contingencies.trim() || undefined,
        progressTracker: progressSteps.length > 0 
          ? {
              steps: progressSteps,
              currentStep: progressSteps[0].id,
            }
          : undefined,
      },
    });
    
    router.replace(`/task/${taskId}`);
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Task',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={darkMode ? colors.white : colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
          <StatusBar style={darkMode ? "light" : "dark"} />
          
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.section, darkMode && styles.darkSection]}>
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Task Details</Text>
              
              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              
              <Text style={[styles.label, darkMode && styles.darkText]}>Description</Text>
              <View style={styles.markdownContainer}>
                <MarkdownEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter task description. You can use Markdown formatting."
                />
              </View>
              
              <Text style={[styles.label, darkMode && styles.darkText]}>Category</Text>
              {categories.length === 0 ? (
                <View style={styles.noCategoriesWarning}>
                  <Text style={[styles.noCategoriesText, darkMode && styles.darkTextLight]}>
                    No categories available. Please create a category first.
                  </Text>
                  <Button
                    title="Create Category"
                    onPress={() => router.push('/categories')}
                    variant="outline"
                    size="small"
                    style={{ marginTop: 8 }}
                  />
                </View>
              ) : (
                <View style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor:
                            selectedCategoryId === category.id
                              ? category.color
                              : category.color + '20',
                        },
                      ]}
                      onPress={() => setSelectedCategoryId(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color:
                              selectedCategoryId === category.id
                                ? colors.white
                                : category.color,
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={[styles.section, darkMode && styles.darkSection]}>
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Sub-Tasks</Text>
              
              {subTasks.map((subTask) => (
                <View key={subTask.id} style={[styles.subTaskItem, darkMode && styles.darkBorder]}>
                  <View style={styles.subTaskContent}>
                    {subTask.heading && (
                      <Text style={[styles.subTaskHeading, darkMode && styles.darkText]}>
                        {subTask.heading}
                      </Text>
                    )}
                    <Text style={[styles.subTaskDescription, darkMode && styles.darkText]}>
                      {subTask.description}
                    </Text>
                    
                    {subTask.bulletPoints && subTask.bulletPoints.length > 0 && (
                      <View style={styles.bulletPointsContainer}>
                        {subTask.bulletPoints.map((point, index) => (
                          <View key={index} style={styles.bulletPoint}>
                            <Text style={[styles.bulletDot, darkMode && styles.darkTextLight]}>•</Text>
                            <Text style={[styles.bulletText, darkMode && styles.darkTextLight]}>
                              {point}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {subTask.timeline && (
                      <View style={styles.timelineContainer}>
                        <Clock size={12} color={darkMode ? colors.gray[400] : colors.gray[500]} />
                        <Text style={[styles.timelineText, darkMode && styles.darkTextLight]}>
                          {subTask.timeline}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveSubTask(subTask.id)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <X size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addSubTaskContainer}>
                <Input
                  label="Heading (optional)"
                  value={newSubTaskHeading}
                  onChangeText={setNewSubTaskHeading}
                  placeholder="Enter sub-task heading"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <Input
                  label="Description"
                  value={newSubTaskDescription}
                  onChangeText={setNewSubTaskDescription}
                  placeholder="Enter sub-task description"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <Text style={[styles.inputLabel, darkMode && styles.darkText]}>
                  Bullet Points (optional)
                </Text>
                <View style={styles.bulletPointsInputContainer}>
                  <TextInput
                    style={[styles.textArea, darkMode && styles.darkTextArea]}
                    value={newSubTaskBulletPoints}
                    onChangeText={setNewSubTaskBulletPoints}
                    placeholder="• Enter bullet points here\n• Start each line with a bullet point\n• Add as many as you need"
                    placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <Input
                  label="Timeline (optional)"
                  value={newSubTaskTimeline}
                  onChangeText={setNewSubTaskTimeline}
                  placeholder="e.g., 1-2 days"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <Button
                  title="Add Sub-Task"
                  onPress={handleAddSubTask}
                  icon={<Plus size={16} color={colors.white} />}
                  disabled={!newSubTaskDescription.trim() && !newSubTaskHeading.trim()}
                  style={styles.addButton}
                />
              </View>
            </View>
            
            <View style={[styles.section, darkMode && styles.darkSection]}>
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Progress Tracker</Text>
              
              {progressSteps.map((step, index) => (
                <View key={step.id} style={[styles.progressStepItem, darkMode && styles.darkBorder]}>
                  <View style={styles.progressStepContent}>
                    <View style={styles.progressStepHeader}>
                      <View style={[styles.stepNumber, { backgroundColor: categories[0]?.color || colors.primary }]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.progressStepTitle, darkMode && styles.darkText]}>
                        {step.title}
                      </Text>
                    </View>
                    
                    {step.description && (
                      <Text style={[styles.progressStepDescription, darkMode && styles.darkTextLight]}>
                        {step.description}
                      </Text>
                    )}
                    
                    {step.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Calendar size={12} color={darkMode ? colors.gray[400] : colors.gray[500]} />
                        <Text style={[styles.dueDateText, darkMode && styles.darkTextLight]}>
                          Due: {step.dueDate}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveProgressStep(step.id)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <X size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addProgressStepContainer}>
                <Input
                  label="Step Title"
                  value={newStepTitle}
                  onChangeText={setNewStepTitle}
                  placeholder="Enter step title"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <Input
                  label="Description (optional)"
                  value={newStepDescription}
                  onChangeText={setNewStepDescription}
                  placeholder="Enter step description"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  style={{ height: 60 }}
                />
                
                <Input
                  label="Due Date (optional)"
                  value={newStepDueDate}
                  onChangeText={setNewStepDueDate}
                  placeholder="e.g., May 15, 2023"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                />
                
                <Button
                  title="Add Progress Step"
                  onPress={handleAddProgressStep}
                  icon={<Plus size={16} color={colors.white} />}
                  disabled={!newStepTitle.trim()}
                  style={styles.addButton}
                />
              </View>
            </View>
            
            <View style={[styles.section, darkMode && styles.darkSection]}>
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Metadata (Optional)</Text>
              
              <Text style={[styles.subsectionTitle, darkMode && styles.darkText]}>Contact Information</Text>
              <Input
                label="Contact Name"
                value={contactName}
                onChangeText={setContactName}
                placeholder="e.g., Office of Company Registrar"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              
              <Input
                label="Contact Email"
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="e.g., info@example.com"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                keyboardType="email-address"
              />
              
              <Input
                label="Contact Phone"
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="e.g., +1 123-456-7890"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                keyboardType="phone-pad"
              />
              
              <Text style={[styles.subsectionTitle, darkMode && styles.darkText]}>Additional Details</Text>
              <Input
                label="Cost"
                value={cost}
                onChangeText={setCost}
                placeholder="e.g., $500"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              
              <Input
                label="Timeline"
                value={timeline}
                onChangeText={setTimeline}
                placeholder="e.g., 3-4 weeks"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              
              <Text style={[styles.inputLabel, darkMode && styles.darkText]}>
                Documents Needed (one per line)
              </Text>
              <View style={styles.bulletPointsInputContainer}>
                <TextInput
                  style={[styles.textArea, darkMode && styles.darkTextArea]}
                  value={documentsNeeded}
                  onChangeText={setDocumentsNeeded}
                  placeholder="Passport\nID Card\nProof of Address\nBusiness Registration"
                  placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <Input
                label="Contingencies"
                value={contingencies}
                onChangeText={setContingencies}
                placeholder="e.g., If X happens, then do Y"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.textAreaInput}
              />
            </View>
            
            <Button
              title="Create Task"
              onPress={handleCreateTask}
              variant="primary"
              size="large"
              fullWidth
              style={styles.createTaskButton}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[700],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  textAreaInput: {
    height: 100,
    paddingTop: 8,
  },
  markdownContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  noCategoriesWarning: {
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noCategoriesText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  darkBorder: {
    borderBottomColor: colors.gray[700],
  },
  subTaskContent: {
    flex: 1,
    marginRight: 8,
  },
  subTaskHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subTaskDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  bulletPointsContainer: {
    marginLeft: 4,
    marginTop: 4,
    marginBottom: 6,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 13,
    color: colors.textLight,
    flex: 1,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineText: {
    fontSize: 12,
    color: colors.textLight,
  },
  addSubTaskContainer: {
    marginTop: 16,
  },
  bulletPointsInputContainer: {
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
  darkTextArea: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[700],
    color: colors.white,
  },
  addButton: {
    marginTop: 8,
  },
  progressStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  progressStepContent: {
    flex: 1,
    marginRight: 8,
  },
  progressStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  progressStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  progressStepDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 32,
    marginBottom: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: colors.textLight,
  },
  addProgressStepContainer: {
    marginTop: 16,
  },
  createTaskButton: {
    marginTop: 16,
  },
});