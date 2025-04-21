import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { useSettingsStore } from "@/hooks/use-settings-store";
import { colors } from "@/constants/colors";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Create a client for React Query
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { darkMode, isLoggedIn } = useSettingsStore();
  const segments = useSegments();
  const router = useRouter();
  
  // Check if the user is logged in and redirect if needed
  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    
    if (!isLoggedIn && !inAuthGroup) {
      // Redirect to the login page if not logged in
      router.replace('/auth/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect to the home page if logged in and trying to access auth pages
      router.replace('/');
    }
  }, [isLoggedIn, segments]);
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: darkMode ? colors.gray[800] : colors.white,
        },
        headerTintColor: darkMode ? colors.white : colors.text,
        contentStyle: {
          backgroundColor: darkMode ? colors.gray[900] : colors.gray[50],
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="task/create" options={{ headerShown: false }} />
      <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="task/edit/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
    </Stack>
  );
}