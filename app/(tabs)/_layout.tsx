import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';
import { Home, FolderKanban, Settings, Calendar } from 'lucide-react-native';
import { useSettingsStore } from '@/hooks/use-settings-store';

export default function TabLayout() {
  const { darkMode } = useSettingsStore();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: darkMode ? colors.gray[400] : colors.gray[500],
        tabBarStyle: {
          backgroundColor: darkMode ? colors.gray[800] : colors.white,
          borderTopColor: darkMode ? colors.gray[700] : colors.gray[200],
        },
        headerStyle: {
          backgroundColor: darkMode ? colors.gray[800] : colors.white,
        },
        headerTitleStyle: {
          color: darkMode ? colors.white : colors.text,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <FolderKanban size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}