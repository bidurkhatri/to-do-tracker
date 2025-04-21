import { Platform, Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Task, Category } from '@/types/task';

export const exportTasksToCSV = async (tasks: Task[], categories: Category[]) => {
  // Create CSV content
  const headers = [
    'ID',
    'Title',
    'Description',
    'Category',
    'Progress',
    'Sub-Tasks',
    'Contact',
    'Cost',
    'Timeline',
    'Documents Needed',
    'Contingencies',
    'Progress Tracker',
    'Created At',
    'Updated At',
  ].join(',');
  
  const rows = tasks.map(task => {
    const category = categories.find(c => c.id === task.categoryId);
    const progress = calculateTaskProgress(task);
    
    // Format sub-tasks
    const subTasksText = task.subTasks
      .map(st => `"${st.description}${st.completed ? ' (Completed)' : ' (Pending)'}"`)
      .join('; ');
    
    // Format contact
    const contactText = task.metadata.contact
      ? [
          task.metadata.contact.name,
          task.metadata.contact.email,
          task.metadata.contact.phone,
        ]
          .filter(Boolean)
          .join(' - ')
      : '';
    
    // Format documents
    const documentsText = task.metadata.documentsNeeded
      ? task.metadata.documentsNeeded.join('; ')
      : '';
    
    return [
      task.id,
      `"${escapeCSV(task.title)}"`,
      `"${escapeCSV(task.description)}"`,
      category ? `"${escapeCSV(category.name)}"` : '',
      `${Math.round(progress)}%`,
      `"${escapeCSV(subTasksText)}"`,
      `"${escapeCSV(contactText)}"`,
      task.metadata.cost ? `"${escapeCSV(task.metadata.cost)}"` : '',
      task.metadata.timeline ? `"${escapeCSV(task.metadata.timeline)}"` : '',
      `"${escapeCSV(documentsText)}"`,
      task.metadata.contingencies ? `"${escapeCSV(task.metadata.contingencies)}"` : '',
      task.metadata.progressTracker ? `"${escapeCSV(task.metadata.progressTracker)}"` : '',
      formatDate(task.createdAt),
      formatDate(task.updatedAt),
    ].join(',');
  });
  
  const csv = [headers, ...rows].join('\n');
  
  // Handle export based on platform
  if (Platform.OS === 'web') {
    // For web, create a download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_export_${formatDateForFilename(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    try {
      // For mobile, save to file system and share
      const fileName = `tasks_export_${formatDateForFilename(new Date())}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write the CSV to a file
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // Share the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Tasks',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        // Fallback if sharing is not available
        Alert.alert(
          'Export Complete',
          `Tasks exported to ${fileUri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting tasks:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your tasks. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }
};

// Helper function to escape CSV special characters
const escapeCSV = (text: string): string => {
  if (!text) return '';
  return text.replace(/"/g, '""');
};

// Helper function to calculate task progress
const calculateTaskProgress = (task: Task): number => {
  if (task.subTasks.length === 0) return 0;
  
  const completedSubTasks = task.subTasks.filter(st => st.completed).length;
  return (completedSubTasks / task.subTasks.length) * 100;
};

// Helper function to format date for CSV
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Helper function to format date for filename
const formatDateForFilename = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '');
};