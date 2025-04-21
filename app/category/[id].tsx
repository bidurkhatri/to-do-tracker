import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/colors';
import { Plus, Trash2, ClipboardList, ArrowLeft, Edit2, Check, X } from 'lucide-react-native';
import { categoryColors } from '@/utils/helpers';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  
  const {
    categories,
    getTasksByCategory,
    getCategoryProgress,
    deleteCategory,
    updateCategory,
  } = useTaskStore();
  
  const category = categories.find((c) => c.id === id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  
  if (!category) {
    return (
      <View style={[styles.notFound, darkMode && styles.darkContainer]}>
        <Text style={[styles.notFoundText, darkMode && styles.darkText]}>Category not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }
  
  const tasks = getTasksByCategory(category.id);
  const progress = getCategoryProgress(category.id);
  
  const handleDeleteCategory = () => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? All tasks in this category will also be deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteCategory(category.id);
            router.back();
          },
          style: 'destructive',
        }
      ]
    );
  };
  
  const handleEditCategory = () => {
    setEditName(category.name);
    setEditColor(category.color);
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    
    updateCategory(category.id, {
      name: editName.trim(),
      color: editColor,
    });
    
    setIsEditing(false);
  };
  
  const handleCreateTask = () => {
    router.push({
      pathname: '/task/create',
      params: { categoryId: category.id }
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <Stack.Screen
        options={{
          title: category.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={darkMode ? colors.white : colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEditCategory} style={styles.headerAction}>
                <Edit2 size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteCategory} style={styles.headerAction}>
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {isEditing ? (
        <View style={[styles.editContainer, darkMode && styles.darkEditContainer]}>
          <Text style={[styles.editLabel, darkMode && styles.darkText]}>Category Name</Text>
          <TextInput
            style={[styles.editInput, darkMode && styles.darkEditInput]}
            value={editName}
            onChangeText={setEditName}
            placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
            autoFocus
          />
          
          <Text style={[styles.editLabel, darkMode && styles.darkText]}>Color</Text>
          <View style={styles.colorGrid}>
            {categoryColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  editColor === color && styles.colorSelected,
                ]}
                onPress={() => setEditColor(color)}
              >
                {editColor === color && (
                  <Check size={16} color={colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.editActions}>
            <Button
              title="Cancel"
              onPress={() => setIsEditing(false)}
              variant="outline"
              style={{ marginRight: 8 }}
            />
            <Button
              title="Save"
              onPress={handleSaveEdit}
              variant="primary"
              icon={<Check size={16} color={colors.white} />}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.header, darkMode && styles.darkHeader]}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: category.color },
                ]}
              />
              <Text style={[styles.categoryName, darkMode && styles.darkText]}>{category.name}</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={[styles.progressLabel, darkMode && styles.darkTextLight]}>Progress</Text>
              <View style={styles.progressBarContainer}>
                <ProgressBar 
                  progress={progress} 
                  color={category.color} 
                  backgroundColor={darkMode ? colors.gray[700] : colors.gray[200]}
                />
                <Text style={[styles.progressText, darkMode && styles.darkText]}>{Math.round(progress)}%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tasksHeader}>
            <Text style={[styles.tasksTitle, darkMode && styles.darkText]}>Tasks</Text>
            <Button
              title="New Task"
              onPress={handleCreateTask}
              variant="primary"
              size="small"
              icon={<Plus size={16} color={colors.white} />}
            />
          </View>
          
          {tasks.length === 0 ? (
            <EmptyState
              title="No Tasks Yet"
              description={`Create your first task in the ${category.name} category`}
              icon={<ClipboardList size={48} color={darkMode ? colors.gray[300] : colors.gray[400]} />}
              actionLabel="Create Task"
              onAction={handleCreateTask}
            />
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TaskCard task={item} />}
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}
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
    marginBottom: 16,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    marginLeft: 16,
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
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    minWidth: 36,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  editContainer: {
    backgroundColor: colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkEditContainer: {
    backgroundColor: colors.gray[800],
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
  },
  darkEditInput: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[700],
    color: colors.white,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});