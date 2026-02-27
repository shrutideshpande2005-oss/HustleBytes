import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, Emergency } from '@/context/AppContext';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, SEVERITY_COLORS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';

const { width } = Dimensions.get('window');

// Mock data
const MOCK_EMERGENCIES: Emergency[] = [
    { id: 'EMG-001', description: 'Road accident NH-44', lat: 28.6229, lon: 77.2195, severity: 'critical', status: 'en_route_hospital', ambulance_id: 'AMB-042', hospital_name: 'AIIMS', created_at: new Date(Date.now() - 120000).toISOString() },
    { id: 'EMG-002', description: 'Cardiac arrest elderly person', lat: 28.6315, lon: 77.2167, severity: 'high', status: 'picked_patient', ambulance_id: 'AMB-017', hospital_name: 'Safdarjung', created_at: new Date(Date.now() - 300000).toISOString() },
    { id: 'EMG-003', description: 'Building fire, 3 injured', lat: 28.6500, lon: 77.2300, severity: 'critical', status: 'assigned', ambulance_id: 'AMB-089', hospital_name: 'RML Hospital', created_at: new Date(Date.now() - 60000).toISOString() },
    { id: 'EMG-004', description: 'Minor fall injury at metro', lat: 28.6139, lon: 77.2090, severity: 'low', status: 'completed', ambulance_id: 'AMB-005', hospital_name: 'GTB Hospital', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'EMG-005', description: 'Snake bite, rural area', lat: 28.6400, lon: 77.2100, severity: 'high', status: 'accepted', ambulance_id: 'AMB-033', hospital_name: 'LNJP Hospital', created_at: new Date(Date.now() - 180000).toISOString() },
    { id: 'EMG-006', description: 'Breathing difficulty, possible COVID', lat: 28.6200, lon: 77.2400, severity: 'moderate', status: 'pending', created_at: new Date(Date.now() - 30000).toISOString() },
];

const MOCK_AMBULANCES = [
    { id: 'AMB-005', lat: 28.6139, lon: 77.2090, status: 'available' },
    { id: 'AMB-017', lat: 28.6350, lon: 77.2200, status: 'busy' },
    { id: 'AMB-033', lat: 28.6420, lon: 77.2080, status: 'busy' },
    { id: 'AMB-042', lat: 28.6250, lon: 77.2180, status: 'busy' },
    { id: 'AMB-089', lat: 28.6480, lon: 77.2320, status: 'busy' },
    { id: 'AMB-112', lat: 28.6100, lon: 77.2050, status: 'available' },
];

const MOCK_HOSPITALS = [
    { name: 'AIIMS', icu: 3, general: 12, load: 85 },
    { name: 'Safdarjung', icu: 8, general: 25, load: 62 },
    { name: 'RML Hospital', icu: 5, general: 18, load: 71 },
    { name: 'GTB Hospital', icu: 12, general: 45, load: 35 },
    { name: 'LNJP Hospital', icu: 2, general: 8, load: 90 },
];

