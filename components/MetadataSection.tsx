import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskMetadata } from '@/types/task';
import { colors } from '@/constants/colors';
import { User, Clock, DollarSign, FileText, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';

interface MetadataSectionProps {
  metadata: TaskMetadata;
  accentColor?: string;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({ 
  metadata,
  accentColor = colors.primary
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { darkMode } = useSettingsStore();
  
  // Check if there's any metadata to display
  const hasMetadata = 
    (metadata.contact && (metadata.contact.name || metadata.contact.email || metadata.contact.phone)) ||
    metadata.cost ||
    metadata.timeline ||
    (metadata.documentsNeeded && metadata.documentsNeeded.length > 0) ||
    metadata.contingencies;
  
  if (!hasMetadata) {
    return null;
  }
  
  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <TouchableOpacity 
        style={[
          styles.header,
          { borderBottomWidth: isExpanded ? 1 : 0, borderBottomColor: darkMode ? colors.gray[700] : colors.gray[200] }
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Additional Information</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={darkMode ? colors.white : colors.text} />
        ) : (
          <ChevronDown size={20} color={darkMode ? colors.white : colors.text} />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {metadata.contact && (metadata.contact.name || metadata.contact.email || metadata.contact.phone) && (
            <View style={styles.metadataItem}>
              <View style={[styles.metadataIcon, { backgroundColor: accentColor + '20' }]}>
                <User size={16} color={accentColor} />
              </View>
              <View style={styles.metadataContent}>
                <Text style={[styles.metadataLabel, darkMode && styles.darkText]}>Contact</Text>
                {metadata.contact.name && (
                  <Text style={[styles.metadataValue, darkMode && styles.darkTextLight]}>{metadata.contact.name}</Text>
                )}
                {metadata.contact.email && (
                  <Text style={[styles.metadataValue, darkMode && styles.darkTextLight]}>{metadata.contact.email}</Text>
                )}
                {metadata.contact.phone && (
                  <Text style={[styles.metadataValue, darkMode && styles.darkTextLight]}>{metadata.contact.phone}</Text>
                )}
              </View>
            </View>
          )}
          
          {metadata.timeline && (
            <View style={styles.metadataItem}>
              <View style={[styles.metadataIcon, { backgroundColor: accentColor + '20' }]}>
                <Clock size={16} color={accentColor} />
              </View>
              <View style={styles.metadataContent}>
                <Text style={[styles.metadataLabel, darkMode && styles.darkText]}>Timeline</Text>
                <Text style={[styles.metadataValue, darkMode && styles.darkTextLight]}>{metadata.timeline}</Text>
              </View>
            </View>
          )}
          
          {metadata.cost && (
            <View style={styles.metadataItem}>
              <View style={[styles.metadataIcon, { backgroundColor: accentColor + '20' }]}>
                <DollarSign size={16} color={accentColor} />
              </View>
              <View style={styles.metadataContent}>
                <Text style={[styles.metadataLabel, darkMode && styles.darkText]}>Cost</Text>
                <Text style={[styles.metadataValue, darkMode && styles.darkTextLight]}>{metadata.cost}</Text>
              </View>
            </View>
          )}
          
          {metadata.documentsNeeded && metadata.documentsNeeded.length > 0 && (
            <View style={styles.metadataItem}>
              <View style={[styles.metadataIcon, { backgroundColor: accentColor + '20' }]}>
                <FileText size={16} color={accentColor} />
              </View>
              <View style={styles.metadataContent}>
                <Text style={[styles.metadataLabel, darkMode && styles.darkText]}>Documents Needed</Text>
                <View style={styles.documentsList}>
                  {metadata.documentsNeeded.map((doc, index) => (
                    <View key={index} style={styles.documentItem}>
                      <View style={[styles.documentBullet, { backgroundColor: accentColor }]} />
                      <Text style={[styles.documentText, darkMode && styles.darkTextLight]}>
                        {doc}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
          
          {metadata.contingencies && (
            <View style={styles.metadataItem}>
              <View style={[styles.metadataIcon, { backgroundColor: accentColor + '20' }]}>
                <AlertTriangle size={16} color={accentColor} />
              </View>
              <View style={styles.metadataContent}>
                <Text style={[styles.metadataLabel, darkMode && styles.darkText]}>Contingencies</Text>
                <Text style={[styles.metadataValue, darkMode && styles.darkTextLight]}>{metadata.contingencies}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  darkContainer: {
    backgroundColor: colors.gray[800],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metadataIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metadataContent: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  documentsList: {
    marginTop: 4,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  documentBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  documentText: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
    lineHeight: 20,
  },
});