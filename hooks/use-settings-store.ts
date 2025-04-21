import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  joinDate?: string;
}

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  showBackendDemo: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleBackendDemo: () => void;
  
  // User state
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  login: () => void;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      notifications: true,
      showBackendDemo: false,
      isLoggedIn: true, // Default to logged in for demo
      userProfile: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        bio: 'Task management enthusiast and productivity expert. I love organizing projects and helping teams stay on track.',
        joinDate: 'January 2023',
      },
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      toggleBackendDemo: () => set((state) => ({ showBackendDemo: !state.showBackendDemo })),
      
      login: () => set({ 
        isLoggedIn: true,
        userProfile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, USA',
          bio: 'Task management enthusiast and productivity expert. I love organizing projects and helping teams stay on track.',
          joinDate: 'January 2023',
        }
      }),
      
      logout: () => set({ isLoggedIn: false, userProfile: null }),
      
      updateUserProfile: (profile) => set((state) => ({
        userProfile: {
          ...state.userProfile,
          ...profile,
        }
      })),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);