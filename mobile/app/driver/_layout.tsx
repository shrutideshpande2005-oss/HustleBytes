import { Stack } from 'expo-router';

export default function DriverLayout() {
    return (
        <Stack
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="active-emergency" />
        </Stack>
    );
}
