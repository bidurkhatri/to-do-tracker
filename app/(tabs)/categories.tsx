import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTaskStore } from '@/hooks/use-task-store';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { categoryColors, getRandomColor } from '@/utils/helpers';
import { Plus, X, Check } from 'lucide-react-native';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, addCategory } = useTaskStore();
  const { darkMode } = useSettingsStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(getRandomColor());
  
  const handleCreateCategory = () => {
    setModalVisible(true);
    setCategoryName('');
    setSelectedColor(getRandomColor());
  };
  
  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    
    const categoryId = addCategory({
      name: categoryName.trim(),
      color: selectedColor,
    });
    
    setModalVisible(false);
    
    // Optionally navigate to the new category
    Alert.alert(
      'Category Created',
      `"${categoryName}" category has been created successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {},
        },
        {
          text: 'View Category',
          onPress: () => router.push(`/category/${categoryId}`),
        }
      ]
    );
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, darkMode && styles.darkText]}>Categories</Text>
      <Text style={[styles.subtitle, darkMode && styles.darkTextLight]}>Organize your tasks by category</Text>
      
      <Button
        title="New Category"
        onPress={handleCreateCategory}
        icon={<Plus size={16} color={colors.white} />}
        size="small"
        style={styles.createButton}
      />
    </View>
  );
  
  const renderEmpty = () => (
    <EmptyState
      title="No categories yet"
      description="Create your first category to organize your tasks"
      actionLabel="Create Category"
      onAction={handleCreateCategory}
    />
  );
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryCard category={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />
      
      {/* Create Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Create New Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={darkMode ? colors.gray[300] : colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Category Name</Text>
            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
              autoFocus
            />
            
            <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Color</Text>
            <View style={styles.colorGrid}>
              {categoryColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Check size={16} color={colors.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ marginRight: 8 }}
              />
              <Button
                title="Create Category"
                onPress={handleSaveCategory}
                variant="primary"
              />
            </View>
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
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: colors.text,
  },
  darkInput: {
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});