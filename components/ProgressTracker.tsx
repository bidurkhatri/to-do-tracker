import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ProgressStep } from '@/types/task';
import { colors } from '@/constants/colors';
import { Check, Clock, AlertCircle, ChevronRight } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStepId?: string;
  onStepComplete?: (stepId: string) => void;
  color?: string;
  readonly?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStepId,
  onStepComplete,
  color = colors.primary,
  readonly = false,
}) => {
  const { darkMode } = useSettingsStore();
  const screenWidth = Dimensions.get('window').width;
  
  if (!steps || steps.length === 0) {
    return null;
  }
  
  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;
  
  // Find current step index
  const currentStepIndex = currentStepId 
    ? steps.findIndex(step => step.id === currentStepId)
    : steps.findIndex(step => !step.completed);
  
  // If all steps are completed, set the last step as current
  const activeStepIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Progress Tracker</Text>
        <View style={styles.progressInfo}>
          <View style={[styles.progressPill, { backgroundColor: color + '20' }]}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%`, backgroundColor: color }]} />
            <Text style={[styles.progressText, { color: darkMode ? colors.white : colors.text }]}>
              {completedSteps} of {steps.length} completed
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isCurrent = index === activeStepIndex;
          const isPast = index < activeStepIndex;
          const isLast = index === steps.length - 1;
          
          return (
            <View key={step.id} style={styles.stepItem}>
              <View style={styles.stepConnector}>
                <View style={styles.stepNumberContainer}>
                  <View 
                    style={[
                      styles.stepNumber,
                      isCompleted && { backgroundColor: color },
                      isCurrent && !isCompleted && { borderColor: color, borderWidth: 2, backgroundColor: 'transparent' },
                      !isCompleted && !isCurrent && { backgroundColor: darkMode ? colors.gray[700] : colors.gray[200] }
                    ]}
                  >
                    {isCompleted ? (
                      <Check size={14} color={colors.white} />
                    ) : (
                      <Text style={[
                        styles.stepNumberText,
                        isCurrent && { color: color },
                        !isCurrent && !isCompleted && darkMode && { color: colors.gray[400] }
                      ]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  
                  {!isLast && (
                    <View style={styles.connector}>
                      <View 
                        style={[
                          styles.connectorLine,
                          darkMode && { backgroundColor: colors.gray[700] },
                          (isCompleted || isPast) && { backgroundColor: color }
                        ]} 
                      />
                    </View>
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <TouchableOpacity
                    style={[
                      styles.stepCard,
                      darkMode && styles.darkStepCard,
                      isCompleted && styles.completedStepCard,
                      isCurrent && !isCompleted && styles.currentStepCard,
                      isCurrent && !isCompleted && { borderColor: color }
                    ]}
                    disabled={readonly || (index > activeStepIndex)}
                    onPress={() => onStepComplete && onStepComplete(step.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.stepCardHeader}>
                      <Text 
                        style={[
                          styles.stepTitle,
                          darkMode && styles.darkText,
                          isCompleted && { color: colors.success },
                          isCurrent && !isCompleted && { color: color, fontWeight: '600' },
                        ]}
                      >
                        {step.title}
                      </Text>
                      
                      {isCurrent && !isCompleted && !readonly && (
                        <View style={[styles.actionBadge, { backgroundColor: color }]}>
                          <Text style={styles.actionText}>Current</Text>
                        </View>
                      )}
                      
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>Completed</Text>
                        </View>
                      )}
                    </View>
                    
                    {step.description && (
                      <Text style={[styles.stepDescription, darkMode && styles.darkTextLight]}>
                        {step.description}
                      </Text>
                    )}
                    
                    {step.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Clock size={12} color={darkMode ? colors.gray[400] : colors.gray[500]} />
                        <Text style={[styles.dueDate, darkMode && styles.darkTextLight]}>
                          {step.dueDate}
                        </Text>
                      </View>
                    )}
                    
                    {isCurrent && !isCompleted && !readonly && (
                      <View style={styles.actionContainer}>
                        <Text style={[styles.actionHint, { color: color }]}>Tap to mark as complete</Text>
                        <ChevronRight size={14} color={color} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressPill: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    position: 'relative',
    minWidth: 120,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    zIndex: 1,
    paddingHorizontal: 8,
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepItem: {
    marginBottom: 8,
  },
  stepConnector: {
    flexDirection: 'row',
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  connector: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    paddingTop: 4,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkStepCard: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[700],
  },
  completedStepCard: {
    borderColor: colors.success,
    borderLeftWidth: 3,
  },
  currentStepCard: {
    borderLeftWidth: 3,
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  actionHint: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
});