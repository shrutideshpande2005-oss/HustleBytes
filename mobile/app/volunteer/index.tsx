import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    FlatList,
    Alert,
    AppState,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useApp } from '@/context/AppContext';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { acceptEmergency, rejectEmergency } from '@/services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function VolunteerDashboard() {
    const router = useRouter();
    const { userId, setCurrentEmergency, addToast } = useApp();

    const [isAvailable, setIsAvailable] = useState(false);
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const appState = useRef(AppState.currentState);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    // ---------------------------------------------------------------------------
    // 1. LIFECYCLE & STATE MANAGEMENT
    // ---------------------------------------------------------------------------
    useEffect(() => {
        setupPermissions();

        // Foreground/Background Handling
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                socketService.connect();
                // Optionally refetch missed emergencies via REST API here
            }
            appState.current = nextAppState;
        });

        // Socket Event Listeners
        socketService.on(SOCKET_EVENTS.NEW_EMERGENCY, handleIncomingEmergency);

        return () => {
            subscription.remove();
            socketService.off(SOCKET_EVENTS.NEW_EMERGENCY);
            stopLocationTracking();
        };
    }, []);

    // Start/Stop Live Location based on Availability
    useEffect(() => {
        if (isAvailable) {
            startLiveLocationTracking();
        } else {
            stopLocationTracking();
        }
    }, [isAvailable]);

    // ---------------------------------------------------------------------------
    // 2. PERMISSIONS & NOTIFICATIONS
    // ---------------------------------------------------------------------------
    const setupPermissions = async () => {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required to receive nearby emergencies.');
        }

        // Note: expo-notifications was removed from Expo Go Android SDK 53+. 
        // Development builds are needed. So we avoid calling Push notifications logic here in Expo Go.
        // const { status: pushStatus } = await Notifications.requestPermissionsAsync();
        // if (pushStatus !== 'granted') {
        //     Alert.alert('Permission Denied', 'Push notifications are important for receiving alerts in the background.');
        // }

        // Ideally, get ExpoPushTokenAsync and send it to your backend
    };

    // ---------------------------------------------------------------------------
    // 3. LOCATION TRACKING (Foreground initially, Background if needed)
    // ---------------------------------------------------------------------------
    const startLiveLocationTracking = async () => {
        try {
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
                    // Send location to backend
                    socketService.emit(SOCKET_EVENTS.LOCATION_UPDATE, {
                        volunteerId: userId,
                        lat: location.coords.latitude,
                        lon: location.coords.longitude,
                        timestamp: location.timestamp
                    });
                }
            );
        } catch (error) {
            console.error('Failed to start location tracking', error);
        }
    };

    const stopLocationTracking = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    };

    // ---------------------------------------------------------------------------
    // 4. EMERGENCY HANDLING LOGIC & EDGE CASES
    // ---------------------------------------------------------------------------
    const handleIncomingEmergency = (emergency: any) => {
        if (!isAvailable) return;

        // Ensure we don't add duplicates
        setEmergencies(prev => {
            if (prev.find(e => e.id === emergency.id)) return prev;
            return [emergency, ...prev];
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        addToast('New Emergency Alert!', 'warning');
    };

    const handleAccept = async (emergency: any) => {
        setProcessingId(emergency.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const response = await acceptEmergency(emergency.id, userId);

            // Edge Case: Someone else already accepted it
            if (response?.error === 'ALREADY_ASSIGNED') {
                Alert.alert('Missed It', 'Another responder already accepted this emergency.');
                setEmergencies(prev => prev.filter(e => e.id !== emergency.id));
                return;
            }

            // Success case
            setCurrentEmergency({ ...emergency, status: 'accepted' });
            router.push('/volunteer/tracking'); // Navigate to Live Tracking

            // Clean up list
            setEmergencies(prev => prev.filter(e => e.id !== emergency.id));

        } catch (error) {
            Alert.alert('Connection Error', 'Please check your internet connection and try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (emergencyId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await rejectEmergency(emergencyId, userId);
        } catch (e) { } // Best effort rejection
        setEmergencies(prev => prev.filter(e => e.id !== emergencyId));
    };

    // ---------------------------------------------------------------------------
    // 5. RENDER COMPONENTS (Optimized FlatList)
    // ---------------------------------------------------------------------------
    const renderEmergencyItem = ({ item }: { item: any }) => (
        <View style={styles.emergencyCard}>
            <View style={styles.cardHeader}>
                <SeverityBadge severity={item.severity || 'high'} />
                <Text style={styles.distanceText}>{item.distance?.toFixed(1) || '1.2'} km away</Text>
            </View>

            <Text style={styles.emergencyId}>{item.id}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item.id)}
                    disabled={processingId !== null}
                >
                    <Text style={styles.rejectText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.acceptBtn, processingId === item.id && styles.disabledBtn]}
                    onPress={() => handleAccept(item)}
                    disabled={processingId !== null}
                >
                    {processingId === item.id ? (
                        <LoadingSpinner size={18} color="#FFF" />
                    ) : (
                        <Text style={styles.acceptText}>Accept & Respond</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Responder Ready</Text>
                    <Text style={styles.headerSub}>Volunteer ID: {userId}</Text>
                </View>

                {/* Availability Toggle */}
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>{isAvailable ? 'ONLINE' : 'OFFLINE'}</Text>
                    <Switch
                        value={isAvailable}
                        onValueChange={(val) => {
                            setIsAvailable(val);
                            Haptics.selectionAsync();
                        }}
                        trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#10B981' }}
                        thumbColor="#FFF"
                    />
                </View>
            </LinearGradient>

            {/* Main Content Area */}
            {!isAvailable ? (
                <View style={styles.offlineState}>
                    <Ionicons name="moon" size={64} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>You are Offline</Text>
                    <Text style={styles.emptySubtitle}>Go online to receive nearby emergency requests.</Text>
                </View>
            ) : (
                <FlatList
                    data={emergencies}
                    keyExtractor={item => item.id}
                    renderItem={renderEmergencyItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.offlineState}>
                            <Ionicons name="radio" size={64} color={COLORS.accent} />
                            <Text style={styles.emptyTitle}>Listening for emergencies...</Text>
                            <Text style={styles.emptySubtitle}>Stay alert. Make sure your volume is up.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)' },

    toggleContainer: { alignItems: 'center' },
    toggleText: { fontSize: 10, color: '#FFF', fontWeight: 'bold', marginBottom: 2 },

    offlineState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyTitle: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, fontWeight: '700', marginTop: SPACING.md },
    emptySubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs },

    listContent: { padding: SPACING.lg, gap: SPACING.md },
    emergencyCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    distanceText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.accent },
    emergencyId: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 4 },
    description: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '500', marginBottom: SPACING.md, lineHeight: 22 },

    actionRow: { flexDirection: 'row', gap: SPACING.sm },
    rejectBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
    rejectText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONT_SIZES.sm },
    acceptBtn: { flex: 2, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    acceptText: { color: '#FFF', fontWeight: '800', fontSize: FONT_SIZES.sm },
    disabledBtn: { opacity: 0.7 }
});
