import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, SEVERITY_COLORS } from '@/constants/Theme';
import MapView, { Marker } from 'react-native-maps';
import StatusTimeline from '@/components/ui/StatusTimeline';
import ETACountdown from '@/components/ui/ETACountdown';
import SeverityBadge from '@/components/ui/SeverityBadge';
import type { EmergencyStatus } from '@/context/AppContext';

export default function TrackingScreen() {
    const router = useRouter();
    const { currentEmergency, setCurrentEmergency, addToast } = useApp();
    const [ambulanceLoc, setAmbulanceLoc] = useState<{ lat: number; lon: number } | null>(null);

    useEffect(() => {
        socketService.connect();

        socketService.on(SOCKET_EVENTS.EMERGENCY_STATUS, (data: any) => {
            if (currentEmergency && data.emergency_id === currentEmergency.id) {
                setCurrentEmergency({ ...currentEmergency, status: data.status });
                addToast(`Status updated: ${data.status.replace(/_/g, ' ')}`, 'info');
            }
        });

        socketService.on(SOCKET_EVENTS.LOCATION_UPDATE, (data: any) => {
            if (currentEmergency && data.ambulance_id === currentEmergency.ambulance_id) {
                setAmbulanceLoc({ lat: data.lat, lon: data.lon });
            }
        });

        return () => {
            socketService.off(SOCKET_EVENTS.EMERGENCY_STATUS);
            socketService.off(SOCKET_EVENTS.LOCATION_UPDATE);
        };
    }, [currentEmergency]);

    // Simulate status progression for demo
    useEffect(() => {
        if (!currentEmergency) return;

        const statuses: EmergencyStatus[] = [
            'assigned',
            'accepted',
            'arrived_at_scene',
            'picked_patient',
            'en_route_hospital',
            'reached_hospital',
            'completed',
        ];

        let currentIndex = statuses.indexOf(currentEmergency.status);

        const interval = setInterval(() => {
            currentIndex++;
            if (currentIndex < statuses.length) {
                const newStatus = statuses[currentIndex];
                setCurrentEmergency({ ...currentEmergency, status: newStatus });
                addToast(`Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}`, 'info');
            } else {
                clearInterval(interval);
            }
        }, 15000); // Every 15 seconds for demo

        return () => clearInterval(interval);
    }, []);

    if (!currentEmergency) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No active emergency</Text>
                <TouchableOpacity
                    style={styles.backHomeBtn}
                    onPress={() => router.replace('/citizen')}
                >
                    <Text style={styles.backHomeBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const severityColors = SEVERITY_COLORS[currentEmergency.severity] || SEVERITY_COLORS.low;

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Emergency Tracking</Text>
                    <Text style={styles.headerSub}>ID: {currentEmergency.id}</Text>
                </View>
                <SeverityBadge severity={currentEmergency.severity} size="sm" />
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Real-Time Live Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.mapFrame}
                        showsUserLocation={true}
                        initialRegion={{
                            latitude: currentEmergency.lat,
                            longitude: currentEmergency.lon,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        {/* Citizen Marker */}
                        <Marker
                            coordinate={{ latitude: currentEmergency.lat, longitude: currentEmergency.lon }}
                            title="Your Location"
                            pinColor={COLORS.accent}
                        />

                        {/* Live Ambulance Marker */}
                        {ambulanceLoc && (
                            <Marker
                                coordinate={{ latitude: ambulanceLoc.lat, longitude: ambulanceLoc.lon }}
                                title={`Ambulance ${currentEmergency.ambulance_id || ''}`}
                                pinColor={COLORS.ambulanceYellow || '#F59E0B'}
                            >
                                <View style={styles.ambulanceCarBadge}>
                                    <Ionicons name="medical" size={14} color="#FFF" />
                                </View>
                            </Marker>
                        )}

                        {/* Destination Hospital Marker (Mocked to static for now) */}
                        {currentEmergency.hospital_name && (
                            <Marker
                                coordinate={{ latitude: 28.6139, longitude: 77.2090 }} // Mock AIIMS coords
                                title={currentEmergency.hospital_name}
                                pinColor={COLORS.success}
                            />
                        )}
                    </MapView>
                </View>

                {/* ETA */}
                {currentEmergency.eta && currentEmergency.status !== 'completed' && (
                    <ETACountdown etaSeconds={currentEmergency.eta} />
                )}

                {/* Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Emergency Details</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={styles.detailValue}>{currentEmergency.description}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="car-sport-outline" size={18} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Ambulance</Text>
                        <Text style={styles.detailValue}>{currentEmergency.ambulance_id || 'Assigning...'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="medkit-outline" size={18} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Hospital</Text>
                        <Text style={styles.detailValue}>{currentEmergency.hospital_name || 'Calculating best...'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>
                            {currentEmergency.lat.toFixed(4)}, {currentEmergency.lon.toFixed(4)}
                        </Text>
                    </View>
                </View>

                {/* Status Timeline */}
                <View style={styles.timelineCard}>
                    <Text style={styles.sectionTitle}>Progress</Text>
                    <StatusTimeline currentStatus={currentEmergency.status} />
                </View>

                {/* Completed State */}
                {currentEmergency.status === 'completed' && (
                    <View style={styles.completedCard}>
                        <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                        <Text style={styles.completedTitle}>Emergency Resolved</Text>
                        <Text style={styles.completedSub}>You have been safely transported.</Text>
                        <TouchableOpacity
                            style={styles.returnBtn}
                            onPress={() => {
                                setCurrentEmergency(null);
                                router.replace('/');
                            }}
                        >
                            <Text style={styles.returnBtnText}>Return Home</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyText: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, marginTop: SPACING.md },
    backHomeBtn: { marginTop: SPACING.lg, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md },
    backHomeBtnText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZES.md },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    scrollView: { flex: 1 },
    content: { padding: SPACING.lg, gap: SPACING.md },
    mapContainer: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', height: 250, ...SHADOWS.medium },
    mapFrame: { width: '100%', height: '100%' },
    ambulanceCarBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.ambulanceYellow || '#F59E0B', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    mapPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    mapText: { fontSize: FONT_SIZES.md, color: COLORS.accentLight, fontWeight: '600', marginTop: SPACING.sm },
    mapMarkers: { marginTop: SPACING.md, gap: SPACING.xs },
    markerRow: { flexDirection: 'row', alignItems: 'center' },
    markerDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
    markerLabel: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)' },
    detailsCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
    detailLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontWeight: '600', width: 90, marginLeft: SPACING.sm },
    detailValue: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '500', textAlign: 'right' },
    divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.xs },
    timelineCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    completedCard: { backgroundColor: COLORS.lowBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
    completedTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.success, marginTop: SPACING.md },
    completedSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
    returnBtn: { marginTop: SPACING.lg, backgroundColor: COLORS.success, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md },
    returnBtnText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZES.md },
});
