import { Stack } from 'expo-router';

export default function CitizenLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="emergency-form" />
            <Stack.Screen name="tracking" />
        </Stack>
    );
}
