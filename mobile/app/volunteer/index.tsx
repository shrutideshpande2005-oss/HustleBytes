import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Switch, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { useApp } from '@/context/AppContext';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { API_BASE_URL } from '@/services/api';
import { PAGE_TRANSLATIONS } from '@/constants/Translations';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';

const { width } = Dimensions.get('window');

// Mock User Data for Hackathon
const VOLUNTEER_PROFILE = {
    name: 'Dr. Suresh Kumar',
    bloodGroup: 'O+',
    occupation: 'Medical Student',
    phone: '+91 9876543210'
};

export default function VolunteerDashboard() {
    const router = useRouter();
    const { userId, setCurrentEmergency, addToast, language } = useApp();
    const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];

    const [isAvailable, setIsAvailable] = useState(false);
    const [locationStatus, setLocationStatus] = useState('Fetching live location...');
    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [nearbyEmergencies, setNearbyEmergencies] = useState<any[]>([]);
    const [activeEmergency, setActiveEmergency] = useState<any | null>(null);

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        setupLocation();
        fetchNearbyEmergencies();

        socketService.connect();

        socketService.on('VOLUNTEER_ALERT', (data: any) => {
            // New Emergency within 3KM matched by MongoDB 2dsphere!
            addToast('🚨 EMERGENCY MATCH: Within 3km!', 'error');
            setNearbyEmergencies(prev => [data.emergency, ...prev].filter((e, idx, arr) => arr.findIndex(x => x._id === e._id) === idx));
        });

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();

        return () => {
            socketService.off('VOLUNTEER_ALERT');
        };
    }, []);

    const setupLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationStatus('Location Access Denied');
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        setLocationStatus('Live GPS Active Tracking');
    };

    const fetchNearbyEmergencies = async () => {
        try {
            // Call our new volunteer geo-matcher endpoint
            const res = await fetch(`${API_BASE_URL}/volunteer/nearby?lat=18.5204&lon=73.8567&radius=3000`);
            const data = await res.json();
            if (data.success) {
                setNearbyEmergencies(data.emergencies);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleToggle = async (value: boolean) => {
        setIsAvailable(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // 🚀 HACKATHON MOCK: Drop in fake nearby emergencies when they go online!
        if (value) {
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                addToast('🚨 EMERGENCY MATCH: Within 3km!', 'error');
                setNearbyEmergencies([
                    {
                        _id: 'mock-emerg-1',
                        description: 'Severe accident on Highway 48. Immediate first response needed!',
                        severity: 'critical',
                        lat: 18.5204,
                        lon: 73.8567
                    },
                    {
                        _id: 'mock-emerg-2',
                        description: 'Elderly patient with sudden cardiac chest pain.',
                        severity: 'high',
                        lat: 18.5254,
                        lon: 73.8617
                    }
                ]);
            }, 2000);
        } else {
            // Clear mock emergencies if they go offline
            setNearbyEmergencies([]);
        }

        try {
            await fetch(`${API_BASE_URL}/volunteer/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, is_available: value })
            });
        } catch (e) {
            console.log("Mock user data not in DB, bypassing standard API for Hackathon simulation");
        }
    };

    const handleAccept = (emerg: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setActiveEmergency(emerg);
        setCurrentEmergency(emerg);
        // Remove from list
        setNearbyEmergencies(prev => prev.filter(e => e._id !== emerg._id));
    };

    const handleReject = (emerg: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setNearbyEmergencies(prev => prev.filter(e => e._id !== emerg._id));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>{t.volunteerDash}</Text>
                        <Text style={styles.headerSub}>{t.volunteerSub}</Text>
                    </View>
                </View>

                {/* Profile Card Overlay */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color="#F59E0B" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.profileName}>{VOLUNTEER_PROFILE.name}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="medical" size={12} color="#EF4444" />
                                    <Text style={styles.badgeText}>{VOLUNTEER_PROFILE.bloodGroup}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: '#E0E7FF' }]}>
                                    <Ionicons name="briefcase" size={12} color="#4F46E5" />
                                    <Text style={[styles.badgeText, { color: '#4F46E5' }]}>{VOLUNTEER_PROFILE.occupation}</Text>
                                </View>
                            </View>
                        </View>
                        <Switch
                            value={isAvailable}
                            onValueChange={handleToggle}
                            trackColor={{ false: '#CBD5E1', true: '#34D399' }}
                            thumbColor="#FFF"
                            ios_backgroundColor="#CBD5E1"
                        />
                    </View>

                    {/* Status Bar */}
                    <View style={styles.statusBar}>
                        <View style={styles.statusDotWrap}>
                            <Animated.View style={[styles.statusDotOuter, { backgroundColor: isAvailable ? 'rgba(52,211,153,0.3)' : 'transparent', transform: [{ scale: isAvailable ? pulseAnim : 1 }] }]} />
                            <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#10B981' : '#94A3B8' }]} />
                        </View>
                        <Text style={[styles.statusText, { color: isAvailable ? '#10B981' : '#64748B' }]}>
                            {isAvailable ? 'Available & Matching...' : 'Currently Offline'}
                        </Text>
                    </View>

                    <View style={styles.gpsBar}>
                        <Ionicons name="location" size={14} color={COLORS.primary} />
                        <Text style={styles.gpsText}>{locationStatus}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100, paddingTop: 90 }}>
                {activeEmergency ? (
                    <View style={styles.activeContainer}>
                        <Text style={styles.sectionTitle}>Currently Assigned</Text>
                        <View style={styles.activeCard}>
                            <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.activeGradient}>
                                <View style={styles.activeHeader}>
                                    <Ionicons name="warning" size={24} color="#FFF" />
                                    <Text style={styles.activeTitle}>Active Rescue</Text>
                                </View>
                                <Text style={styles.activeDesc}>{activeEmergency.description}</Text>
                                <View style={styles.activeMeta}>
                                    <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.activeDist}>1.2 km away • Follow map directions</Text>
                                </View>
                                <TouchableOpacity style={styles.navigateBtn} onPress={() => router.push('/volunteer/tracking')}>
                                    <Ionicons name="navigate" size={20} color="#B91C1C" />
                                    <Text style={styles.navigateText}>Open Live Map & Route</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.sectionTitle}>Nearby SOS Alerts (3km)</Text>
                        {nearbyEmergencies.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="shield-checkmark" size={64} color={COLORS.border} />
                                <Text style={styles.emptyText}>No emergencies nearby.</Text>
                                <Text style={styles.emptySub}>We will alert you immediately and by SMS if an SOS is matched to your location.</Text>
                            </View>
                        ) : (
                            nearbyEmergencies.map((emerg, idx) => (
                                <View key={idx} style={styles.emergCard}>
                                    <View style={styles.emergHeader}>
                                        <SeverityBadge severity={emerg.severity} />
                                        <Text style={styles.timeText}>Just now</Text>
                                    </View>
                                    <Text style={styles.emergDesc}>{emerg.description}</Text>
                                    <View style={styles.distRow}>
                                        <Ionicons name="analytics" size={16} color={COLORS.primary} />
                                        <Text style={styles.distText}>Distance: {(Math.random() * 2 + 0.5).toFixed(1)} km away</Text>
                                    </View>
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleReject(emerg)}>
                                            <Text style={styles.rejectText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAccept(emerg)}>
                                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                                            <Text style={styles.acceptText}>Accept task</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 60, paddingHorizontal: SPACING.lg, paddingBottom: 130, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)' },
    profileCard: { backgroundColor: '#FFF', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, position: 'absolute', bottom: -50, left: SPACING.lg, right: SPACING.lg, ...SHADOWS.medium },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    profileName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
    badgeRow: { flexDirection: 'row', gap: 6 },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#EF4444', textTransform: 'uppercase' },
    statusBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginBottom: 8 },
    statusDotWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
    statusDotOuter: { position: 'absolute', width: 20, height: 20, borderRadius: 10 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    statusText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
    gpsBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
    gpsText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
    emptyState: { alignItems: 'center', padding: SPACING.xxl, backgroundColor: '#FFF', borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
    emptyText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.md },
    emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: 8 },
    activeContainer: { marginBottom: SPACING.xl },
    activeCard: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.medium },
    activeGradient: { padding: SPACING.xl },
    activeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    activeTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#FFF' },
    activeDesc: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.md, lineHeight: 22 },
    activeMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.lg },
    activeDist: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
    navigateBtn: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: 8 },
    navigateText: { color: '#B91C1C', fontWeight: '800', fontSize: FONT_SIZES.sm },
    emergCard: { backgroundColor: '#FFF', padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    emergHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    timeText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
    emergDesc: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.sm, lineHeight: 20 },
    distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.lg, backgroundColor: COLORS.lowBg, padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
    distText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: SPACING.sm },
    actionBtn: { flex: 1, padding: 14, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
    rejectBtn: { backgroundColor: COLORS.surfaceElevated },
    rejectText: { color: COLORS.textSecondary, fontWeight: '700' },
    acceptBtn: { backgroundColor: COLORS.success },
    acceptText: { color: '#FFF', fontWeight: '800' }
});
