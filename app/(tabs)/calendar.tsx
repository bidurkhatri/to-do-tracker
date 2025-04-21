import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { colors } from '@/constants/colors';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { Task, SubTask } from '@/types/task';

// Helper to parse date strings from tasks
const parseTaskDate = (dateString: string) => {
  try {
    return new Date(dateString);
  } catch (e) {
    return null;
  }
};

// Helper to check if a task is scheduled for a specific date
const isTaskOnDate = (task: Task, date: Date) => {
  // Check created date
  const createdDate = parseTaskDate(task.createdAt);
  if (createdDate && isSameDay(createdDate, date)) {
    return true;
  }
  
  // Check updated date
  const updatedDate = parseTaskDate(task.updatedAt);
  if (updatedDate && isSameDay(updatedDate, date)) {
    return true;
  }
  
  // Check timeline if it contains a date
  if (task.metadata.timeline) {
    // Try to extract dates from timeline string
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
    const matches = [...task.metadata.timeline.matchAll(dateRegex)];
    
    for (const match of matches) {
      let day = parseInt(match[1]);
      let month = parseInt(match[2]) - 1; // JS months are 0-indexed
      let year = parseInt(match[3]);
      
      // Handle 2-digit years
      if (year < 100) {
        year += 2000;
      }
      
      const timelineDate = new Date(year, month, day);
      if (isSameDay(timelineDate, date)) {
        return true;
      }
    }
  }
  
  // Check subtasks for timeline dates
  for (const subtask of task.subTasks) {
    if (subtask.timeline) {
      const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
      const matches = [...(subtask.timeline.matchAll(dateRegex) || [])];
      
      for (const match of matches) {
        let day = parseInt(match[1]);
        let month = parseInt(match[2]) - 1;
        let year = parseInt(match[3]);
        
        if (year < 100) {
          year += 2000;
        }
        
        const timelineDate = new Date(year, month, day);
        if (isSameDay(timelineDate, date)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Helper to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export default function CalendarScreen() {
  const router = useRouter();
  const { tasks, categories } = useTaskStore();
  const { darkMode } = useSettingsStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const days = [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Add days from previous month to start the week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      days.push(prevMonthDay);
    }
    
    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push(day);
    }
    
    // Add days from next month to complete the week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push(nextMonthDay);
    }
    
    setCalendarDays(days);
  }, [selectedDate]);
  
  // Filter tasks for the selected date
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate a small delay to show loading state
    setTimeout(() => {
      const filteredTasks = tasks.filter(task => isTaskOnDate(task, selectedDate));
      setTasksForSelectedDate(filteredTasks);
      setIsLoading(false);
    }, 300);
  }, [selectedDate, tasks]);
  
  const goToPreviousMonth = () => {
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setSelectedDate(prevMonth);
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSelectedDate(nextMonth);
  };
  
  const selectDay = (day: Date) => {
    setSelectedDate(day);
  };
  
  const isToday = (day: Date) => {
    const today = new Date();
    return isSameDay(day, today);
  };
  
  const isSelectedDay = (day: Date) => {
    return isSameDay(day, selectedDate);
  };
  
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === selectedDate.getMonth();
  };
  
  const hasTasksOnDay = (day: Date) => {
    return tasks.some(task => isTaskOnDate(task, day));
  };
  
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  const navigateToTask = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };
  
  const getTaskStatusColor = (task: Task) => {
    // Calculate completion status
    const isCompleted = task.subTasks.length > 0 && 
      task.subTasks.every((subTask: SubTask) => subTask.completed);
    
    if (isCompleted) {
      return colors.success;
    }
    
    // Calculate progress
    const totalSubTasks = task.subTasks.length;
    if (totalSubTasks === 0) return colors.gray[400];
    
    const completedSubTasks = task.subTasks.filter((st: SubTask) => st.completed).length;
    const progress = (completedSubTasks / totalSubTasks) * 100;
    
    if (progress === 0) return colors.error;
    if (progress < 50) return colors.warning;
    return colors.info;
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Calendar</Text>
        <Text style={[styles.subtitle, darkMode && styles.darkTextLight]}>View and manage your scheduled tasks</Text>
      </View>
      
      <View style={[styles.calendarHeader, darkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={goToPreviousMonth} style={[styles.navButton, darkMode && styles.darkNavButton]}>
          <ChevronLeft size={24} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthYear, darkMode && styles.darkText]}>{formatMonthYear(selectedDate)}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={[styles.navButton, darkMode && styles.darkNavButton]}>
          <ChevronRight size={24} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.weekdaysRow, darkMode && styles.darkHeader]}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={[styles.weekday, darkMode && styles.darkWeekday]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={[styles.calendarGrid, darkMode && styles.darkHeader]}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarDay,
              !isCurrentMonth(day) && styles.otherMonthDay,
              isToday(day) && styles.today,
              isSelectedDay(day) && styles.selectedDay,
            ]}
            onPress={() => selectDay(day)}
          >
            <Text
              style={[
                styles.dayNumber,
                !isCurrentMonth(day) && styles.otherMonthDayText,
                isToday(day) && styles.todayText,
                isSelectedDay(day) && styles.selectedDayText,
                darkMode && !isSelectedDay(day) && styles.darkText,
              ]}
            >
              {day.getDate()}
            </Text>
            {hasTasksOnDay(day) && (
              <View 
                style={[
                  styles.taskIndicator, 
                  darkMode && !isSelectedDay(day) && styles.darkTaskIndicator
                ]} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={[styles.selectedDateHeader, darkMode && styles.darkHeader]}>
        <Text style={[styles.selectedDateText, darkMode && styles.darkText]}>{formatDate(selectedDate)}</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, darkMode && styles.darkTextLight]}>Loading tasks...</Text>
        </View>
      ) : tasksForSelectedDate.length === 0 ? (
        <EmptyState
          title="No Tasks Scheduled"
          description="There are no tasks scheduled for this day"
          icon={<CalendarIcon size={48} color={darkMode ? colors.gray[300] : colors.gray[400]} />}
          actionLabel="Create Task"
          onAction={() => router.push('/task/create')}
        />
      ) : (
        <ScrollView style={styles.taskList}>
          {tasksForSelectedDate.map((task) => {
            const category = categories.find(c => c.id === task.categoryId);
            const statusColor = getTaskStatusColor(task);
            
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, darkMode && styles.darkTaskItem]}
                onPress={() => navigateToTask(task.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.taskCategoryIndicator,
                    { backgroundColor: category?.color || colors.primary },
                  ]}
                />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, darkMode && styles.darkText]}>{task.title}</Text>
                  <Text style={[styles.taskDescription, darkMode && styles.darkTextLight]} numberOfLines={2}>
                    {task.description}
                  </Text>
                  
                  <View style={styles.taskMeta}>
                    {category && (
                      <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
                        <Text style={[styles.categoryText, { color: darkMode ? colors.white : category.color }]}>
                          {category.name}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, darkMode && styles.darkTextLight]}>
                        {task.subTasks.filter((st: SubTask) => st.completed).length}/{task.subTasks.length} completed
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  darkTextLight: {
    color: colors.gray[300],
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  darkNavButton: {
    backgroundColor: colors.gray[700],
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[500],
  },
  darkWeekday: {
    color: colors.gray[300],
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  otherMonthDayText: {
    color: colors.gray[400],
  },
  today: {
    backgroundColor: colors.gray[100],
    borderRadius: 20,
  },
  todayText: {
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: '600',
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  darkTaskIndicator: {
    backgroundColor: colors.primaryLight,
  },
  selectedDateHeader: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
    marginTop: 8,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkTaskItem: {
    backgroundColor: colors.gray[800],
  },
  taskCategoryIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textLight,
  },
});