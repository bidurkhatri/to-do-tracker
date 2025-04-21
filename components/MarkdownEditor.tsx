import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { Bold, Italic, List, ListOrdered, Heading, Quote } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';

interface MarkdownEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  minHeight = 150,
}) => {
  const { darkMode } = useSettingsStore();
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const newText = 
      value.substring(0, selection.start) + 
      prefix + 
      value.substring(selection.start, selection.end) + 
      suffix + 
      value.substring(selection.end);
    
    onChange(newText);
  };
  
  const handleBold = () => {
    insertMarkdown('**', '**');
  };
  
  const handleItalic = () => {
    insertMarkdown('*', '*');
  };
  
  const handleBulletList = () => {
    insertMarkdown('- ');
  };
  
  const handleNumberedList = () => {
    insertMarkdown('1. ');
  };
  
  const handleHeading = () => {
    insertMarkdown('## ');
  };
  
  const handleQuote = () => {
    insertMarkdown('&gt; ');
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.toolbar, darkMode && styles.darkToolbar]}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleBold}>
          <Bold size={18} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleItalic}>
          <Italic size={18} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleHeading}>
          <Heading size={18} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleBulletList}>
          <List size={18} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleNumberedList}>
          <ListOrdered size={18} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleQuote}>
          <Quote size={18} color={darkMode ? colors.white : colors.text} />
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={[
          styles.editor, 
          { minHeight },
          darkMode && styles.darkEditor
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
        multiline
        textAlignVertical="top"
        onSelectionChange={(event) => {
          setSelection(event.nativeEvent.selection);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  darkToolbar: {
    backgroundColor: colors.gray[700],
  },
  toolbarButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  editor: {
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  darkEditor: {
    backgroundColor: colors.gray[800],
    color: colors.white,
  },
});