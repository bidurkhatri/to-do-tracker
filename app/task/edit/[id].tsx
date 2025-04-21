import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors } from '@/constants/colors';
import { Plus, X, ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { generateId, parseBulletPoints } from '@/utils/helpers';
import { ProgressStep } from '@/types/task';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  
  const { tasks, categories, updateTask } = useTaskStore();
  const task = tasks.find((t) => t.id === id);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subTasks, setSubTasks] = useState<Array<{ id: string; heading?: string; description: string; bulletPoints?: string[]; timeline?: string; completed: boolean }>>([]);
  const [newSubTaskHeading, setNewSubTaskHeading] = useState('');
  const [newSubTaskDescription, setNewSubTaskDescription] = useState('');
  const [newSubTaskBulletPoints, setNewSubTaskBulletPoints] = useState('');
  const [newSubTaskTimeline, setNewSubTaskTimeline] = useState('');
  
  // Metadata state
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
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategoryId(task.categoryId);
      setSubTasks([...task.subTasks]);
      
      // Set metadata
      if (task.metadata) {
        if (task.metadata.contact) {
          setContactName(task.metadata.contact.name || '');
          setContactEmail(task.metadata.contact.email || '');
          setContactPhone(task.metadata.contact.phone || '');
        }
        
        setCost(task.metadata.cost || '');
        setTimeline(task.metadata.timeline || '');
        setDocumentsNeeded((task.metadata.documentsNeeded || []).join('\n'));
        setContingencies(task.metadata.contingencies || '');
        
        if (task.metadata.progressTracker && task.metadata.progressTracker.steps) {
          setProgressSteps([...task.metadata.progressTracker.steps]);
        }
      }
    }
  }, [task]);
  
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
          completed: false,
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
  
  const handleUpdateTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!categoryId && categories.length > 0) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    // Parse documents needed into an array
    const documentsArray = documentsNeeded
      .split('\n')
      .map((doc) => doc.trim())
      .filter((doc) => doc);
    
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId || (categories.length > 0 ? categories[0].id : ''),
      subTasks,
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
              currentStep: task.metadata.progressTracker?.currentStep || progressSteps.find(s => !s.completed)?.id || progressSteps[0].id,
            }
          : undefined,
      },
    });
    
    router.replace(`/task/${task.id}`);
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Task',
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
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.section, darkMode && styles.darkSection]}>
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Task Details</Text>
              
              <Input
                label="Title"
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
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
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          categoryId === category.id
                            ? category.color
                            : category.color + '20',
                      },
                    ]}
                    onPress={() => setCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            categoryId === category.id
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
                      <View style={[styles.stepNumber, { backgroundColor: categories.find(c => c.id === categoryId)?.color || colors.primary }]}>
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
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Metadata</Text>
              
              <Text style={[styles.subsectionTitle, darkMode && styles.darkText]}>Contact</Text>
              <Input
                label="Contact Name"
                placeholder="Contact name"
                value={contactName}
                onChangeText={setContactName}
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              <Input
                label="Contact Email"
                placeholder="Contact email"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              <Input
                label="Contact Phone"
                placeholder="Contact phone"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              
              <Text style={[styles.subsectionTitle, darkMode && styles.darkText]}>Additional Information</Text>
              <Input
                label="Cost"
                placeholder="Cost"
                value={cost}
                onChangeText={setCost}
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
              <Input
                label="Timeline"
                placeholder="Timeline"
                value={timeline}
                onChangeText={setTimeline}
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
                placeholder="Contingencies"
                value={contingencies}
                onChangeText={setContingencies}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.textAreaInput}
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
                style={{ marginRight: 8 }}
              />
              <Button
                title="Save Changes"
                onPress={handleUpdateTask}
                variant="primary"
              />
            </View>
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
  section: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
  markdownContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
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
  textAreaInput: {
    height: 100,
    paddingTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    marginBottom: 32,
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
});