export default function AdminDashboard() {
    const router = useRouter();
    const { surgeMode, setSurgeMode, addToast } = useApp();
    const [emergencies, setEmergencies] = useState(MOCK_EMERGENCIES);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'emergencies' | 'resources'>('overview');
    const surgeAnim = useRef(new Animated.Value(0)).current;

    // Check surge conditions
    useEffect(() => {
        const criticalCount = emergencies.filter(
            (e) => e.severity === 'critical' && e.status !== 'completed'
        ).length;
        if (criticalCount >= 2 && !surgeMode) {
            setSurgeMode(true);
            addToast('⚠️ SURGE MODE ACTIVATED — Multiple critical emergencies detected!', 'warning');
        }
    }, [emergencies]);

    // Surge mode animation
    useEffect(() => {
        if (surgeMode) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(surgeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(surgeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [surgeMode]);

    useEffect(() => {
        socketService.connect();

        socketService.on(SOCKET_EVENTS.NEW_EMERGENCY, (data: any) => {
            setEmergencies((prev) => [data, ...prev]);
            addToast('🚨 New emergency reported!', 'warning');
        });

        socketService.on(SOCKET_EVENTS.STATUS_UPDATE, (data: any) => {
            setEmergencies((prev) =>
                prev.map((e) => (e.id === data.emergency_id ? { ...e, status: data.status } : e))
            );
        });

        return () => {
            socketService.off(SOCKET_EVENTS.NEW_EMERGENCY);
            socketService.off(SOCKET_EVENTS.STATUS_UPDATE);
        };
    }, []);

    const activeEmergencies = emergencies.filter((e) => e.status !== 'completed');
    const criticalCount = emergencies.filter((e) => e.severity === 'critical' && e.status !== 'completed').length;
    const availableAmbulances = MOCK_AMBULANCES.filter((a) => a.status === 'available').length;

    const getStatusColor = (status: string) => {
        if (status === 'completed') return COLORS.success;
        if (status === 'pending') return COLORS.critical;
        return COLORS.accent;
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Now';
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h`;
    };

    return (
        <View style={styles.container}>
            {/* Surge Mode Banner */}
            {surgeMode && (
                <Animated.View style={[styles.surgeBanner, { opacity: surgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }]}>
                    <Ionicons name="warning" size={18} color="#FFF" />
                    <Text style={styles.surgeText}>⚠️ SURGE MODE — Multiple critical emergencies in area</Text>
                </Animated.View>
            )}

            {/* Header */}
            <LinearGradient colors={['#6D28D9', '#7C3AED']} style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Command Center</Text>
                    <Text style={styles.headerSub}>Admin Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={() => addToast('Data refreshed', 'info')}>
                    <Ionicons name="refresh" size={20} color="#FFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { borderLeftColor: COLORS.critical }]}>
                    <Text style={[styles.statValue, { color: COLORS.critical }]}>{activeEmergencies.length}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: COLORS.high }]}>
                    <Text style={[styles.statValue, { color: COLORS.high }]}>{criticalCount}</Text>
                    <Text style={styles.statLabel}>Critical</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: COLORS.accent }]}>
                    <Text style={[styles.statValue, { color: COLORS.accent }]}>{MOCK_AMBULANCES.length}</Text>
                    <Text style={styles.statLabel}>Ambulances</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{availableAmbulances}</Text>
                    <Text style={styles.statLabel}>Available</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {(['overview', 'emergencies', 'resources'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
            >
                {activeTab === 'overview' && (
                    <>
                        {/* Map Placeholder */}
                        <View style={styles.mapContainer}>
                            <LinearGradient colors={['#1E293B', '#334155']} style={styles.mapPlaceholder}>
                                <Ionicons name="globe" size={40} color={COLORS.accent} />
                                <Text style={styles.mapText}>Live Operations Map</Text>
                                <View style={styles.mapLegend}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: COLORS.critical }]} />
                                        <Text style={styles.legendText}>Emergencies ({activeEmergencies.length})</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: COLORS.ambulanceYellow }]} />
                                        <Text style={styles.legendText}>Ambulances ({MOCK_AMBULANCES.length})</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: COLORS.hospitalBlue }]} />
                                        <Text style={styles.legendText}>Hospitals ({MOCK_HOSPITALS.length})</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Recent Activity */}
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        {emergencies.slice(0, 4).map((e) => (
                            <View key={e.id} style={styles.activityRow}>
                                <View style={[styles.activityDot, { backgroundColor: getStatusColor(e.status) }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.activityTitle}>
                                        {e.id} — {e.description}
                                    </Text>
                                    <Text style={styles.activityMeta}>
                                        {e.ambulance_id || 'Unassigned'} • {e.hospital_name || 'Pending'} • {e.status.replace(/_/g, ' ')}
                                    </Text>
                                </View>
                                <SeverityBadge severity={e.severity} size="sm" />
                            </View>
                        ))}
                    </>
                )}

                {activeTab === 'emergencies' && (
                    <>
                        <Text style={styles.sectionTitle}>All Emergencies ({emergencies.length})</Text>
                        {emergencies.map((e) => (
                            <View key={e.id} style={[styles.emergencyRow, e.severity === 'critical' && { borderLeftColor: COLORS.critical, borderLeftWidth: 3 }]}>
                                <View style={styles.emergencyRowHeader}>
                                    <Text style={styles.emergencyRowId}>{e.id}</Text>
                                    <SeverityBadge severity={e.severity} size="sm" />
                                </View>
                                <Text style={styles.emergencyRowDesc} numberOfLines={1}>{e.description}</Text>
                                <View style={styles.emergencyRowMeta}>
                                    <Text style={styles.metaChip}>🚑 {e.ambulance_id || '—'}</Text>
                                    <Text style={styles.metaChip}>🏥 {e.hospital_name || '—'}</Text>
                                    <View style={[styles.statusChip, { backgroundColor: getStatusColor(e.status) + '20' }]}>
                                        <Text style={[styles.statusChipText, { color: getStatusColor(e.status) }]}>
                                            {e.status.replace(/_/g, ' ')}
                                        </Text>
                                    </View>
                                    <Text style={styles.timeChip}>{getTimeAgo(e.created_at)}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {activeTab === 'resources' && (
                    <>
                        {/* Ambulance Fleet */}
                        <Text style={styles.sectionTitle}>Ambulance Fleet</Text>
                        <View style={styles.fleetGrid}>
                            {MOCK_AMBULANCES.map((a) => (
                                <View key={a.id} style={[styles.fleetCard, a.status === 'available' && styles.fleetAvailable]}>
                                    <Ionicons name="car-sport" size={20} color={a.status === 'available' ? COLORS.success : COLORS.high} />
                                    <Text style={styles.fleetId}>{a.id}</Text>
                                    <Text style={[styles.fleetStatus, { color: a.status === 'available' ? COLORS.success : COLORS.high }]}>
                                        {a.status}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Hospital Capacities */}
                        <Text style={styles.sectionTitle}>Hospital Capacities</Text>
                        {MOCK_HOSPITALS.map((h) => (
                            <View key={h.name} style={styles.hospitalRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.hospitalName}>{h.name}</Text>
                                    <View style={styles.hospitalMeta}>
                                        <Text style={styles.hospitalBeds}>ICU: {h.icu}</Text>
                                        <Text style={styles.hospitalBeds}>General: {h.general}</Text>
                                    </View>
                                </View>
                                <View style={styles.loadBarContainer}>
                                    <View style={styles.loadBar}>
                                        <View
                                            style={[
                                                styles.loadBarFill,
                                                {
                                                    width: `${h.load}%`,
                                                    backgroundColor: h.load > 80 ? COLORS.critical : h.load > 60 ? COLORS.high : COLORS.success,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.loadPercent, { color: h.load > 80 ? COLORS.critical : COLORS.textSecondary }]}>
                                        {h.load}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    surgeBanner: { backgroundColor: COLORS.surgeOrange, paddingVertical: 8, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: 50 },
    surgeText: { color: '#FFF', fontSize: FONT_SIZES.xs, fontWeight: '800', flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    statsGrid: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm },
    statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center', borderLeftWidth: 3, ...SHADOWS.small },
    statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
    statLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
    tabBar: { flexDirection: 'row', marginHorizontal: SPACING.lg, backgroundColor: COLORS.surfaceElevated, borderRadius: BORDER_RADIUS.md, padding: 4, borderWidth: 1, borderColor: COLORS.border },
    tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.sm },
    tabActive: { backgroundColor: COLORS.primary },
    tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted },
    tabTextActive: { color: '#FFF' },
    scrollView: { flex: 1 },
    content: { padding: SPACING.lg, gap: SPACING.md },
    sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.sm },
    mapContainer: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.medium },
    mapPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    mapText: { fontSize: FONT_SIZES.md, color: COLORS.accentLight, fontWeight: '600', marginTop: SPACING.sm },
    mapLegend: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)' },
    activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    activityDot: { width: 10, height: 10, borderRadius: 5 },
    activityTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
    activityMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    emergencyRow: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    emergencyRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    emergencyRowId: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
    emergencyRowDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, marginBottom: SPACING.sm },
    emergencyRowMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
    metaChip: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
    statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
    statusChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'capitalize' },
    timeChip: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },
    fleetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    fleetCard: { width: (width - SPACING.lg * 2 - SPACING.sm * 2) / 3, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    fleetAvailable: { borderColor: COLORS.success, backgroundColor: COLORS.lowBg },
    fleetId: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
    fleetStatus: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
    hospitalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
    hospitalName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
    hospitalMeta: { flexDirection: 'row', gap: SPACING.md, marginTop: 2 },
    hospitalBeds: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },
    loadBarContainer: { alignItems: 'flex-end', width: 80 },
    loadBar: { width: '100%', height: 6, backgroundColor: COLORS.borderLight, borderRadius: 3 },
    loadBarFill: { height: 6, borderRadius: 3 },
    loadPercent: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginTop: 4 },
});
