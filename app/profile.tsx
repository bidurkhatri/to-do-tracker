import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar, Save } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { darkMode, userProfile, updateUserProfile } = useSettingsStore();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSaveProfile = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    updateUserProfile({
      name,
      email,
      phone,
      location,
      bio,
      avatarUrl: userProfile?.avatarUrl,
    });
    
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };
  
  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Profile Picture',
      'This would open the image picker in a complete app.',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={darkMode ? colors.white : colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={[styles.editButton, darkMode && styles.darkEditButton]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, darkMode && styles.darkAvatar]}>
              {userProfile?.avatarUrl ? (
                <Image
                  source={{ uri: userProfile.avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <User size={40} color={darkMode ? colors.gray[300] : colors.gray[400]} />
              )}
              
              {isEditing && (
                <TouchableOpacity
                  style={[styles.cameraButton, darkMode && styles.darkCameraButton]}
                  onPress={handleChangeAvatar}
                >
                  <Camera size={16} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
            
            {!isEditing && (
              <Text style={[styles.userName, darkMode && styles.darkText]}>
                {userProfile?.name || 'User Name'}
              </Text>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                leftIcon={<User size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />}
              />
              
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                leftIcon={<Mail size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />}
              />
              
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />}
              />
              
              <Input
                label="Location"
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
                leftIcon={<MapPin size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />}
              />
              
              <Text style={[styles.label, darkMode && styles.darkText]}>Bio</Text>
              <TextInput
                style={[styles.bioInput, darkMode && styles.darkBioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={darkMode ? colors.gray[400] : colors.gray[500]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <Button
                title="Save Profile"
                onPress={handleSaveProfile}
                variant="primary"
                icon={<Save size={16} color={colors.white} />}
                style={styles.saveButton}
              />
            </View>
          ) : (
            <View style={[styles.profileInfo, darkMode && styles.darkProfileInfo]}>
              <View style={styles.infoItem}>
                <Mail size={20} color={darkMode ? colors.primaryLight : colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, darkMode && styles.darkTextLight]}>Email</Text>
                  <Text style={[styles.infoValue, darkMode && styles.darkText]}>
                    {userProfile?.email || 'email@example.com'}
                  </Text>
                </View>
              </View>
              
              {userProfile?.phone && (
                <View style={styles.infoItem}>
                  <Phone size={20} color={darkMode ? colors.primaryLight : colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, darkMode && styles.darkTextLight]}>Phone</Text>
                    <Text style={[styles.infoValue, darkMode && styles.darkText]}>{userProfile.phone}</Text>
                  </View>
                </View>
              )}
              
              {userProfile?.location && (
                <View style={styles.infoItem}>
                  <MapPin size={20} color={darkMode ? colors.primaryLight : colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, darkMode && styles.darkTextLight]}>Location</Text>
                    <Text style={[styles.infoValue, darkMode && styles.darkText]}>{userProfile.location}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.infoItem}>
                <Calendar size={20} color={darkMode ? colors.primaryLight : colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, darkMode && styles.darkTextLight]}>Member Since</Text>
                  <Text style={[styles.infoValue, darkMode && styles.darkText]}>
                    {userProfile?.joinDate || 'January 2023'}
                  </Text>
                </View>
              </View>
              
              {userProfile?.bio && (
                <View style={styles.bioContainer}>
                  <Text style={[styles.bioLabel, darkMode && styles.darkTextLight]}>Bio</Text>
                  <Text style={[styles.bioText, darkMode && styles.darkText]}>{userProfile.bio}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  darkAvatar: {
    backgroundColor: colors.gray[700],
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  darkCameraButton: {
    borderColor: colors.gray[900],
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  editButton: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  darkEditButton: {
    color: colors.primaryLight,
  },
  profileInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  darkProfileInfo: {
    backgroundColor: colors.gray[800],
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  bioContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  editForm: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    height: 120,
    marginBottom: 16,
  },
  darkBioInput: {
    borderColor: colors.gray[600],
    backgroundColor: colors.gray[700],
    color: colors.white,
  },
  saveButton: {
    marginTop: 16,
  },
});