import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Plus, ClipboardList, Search, X, Download } from 'lucide-react-native';
import { exportTasksToCSV } from '@/utils/export';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, categories } = useTaskStore();
  const { darkMode } = useSettingsStore();
  const [filter, setFilter] = useState('all'); // 'all', 'inProgress', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const filteredTasks = tasks
    .filter(task => {
      // Filter by status
      if (filter === 'all') return true;
      
      const isCompleted = task.subTasks.length > 0 && 
        task.subTasks.every(subTask => subTask.completed);
      
      if (filter === 'completed') return isCompleted;
      if (filter === 'inProgress') return !isCompleted;
      
      return true;
    })
    .filter(task => {
      // Filter by search query
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.subTasks.some(st => st.description.toLowerCase().includes(query)) ||
        (task.metadata.contact?.name && task.metadata.contact.name.toLowerCase().includes(query))
      );
    });
  
  const handleCreateTask = () => {
    router.push('/task/create');
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }
    exportTasksToCSV(tasks, categories);
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        {showSearch ? (
          <View style={[styles.searchContainer, darkMode && styles.darkSearchContainer]}>
            <Search size={18} color={darkMode ? colors.gray[300] : colors.gray[400]} />
            <TextInput
              style={[styles.searchInput, darkMode && styles.darkSearchInput]}
              placeholder="Search tasks..."
              placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}>
              <X size={18} color={darkMode ? colors.gray[300] : colors.gray[400]} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.title, darkMode && styles.darkText]}>My Tasks</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={20} color={darkMode ? colors.white : colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleExportCSV}
              >
                <Download size={20} color={darkMode ? colors.white : colors.text} />
              </TouchableOpacity>
              <Button
                title="New Task"
                onPress={handleCreateTask}
                variant="primary"
                size="small"
                icon={<Plus size={16} color={colors.white} />}
              />
            </View>
          </>
        )}
      </View>
      
      <View style={[styles.filterContainer, darkMode && styles.darkHeader]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
            filter === 'all' && darkMode && styles.darkFilterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
              darkMode && styles.darkFilterButtonText,
              filter === 'all' && darkMode && styles.darkFilterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'inProgress' && styles.filterButtonActive,
            filter === 'inProgress' && darkMode && styles.darkFilterButtonActive,
          ]}
          onPress={() => setFilter('inProgress')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'inProgress' && styles.filterButtonTextActive,
              darkMode && styles.darkFilterButtonText,
              filter === 'inProgress' && darkMode && styles.darkFilterButtonTextActive,
            ]}
          >
            In Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.filterButtonActive,
            filter === 'completed' && darkMode && styles.darkFilterButtonActive,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'completed' && styles.filterButtonTextActive,
              darkMode && styles.darkFilterButtonText,
              filter === 'completed' && darkMode && styles.darkFilterButtonTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      {tasks.length === 0 ? (
        <EmptyState
          title="No Tasks Yet"
          description="Create your first task to get started"
          icon={<ClipboardList size={48} color={darkMode ? colors.gray[300] : colors.gray[400]} />}
          actionLabel="Create Task"
          onAction={handleCreateTask}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          description={searchQuery ? "No tasks match your search" : `No ${filter === 'completed' ? 'completed' : 'in progress'} tasks found`}
          icon={<ClipboardList size={48} color={darkMode ? colors.gray[300] : colors.gray[400]} />}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskCard task={item} />}
          contentContainerStyle={styles.listContent}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  darkHeader: {
    backgroundColor: colors.gray[800],
    borderBottomColor: colors.gray[700],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  darkText: {
    color: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  darkSearchContainer: {
    backgroundColor: colors.gray[700],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  darkSearchInput: {
    color: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '20', // Add transparency
  },
  darkFilterButtonActive: {
    backgroundColor: colors.primary + '40', // More opacity for dark mode
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textLight,
  },
  darkFilterButtonText: {
    color: colors.gray[300],
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  darkFilterButtonTextActive: {
    color: colors.primaryLight,
  },
  listContent: {
    padding: 16,
  },
});