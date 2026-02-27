import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppProvider } from '@/context/AppContext';
import ToastContainer from '@/components/ui/ToastContainer';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="citizen" />
          <Stack.Screen name="driver" />
          <Stack.Screen name="hospital" />
          <Stack.Screen name="admin" />
        </Stack>
        <ToastContainer />
        <StatusBar style="light" />
      </View>
    </AppProvider>
  );
}
