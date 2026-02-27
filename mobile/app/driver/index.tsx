import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp, Emergency } from '@/context/AppContext';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { getAssignedEmergencies, acceptEmergency, rejectEmergency } from '@/services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, SEVERITY_COLORS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Mock data for demo
const MOCK_EMERGENCIES: Emergency[] = [
    {
        id: 'EMG-001',
        description: 'Road accident on Karve Road, two people injured. Need immediate assistance.',
        lat: 18.5020,
        lon: 73.8260,
        severity: 'critical',
        status: 'pending',
        created_at: new Date(Date.now() - 120000).toISOString(),
        citizen_name: 'Rahul Sharma',
        citizen_phone: '+91 98765 43210',
    },
    {
        id: 'EMG-002',
        description: 'Elderly person collapsed near Pune University.',
        lat: 18.5360,
        lon: 73.8180,
        severity: 'high',
        status: 'pending',
        created_at: new Date(Date.now() - 300000).toISOString(),
        citizen_name: 'Priya Patel',
        citizen_phone: '+91 87654 32109',
    },
    {
        id: 'EMG-003',
        description: 'Minor burn injury from kitchen accident in Kothrud.',
        lat: 18.5000,
        lon: 73.8000,
        severity: 'moderate',
        status: 'pending',
        created_at: new Date(Date.now() - 600000).toISOString(),
        citizen_name: 'Amit Kumar',
        citizen_phone: '+91 76543 21098',
    },
];

export default function DriverDashboard() {
    const router = useRouter();
    const { setCurrentEmergency, addToast, userId } = useApp();
    const [emergencies, setEmergencies] = useState<Emergency[]>(MOCK_EMERGENCIES);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    useEffect(() => {
        socketService.connect();

        socketService.on(SOCKET_EVENTS.NEW_EMERGENCY, (data: any) => {
            addToast('🚨 New emergency request!', 'warning');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setEmergencies((prev) => [data, ...prev]);
        });

        return () => {
            socketService.off(SOCKET_EVENTS.NEW_EMERGENCY);
        };
    }, []);

    const handleAccept = async (emergency: Emergency) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setAcceptingId(emergency.id);

        try {
            await acceptEmergency(emergency.id, userId);
        } catch (e) {
            // Demo mode: proceed anyway
        }

        const accepted = { ...emergency, status: 'accepted' as const };
        setCurrentEmergency(accepted);
        setEmergencies((prev) => prev.filter((e) => e.id !== emergency.id));
        addToast(`Accepted emergency ${emergency.id}`, 'success');
        setAcceptingId(null);
        router.push('/driver/active-emergency');
    };

    const handleReject = async (emergencyId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await rejectEmergency(emergencyId, userId);
        } catch (e) { }
        setEmergencies((prev) => prev.filter((e) => e.id !== emergencyId));
        addToast('Emergency rejected', 'info');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await getAssignedEmergencies(userId);
            if (res && res.emergencies) {
                setEmergencies(res.emergencies);
            } else {
                setEmergencies(MOCK_EMERGENCIES);
            }
        } catch (e) {
            setEmergencies(MOCK_EMERGENCIES);
        }
        setRefreshing(false);
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff} min ago`;
        return `${Math.floor(diff / 60)}h ago`;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Ambulance Dashboard</Text>
                    <Text style={styles.headerSub}>Driver: {userId}</Text>
                </View>
                <View style={styles.statusPill}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusPillText}>Online</Text>
                </View>
            </LinearGradient>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{emergencies.length}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.critical }]}>
                        {emergencies.filter((e) => e.severity === 'critical').length}
                    </Text>
                    <Text style={styles.statLabel}>Critical</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>0</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
            </View>

            {/* Emergency List */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.accent]} />
                }
            >
                {emergencies.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>No pending emergencies</Text>
                        <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
                    </View>
                ) : (
                    emergencies.map((emergency) => {
                        const sevColors = SEVERITY_COLORS[emergency.severity] || SEVERITY_COLORS.low;
                        return (
                            <View
                                key={emergency.id}
                                style={[
                                    styles.emergencyCard,
                                    emergency.severity === 'critical' && styles.criticalCard,
                                ]}
                            >
                                {/* Card header */}
                                <View style={styles.cardHeader}>
                                    <SeverityBadge severity={emergency.severity} />
                                    <Text style={styles.timeAgo}>{getTimeAgo(emergency.created_at)}</Text>
                                </View>

                                {/* ID */}
                                <Text style={styles.emergencyId}>{emergency.id}</Text>

                                {/* Description */}
                                <Text style={styles.description} numberOfLines={2}>
                                    {emergency.description}
                                </Text>

                                {/* Patient Info */}
                                {emergency.citizen_name && (
                                    <View style={styles.patientRow}>
                                        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                                        <Text style={styles.patientText}>{emergency.citizen_name}</Text>
                                        <Ionicons name="call-outline" size={14} color={COLORS.textMuted} />
                                        <Text style={styles.patientText}>{emergency.citizen_phone}</Text>
                                    </View>
                                )}

                                {/* Location */}
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={14} color={COLORS.accent} />
                                    <Text style={styles.locationText}>
                                        {emergency.lat.toFixed(4)}, {emergency.lon.toFixed(4)} • ~2.3 km away
                                    </Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.rejectBtn}
                                        onPress={() => handleReject(emergency.id)}
                                    >
                                        <Ionicons name="close" size={18} color={COLORS.error} />
                                        <Text style={styles.rejectText}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.acceptBtn}
                                        onPress={() => handleAccept(emergency)}
                                        disabled={acceptingId === emergency.id}
                                    >
                                        {acceptingId === emergency.id ? (
                                            <LoadingSpinner size={18} color="#FFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark" size={18} color="#FFF" />
                                                <Text style={styles.acceptText}>Accept & Respond</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
    statusPillText: { fontSize: FONT_SIZES.xs, color: '#FFF', fontWeight: '600' },
    statsBar: { flexDirection: 'row', backgroundColor: COLORS.surface, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary },
    statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: COLORS.border },
    list: { flex: 1 },
    listContent: { padding: SPACING.lg, gap: SPACING.md },
    emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyTitle: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, fontWeight: '600', marginTop: SPACING.md },
    emptySubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
    emergencyCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    criticalCard: { borderColor: COLORS.critical, borderWidth: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    timeAgo: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },
    emergencyId: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    description: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '500', lineHeight: 22, marginBottom: SPACING.sm },
    patientRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xs },
    patientText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.md },
    locationText: { fontSize: FONT_SIZES.xs, color: COLORS.accent, fontWeight: '500' },
    actionRow: { flexDirection: 'row', gap: SPACING.sm },
    rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.error + '30', backgroundColor: COLORS.criticalBg },
    rejectText: { fontSize: FONT_SIZES.sm, color: COLORS.error, fontWeight: '700' },
    acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.success },
    acceptText: { fontSize: FONT_SIZES.sm, color: '#FFF', fontWeight: '700' },
});
