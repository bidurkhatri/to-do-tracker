import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '@/hooks/use-settings-store';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { darkMode, login } = useSettingsStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      login();
      router.replace('/');
    }, 1500);
  };
  
  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'In a complete app, this would send a password reset email.',
      [{ text: 'OK' }]
    );
  };
  
  const handleSignUp = () => {
    router.push('/auth/register');
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, darkMode && styles.darkLogoCircle]}>
              <Text style={styles.logoText}>TT</Text>
            </View>
            <Text style={[styles.appName, darkMode && styles.darkText]}>To-Do Tracker</Text>
            <Text style={[styles.tagline, darkMode && styles.darkTextLight]}>Organize your tasks efficiently</Text>
          </View>
          
          <View style={[styles.formContainer, darkMode && styles.darkFormContainer]}>
            <Text style={[styles.formTitle, darkMode && styles.darkText]}>Sign In</Text>
            
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />}
            />
            
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />
                  ) : (
                    <Eye size={18} color={darkMode ? colors.gray[300] : colors.gray[500]} />
                  )}
                </TouchableOpacity>
              }
            />
            
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, darkMode && { color: colors.primaryLight }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              style={styles.loginButton}
            />
            
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, darkMode && styles.darkTextLight]}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={[styles.signupLink, darkMode && { color: colors.primaryLight }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, darkMode && styles.darkTextLight]}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
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
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  darkLogoCircle: {
    backgroundColor: colors.primaryLight,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  darkText: {
    color: colors.white,
  },
  darkTextLight: {
    color: colors.gray[300],
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  darkFormContainer: {
    backgroundColor: colors.gray[800],
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
  },
  loginButton: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  signupText: {
    fontSize: 14,
    color: colors.textLight,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  footer: {
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});