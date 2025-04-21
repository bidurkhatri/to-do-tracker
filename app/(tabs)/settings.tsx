import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { colors } from '@/constants/colors';
import { initialTasks, initialCategories } from '@/mocks/initial-data';
import {
  User,
  Bell,
  Moon,
  Trash2,
  HelpCircle,
  ChevronRight,
  LogOut,
  RefreshCw,
  FileText,
  Download,
  Server,
  X,
} from 'lucide-react-native';
import { exportTasksToCSV } from '@/utils/export';
import { TaskBackendDemo } from '@/components/TaskBackendDemo';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    darkMode, 
    notifications, 
    showBackendDemo, 
    toggleDarkMode, 
    toggleNotifications, 
    toggleBackendDemo,
    logout 
  } = useSettingsStore();
  
  const { tasks, categories, resetStore, addTask, addCategory } = useTaskStore();
  
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all tasks and categories? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          onPress: () => {
            resetStore();
            Alert.alert('Success', 'All data has been cleared successfully.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleLoadSampleData = () => {
    Alert.alert(
      'Load Sample Data',
      'This will add sample tasks and categories to help you get started. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Load Data',
          onPress: () => {
            // Add sample categories first
            initialCategories.forEach(category => {
              addCategory({
                name: category.name,
                color: category.color,
              });
            });
            
            // Then add sample tasks
            initialTasks.forEach(task => {
              addTask({
                title: task.title,
                description: task.description,
                categoryId: task.categoryId,
                subTasks: task.subTasks,
                metadata: task.metadata,
              });
            });
            
            Alert.alert('Success', 'Sample data has been loaded successfully.');
          },
        },
      ]
    );
  };
  
  const handleExportData = () => {
    if (tasks.length === 0) {
      Alert.alert('No Data', 'There are no tasks to export.');
      return;
    }
    
    exportTasksToCSV(tasks, categories);
  };
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };
  
  const handleOpenProfile = () => {
    router.push('/profile');
  };
  
  const handleOpenDocumentation = () => {
    setShowDocumentation(true);
  };
  
  const handleOpenHelpSupport = () => {
    setShowHelpSupport(true);
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, darkMode && styles.darkBorder]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <Text style={[styles.settingTitle, darkMode && styles.darkText]}>{title}</Text>
      <View style={styles.settingRight}>{rightElement}</View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Settings</Text>
        
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Preferences</Text>
          
          {renderSettingItem(
            <Moon size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Dark Mode',
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={darkMode ? colors.primary : colors.white}
            />
          )}
          
          {renderSettingItem(
            <Bell size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Notifications',
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={notifications ? colors.primary : colors.white}
            />
          )}
          
          {renderSettingItem(
            <Server size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Show Backend Demo',
            <Switch
              value={showBackendDemo}
              onValueChange={toggleBackendDemo}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={showBackendDemo ? colors.primary : colors.white}
            />
          )}
        </View>
        
        {showBackendDemo && <TaskBackendDemo />}
        
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Account</Text>
          
          {renderSettingItem(
            <User size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Profile',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleOpenProfile
          )}
          
          {renderSettingItem(
            <LogOut size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Sign Out',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleSignOut
          )}
        </View>
        
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Data Management</Text>
          
          {renderSettingItem(
            <RefreshCw size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Load Sample Data',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleLoadSampleData
          )}
          
          {renderSettingItem(
            <Download size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Export Data as CSV',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleExportData
          )}
          
          {renderSettingItem(
            <Trash2 size={20} color={colors.error} />,
            'Clear All Data',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleClearData
          )}
        </View>
        
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Support</Text>
          
          {renderSettingItem(
            <FileText size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Documentation',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleOpenDocumentation
          )}
          
          {renderSettingItem(
            <HelpCircle size={20} color={darkMode ? colors.primaryLight : colors.primary} />,
            'Help & Support',
            <ChevronRight size={20} color={darkMode ? colors.gray[300] : colors.gray[400]} />,
            handleOpenHelpSupport
          )}
        </View>
        
        <Text style={[styles.version, darkMode && styles.darkTextLight]}>Version 1.0.0</Text>
      </ScrollView>
      
      {/* Documentation Modal */}
      <Modal
        visible={showDocumentation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDocumentation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Documentation</Text>
              <TouchableOpacity onPress={() => setShowDocumentation(false)}>
                <X size={24} color={darkMode ? colors.gray[300] : colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Getting Started</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                To-Do Tracker helps you organize and track your tasks efficiently. Start by creating categories to organize your tasks, then add tasks with detailed information and sub-tasks.
              </Text>
              
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Creating Categories</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                1. Navigate to the Categories tab{"\n"}
                2. Tap "New Category"{"\n"}
                3. Enter a name and select a color{"\n"}
                4. Tap "Create Category"
              </Text>
              
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Creating Tasks</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                1. Navigate to the Tasks tab{"\n"}
                2. Tap "New Task"{"\n"}
                3. Fill in the task details{"\n"}
                4. Add sub-tasks to break down your task{"\n"}
                5. Add metadata like contacts, timeline, etc.{"\n"}
                6. Tap "Create Task"
              </Text>
              
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Managing Tasks</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                • Mark sub-tasks as complete by tapping the checkbox{"\n"}
                • Edit tasks by tapping the edit icon on the task detail screen{"\n"}
                • Delete tasks by tapping the trash icon on the task detail screen{"\n"}
                • Filter tasks by status on the main Tasks screen
              </Text>
              
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Calendar View</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                The Calendar tab shows tasks scheduled for specific dates. Tap on a date to see tasks scheduled for that day.
              </Text>
              
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Data Management</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                • Export your tasks as CSV for backup or analysis{"\n"}
                • Load sample data to see how the app works{"\n"}
                • Clear all data to start fresh
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowDocumentation(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Help & Support Modal */}
      <Modal
        visible={showHelpSupport}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelpSupport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Help & Support</Text>
              <TouchableOpacity onPress={() => setShowHelpSupport(false)}>
                <X size={24} color={darkMode ? colors.gray[300] : colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Frequently Asked Questions</Text>
              
              <Text style={[styles.faqQuestion, darkMode && styles.darkText]}>How do I create a new task?</Text>
              <Text style={[styles.faqAnswer, darkMode && styles.darkTextLight]}>
                Tap the "New Task" button on the Tasks screen or within a category to create a new task.
              </Text>
              
              <Text style={[styles.faqQuestion, darkMode && styles.darkText]}>How do I organize my tasks?</Text>
              <Text style={[styles.faqAnswer, darkMode && styles.darkTextLight]}>
                Create categories in the Categories tab, then assign tasks to those categories when creating or editing tasks.
              </Text>
              
              <Text style={[styles.faqQuestion, darkMode && styles.darkText]}>Can I export my data?</Text>
              <Text style={[styles.faqAnswer, darkMode && styles.darkTextLight]}>
                Yes, go to Settings {"->"} Data Management {"->"} Export Data as CSV to export your tasks.
              </Text>
              
              <Text style={[styles.faqQuestion, darkMode && styles.darkText]}>How do I track task progress?</Text>
              <Text style={[styles.faqAnswer, darkMode && styles.darkTextLight]}>
                Break down your tasks into sub-tasks and mark them as complete as you progress. The app will automatically calculate and display progress.
              </Text>
              
              <Text style={[styles.docSectionTitle, darkMode && styles.darkText]}>Contact Support</Text>
              <Text style={[styles.docText, darkMode && styles.darkTextLight]}>
                If you need further assistance, please contact our support team:
              </Text>
              
              <TouchableOpacity 
                style={[styles.contactButton, darkMode && styles.darkContactButton]}
                onPress={() => Linking.openURL('mailto:support@todotracker.app')}
              >
                <Text style={[styles.contactButtonText, darkMode && { color: colors.primaryLight }]}>Email Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.contactButton, darkMode && styles.darkContactButton]}
                onPress={() => Linking.openURL('https://todotracker.app/support')}
              >
                <Text style={[styles.contactButtonText, darkMode && { color: colors.primaryLight }]}>Visit Support Website</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowHelpSupport(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  darkBorder: {
    borderBottomColor: colors.gray[700],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: colors.gray[800],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    maxHeight: '80%',
  },
  docSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  docText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  darkContactButton: {
    backgroundColor: colors.gray[700],
  },
  contactButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
});