import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/trpc';
import { colors } from '@/constants/colors';
import { Server, RefreshCw } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';

export const TaskBackendDemo = () => {
  const { darkMode } = useSettingsStore();
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = trpc.tasks.list.useQuery({ filter: 'all' });

  if (isLoading) {
    return (
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, darkMode && styles.darkTextLight]}>Loading tasks from backend...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <Text style={styles.errorTitle}>Error connecting to backend</Text>
        <Text style={[styles.errorMessage, darkMode && styles.darkTextLight]}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <RefreshCw size={16} color={colors.white} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Server size={20} color={colors.primary} />
        <Text style={[styles.title, darkMode && styles.darkText]}>Backend Connection Demo</Text>
      </View>
      
      <View style={[styles.infoBox, darkMode && styles.darkInfoBox]}>
        <Text style={styles.infoText}>
          Successfully connected to backend API
        </Text>
        <Text style={[styles.statsText, darkMode && styles.darkTextLight]}>
          Found {data?.total} tasks ({data?.filtered} after filtering)
        </Text>
      </View>
      
      {data?.tasks.map(task => (
        <View key={task.id} style={[styles.taskItem, darkMode && styles.darkTaskItem]}>
          <Text style={[styles.taskTitle, darkMode && styles.darkText]}>{task.title}</Text>
          <Text style={[styles.taskDescription, darkMode && styles.darkTextLight]}>{task.description}</Text>
          <View style={styles.subtasksContainer}>
            {task.subTasks.map(subtask => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <View style={[
                  styles.subtaskStatus, 
                  { backgroundColor: subtask.completed ? colors.success : colors.gray[300] }
                ]} />
                <Text style={[styles.subtaskText, darkMode && styles.darkText]}>{subtask.description}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      
      <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
        <RefreshCw size={16} color={colors.white} />
        <Text style={styles.refreshText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  darkContainer: {
    backgroundColor: colors.gray[800],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: colors.white,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  darkInfoBox: {
    backgroundColor: colors.primary + '30',
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: colors.textLight,
  },
  taskItem: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  darkTaskItem: {
    borderColor: colors.gray[700],
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  subtasksContainer: {
    marginTop: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtaskStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subtaskText: {
    fontSize: 14,
    color: colors.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  refreshText: {
    color: colors.white,
    fontWeight: '500',
    marginLeft: 8,
  },
});