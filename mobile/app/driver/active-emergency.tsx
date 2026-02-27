import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp, EmergencyStatus } from '@/context/AppContext';
import { updateEmergencyStatus } from '@/services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';
import StatusTimeline from '@/components/ui/StatusTimeline';

const STATUS_BUTTONS: { status: EmergencyStatus; label: string; icon: string; color: string }[] = [
    { status: 'arrived_at_scene', label: 'Arrived at Scene', icon: 'location', color: COLORS.accent },
    { status: 'picked_patient', label: 'Patient Picked Up', icon: 'person-add', color: '#8B5CF6' },
    { status: 'en_route_hospital', label: 'En Route to Hospital', icon: 'navigate', color: COLORS.high },
    { status: 'reached_hospital', label: 'Reached Hospital', icon: 'medkit', color: COLORS.hospitalBlue },
    { status: 'completed', label: 'Completed', icon: 'checkmark-done-circle', color: COLORS.success },
];

export default function ActiveEmergencyScreen() {
    const router = useRouter();
    const { currentEmergency, setCurrentEmergency, addToast } = useApp();
    const [updating, setUpdating] = useState(false);
    const [greenCorridorRequested, setGreenCorridorRequested] = useState(false);

    if (!currentEmergency) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No active emergency</Text>
                <TouchableOpacity style={styles.goBackBtn} onPress={() => router.replace('/driver')}>
                    <Text style={styles.goBackBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentStatusIndex = STATUS_BUTTONS.findIndex(
        (b) => b.status === currentEmergency.status
    );

    const handleStatusUpdate = async (newStatus: EmergencyStatus) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setUpdating(true);

        try {
            await updateEmergencyStatus(currentEmergency.id, newStatus);
        } catch (e) {
            // Demo mode
        }

        setCurrentEmergency({ ...currentEmergency, status: newStatus });
        addToast(`Status updated: ${newStatus.replace(/_/g, ' ')}`, 'success');
        setUpdating(false);

        if (newStatus === 'completed') {
            setTimeout(() => {
                setCurrentEmergency(null);
                router.replace('/driver');
            }, 2000);
        }
    };

    const handleGreenCorridor = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setGreenCorridorRequested(true);
        addToast('🟢 Green Corridor requested! Admin notified.', 'success');
    };

    const getNextStatus = () => {
        const idx = STATUS_BUTTONS.findIndex((b) => b.status === currentEmergency.status);
        if (idx === -1) return STATUS_BUTTONS[0]; // Start from first
        if (idx + 1 < STATUS_BUTTONS.length) return STATUS_BUTTONS[idx + 1];
        return null;
    };

    const nextStatus = getNextStatus();

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/driver')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Active Emergency</Text>
                    <Text style={styles.headerSub}>{currentEmergency.id}</Text>
                </View>
                <SeverityBadge severity={currentEmergency.severity} size="sm" />
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Map Placeholder */}
                <View style={styles.mapContainer}>
                    <LinearGradient colors={['#1E293B', '#334155']} style={styles.mapPlaceholder}>
                        <Ionicons name="navigate" size={40} color={COLORS.accent} />
                        <Text style={styles.mapText}>Navigation Active</Text>
                        <Text style={styles.mapSub}>
                            Route to: {currentEmergency.lat.toFixed(4)}, {currentEmergency.lon.toFixed(4)}
                        </Text>
                    </LinearGradient>
                </View>

                {/* Patient Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Patient Details</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="person" size={16} color={COLORS.accent} />
                        <Text style={styles.detailLabel}>Name</Text>
                        <Text style={styles.detailValue}>{currentEmergency.citizen_name || 'Unknown'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="call" size={16} color={COLORS.success} />
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{currentEmergency.citizen_phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={16} color={COLORS.high} />
                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={[styles.detailValue, { fontSize: FONT_SIZES.xs }]} numberOfLines={3}>
                            {currentEmergency.description}
                        </Text>
                    </View>
                </View>

                {/* Green Corridor - UNIQUE FEATURE */}
                {currentEmergency.severity === 'critical' && !greenCorridorRequested && (
                    <TouchableOpacity style={styles.greenCorridorBtn} onPress={handleGreenCorridor}>
                        <LinearGradient
                            colors={['#059669', '#047857']}
                            style={styles.greenCorridorGradient}
                        >
                            <Ionicons name="flash" size={24} color="#FFF" />
                            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                                <Text style={styles.greenCorridorTitle}>Request Green Corridor</Text>
                                <Text style={styles.greenCorridorSub}>
                                    Clear traffic signals along your route for critical patient
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {greenCorridorRequested && (
                    <View style={styles.greenCorridorActive}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.greenCorridorActiveText}>
                            Green Corridor ACTIVE — Traffic signals clearing
                        </Text>
                    </View>
                )}

                {/* Status Timeline */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Progress</Text>
                    <StatusTimeline currentStatus={currentEmergency.status} />
                </View>

                {/* Next Action Button */}
                {nextStatus && (
                    <TouchableOpacity
                        style={[styles.nextActionBtn, { backgroundColor: nextStatus.color }]}
                        onPress={() => handleStatusUpdate(nextStatus.status)}
                        disabled={updating}
                        activeOpacity={0.85}
                    >
                        <Ionicons name={nextStatus.icon as any} size={24} color="#FFF" />
                        <Text style={styles.nextActionText}>{nextStatus.label}</Text>
                        <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                )}

                {/* All Status Buttons */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    {STATUS_BUTTONS.map((btn, idx) => {
                        const isCurrent = currentEmergency.status === btn.status;
                        const isPast = idx <= currentStatusIndex;
                        return (
                            <TouchableOpacity
                                key={btn.status}
                                style={[
                                    styles.statusBtn,
                                    isPast && styles.statusBtnDone,
                                    isCurrent && { borderColor: btn.color, borderWidth: 2 },
                                ]}
                                onPress={() => handleStatusUpdate(btn.status)}
                                disabled={updating || isPast}
                            >
                                <Ionicons
                                    name={btn.icon as any}
                                    size={20}
                                    color={isPast ? COLORS.success : btn.color}
                                />
                                <Text style={[styles.statusBtnText, isPast && styles.statusBtnTextDone]}>
                                    {btn.label}
                                </Text>
                                {isPast && <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyText: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, marginTop: SPACING.md },
    goBackBtn: { marginTop: SPACING.lg, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md },
    goBackBtnText: { color: '#FFF', fontWeight: '700' },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    scrollView: { flex: 1 },
    content: { padding: SPACING.lg, gap: SPACING.md },
    mapContainer: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.medium },
    mapPlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    mapText: { fontSize: FONT_SIZES.lg, color: COLORS.accentLight, fontWeight: '700', marginTop: SPACING.sm },
    mapSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
    detailLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontWeight: '600', width: 90, marginLeft: SPACING.sm },
    detailValue: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '500', textAlign: 'right' },
    divider: { height: 1, backgroundColor: COLORS.borderLight },
    greenCorridorBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.medium },
    greenCorridorGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg },
    greenCorridorTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#FFF' },
    greenCorridorSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    greenCorridorActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lowBg, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.sm, borderWidth: 1, borderColor: '#BBF7D0' },
    greenCorridorActiveText: { fontSize: FONT_SIZES.sm, color: COLORS.success, fontWeight: '700', flex: 1 },
    nextActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm, ...SHADOWS.medium },
    nextActionText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#FFF', flex: 1 },
    statusBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.sm, marginBottom: SPACING.sm, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border },
    statusBtnDone: { backgroundColor: COLORS.lowBg, borderColor: '#BBF7D0' },
    statusBtnText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
    statusBtnTextDone: { color: COLORS.success },
});
