import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { SubTask } from '@/types/task';
import { colors } from '@/constants/colors';
import { Check, Clock, Edit2, Save, X, Plus, List } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { parseBulletPoints } from '@/utils/helpers';

interface SubTaskItemProps {
  subTask: SubTask;
  onToggle: () => void;
  onEdit?: (updatedSubTask: Partial<SubTask>) => void;
  onDelete?: () => void;
  accentColor?: string;
}

export const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onToggle,
  onEdit,
  onDelete,
  accentColor = colors.primary,
}) => {
  const { darkMode } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editHeading, setEditHeading] = useState(subTask.heading || '');
  const [editDescription, setEditDescription] = useState(subTask.description);
  const [editBulletPoints, setEditBulletPoints] = useState(
    subTask.bulletPoints ? subTask.bulletPoints.join('\n• ') : ''
  );
  const [editTimeline, setEditTimeline] = useState(subTask.timeline || '');
  
  const handleStartEdit = () => {
    setEditHeading(subTask.heading || '');
    setEditDescription(subTask.description);
    setEditBulletPoints(
      subTask.bulletPoints ? '• ' + subTask.bulletPoints.join('\n• ') : ''
    );
    setEditTimeline(subTask.timeline || '');
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (onEdit && (editHeading.trim() || editDescription.trim())) {
      const bulletPoints = parseBulletPoints(editBulletPoints);
      
      onEdit({
        heading: editHeading.trim() || undefined,
        description: editDescription.trim(),
        bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
        timeline: editTimeline.trim() || undefined,
      });
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  return (
    <View style={[
      styles.container, 
      darkMode && styles.darkBorder,
      subTask.completed && styles.completedContainer,
      subTask.completed && darkMode && styles.darkCompletedContainer
    ]}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, darkMode && styles.darkEditInput]}
            value={editHeading}
            onChangeText={setEditHeading}
            placeholder="Heading (optional)"
            placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
          />
          
          <TextInput
            style={[styles.editInput, darkMode && styles.darkEditInput]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Description"
            placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
            autoFocus
          />
          
          <Text style={[styles.editLabel, darkMode && styles.darkText]}>
            Bullet Points (optional)
          </Text>
          
          <TextInput
            style={[styles.editTextArea, darkMode && styles.darkEditInput]}
            value={editBulletPoints}
            onChangeText={setEditBulletPoints}
            placeholder="• First bullet point\n• Second bullet point\n• Third bullet point"
            placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <TextInput
            style={[styles.editInput, darkMode && styles.darkEditInput]}
            value={editTimeline}
            onChangeText={setEditTimeline}
            placeholder="Timeline (optional)"
            placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
          />
          
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editAction, styles.cancelAction]}
              onPress={handleCancelEdit}
            >
              <X size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editAction, styles.saveAction, { backgroundColor: accentColor }]}
              onPress={handleSaveEdit}
              disabled={!editDescription.trim() && !editHeading.trim()}
            >
              <Save size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.checkbox,
              darkMode && styles.darkCheckbox,
              subTask.completed && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            {subTask.completed && <Check size={16} color={colors.white} />}
          </TouchableOpacity>
          
          <View style={styles.content}>
            {subTask.heading && (
              <Text
                style={[
                  styles.heading,
                  darkMode && styles.darkText,
                  subTask.completed && styles.textCompleted,
                  subTask.completed && darkMode && styles.darkTextCompleted,
                ]}
              >
                {subTask.heading}
              </Text>
            )}
            
            <Text
              style={[
                styles.description,
                darkMode && styles.darkText,
                subTask.completed && styles.textCompleted,
                subTask.completed && darkMode && styles.darkTextCompleted,
              ]}
            >
              {subTask.description}
            </Text>
            
            {subTask.bulletPoints && subTask.bulletPoints.length > 0 && (
              <View style={styles.bulletPointsContainer}>
                {subTask.bulletPoints.map((point, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={[
                      styles.bulletDot, 
                      darkMode && styles.darkTextLight,
                      subTask.completed && styles.textCompleted,
                      subTask.completed && darkMode && styles.darkTextCompleted,
                    ]}>•</Text>
                    <Text 
                      style={[
                        styles.bulletText, 
                        darkMode && styles.darkTextLight,
                        subTask.completed && styles.textCompleted,
                        subTask.completed && darkMode && styles.darkTextCompleted,
                      ]}
                    >
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {subTask.timeline && (
              <View style={styles.timeline}>
                <Clock size={12} color={
                  subTask.completed 
                    ? (darkMode ? colors.gray[500] : colors.gray[400]) 
                    : (darkMode ? colors.gray[300] : colors.textLight)
                } />
                <Text style={[
                  styles.timelineText, 
                  darkMode && styles.darkTextLight,
                  subTask.completed && styles.textCompleted,
                  subTask.completed && darkMode && styles.darkTextCompleted,
                ]}>
                  {subTask.timeline}
                </Text>
              </View>
            )}
          </View>
          
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: accentColor + '20' }]}
                  onPress={handleStartEdit}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Edit2 size={14} color={accentColor} />
                </TouchableOpacity>
              )}
              
              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={onDelete}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <X size={14} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  darkBorder: {
    borderBottomColor: colors.gray[700],
  },
  completedContainer: {
    backgroundColor: colors.gray[50],
  },
  darkCompletedContainer: {
    backgroundColor: colors.gray[800], // Changed from 850 to 800
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  darkCheckbox: {
    borderColor: colors.gray[500],
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray[400],
  },
  darkTextCompleted: {
    color: colors.gray[500],
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
    lineHeight: 18,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineText: {
    fontSize: 12,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  editContainer: {
    flex: 1,
    marginLeft: 12,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    marginTop: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    color: colors.text,
  },
  editTextArea: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
  },
  darkEditInput: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[700],
    color: colors.white,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  editAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  cancelAction: {
    backgroundColor: colors.gray[500],
  },
  saveAction: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});