import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp, Emergency } from '@/context/AppContext';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { updateBedAvailability } from '@/services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, SEVERITY_COLORS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';
import ETACountdown from '@/components/ui/ETACountdown';

// Mock incoming patients
const MOCK_INCOMING: (Emergency & { eta: number })[] = [
    {
        id: 'EMG-001',
        description: 'Road accident victim, multiple fractures, internal bleeding suspected',
        lat: 28.6229, lon: 77.2195,
        severity: 'critical',
        status: 'en_route_hospital',
        ambulance_id: 'AMB-042',
        eta: 300,
        created_at: new Date().toISOString(),
        citizen_name: 'Rahul Sharma',
    },
    {
        id: 'EMG-003',
        description: 'Elderly collapse, possible cardiac event, conscious but weak',
        lat: 28.6315, lon: 77.2167,
        severity: 'high',
        status: 'picked_patient',
        ambulance_id: 'AMB-017',
        eta: 720,
        created_at: new Date().toISOString(),
        citizen_name: 'Priya Patel',
    },
];

export default function HospitalDashboard() {
    const router = useRouter();
    const { addToast } = useApp();
    const [incomingPatients, setIncomingPatients] = useState(MOCK_INCOMING);
    const [refreshing, setRefreshing] = useState(false);
    const [icuBeds, setIcuBeds] = useState('12');
    const [generalBeds, setGeneralBeds] = useState('45');
    const [totalIcu, setTotalIcu] = useState(20);
    const [totalGeneral, setTotalGeneral] = useState(100);
    const [editingBeds, setEditingBeds] = useState(false);

    // Hospital load score (unique feature)
    const loadScore = Math.round(
        ((1 - parseInt(icuBeds) / totalIcu) * 0.6 + (1 - parseInt(generalBeds) / totalGeneral) * 0.4) * 100
    );

    useEffect(() => {
        socketService.connect();

        socketService.on(SOCKET_EVENTS.INCOMING_PATIENT, (data: any) => {
            addToast('🚨 New incoming patient!', 'warning');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setIncomingPatients((prev) => [data, ...prev]);
        });

        return () => {
            socketService.off(SOCKET_EVENTS.INCOMING_PATIENT);
        };
    }, []);

    const handleAcceptPatient = (emergencyId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIncomingPatients((prev) =>
            prev.map((p) => (p.id === emergencyId ? { ...p, status: 'reached_hospital' as any } : p))
        );
        addToast(`Patient ${emergencyId} accepted & assigned bed`, 'success');
    };

    const handleUpdateBeds = async () => {
        try {
            await updateBedAvailability('HOSP-001', {
                icu_beds: parseInt(icuBeds),
                general_beds: parseInt(generalBeds),
            });
        } catch (e) { }
        setEditingBeds(false);
        addToast('Bed availability updated', 'success');
    };

    const getLoadColor = () => {
        if (loadScore > 80) return COLORS.critical;
        if (loadScore > 60) return COLORS.high;
        if (loadScore > 40) return COLORS.moderate;
        return COLORS.success;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#059669', '#047857']} style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Hospital Dashboard</Text>
                    <Text style={styles.headerSub}>AIIMS Trauma Centre</Text>
                </View>
                <View style={[styles.loadPill, { backgroundColor: getLoadColor() + '30' }]}>
                    <Text style={[styles.loadText, { color: getLoadColor() }]}>Load: {loadScore}%</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
            >
                {/* Bed Availability */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Bed Availability</Text>
                        <TouchableOpacity onPress={() => setEditingBeds(!editingBeds)}>
                            <Ionicons name={editingBeds ? 'close' : 'create-outline'} size={20} color={COLORS.accent} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bedGrid}>
                        {/* ICU */}
                        <View style={styles.bedCard}>
                            <View style={styles.bedIconContainer}>
                                <Ionicons name="pulse" size={24} color={COLORS.critical} />
                            </View>
                            <Text style={styles.bedType}>ICU Beds</Text>
                            {editingBeds ? (
                                <TextInput
                                    style={styles.bedInput}
                                    value={icuBeds}
                                    onChangeText={setIcuBeds}
                                    keyboardType="number-pad"
                                />
                            ) : (
                                <Text style={styles.bedCount}>
                                    <Text style={{ color: parseInt(icuBeds) < 5 ? COLORS.critical : COLORS.success }}>
                                        {icuBeds}
                                    </Text>
                                    /{totalIcu}
                                </Text>
                            )}
                            <View style={styles.bedBar}>
                                <View
                                    style={[
                                        styles.bedBarFill,
                                        {
                                            width: `${(parseInt(icuBeds) / totalIcu) * 100}%`,
                                            backgroundColor: parseInt(icuBeds) < 5 ? COLORS.critical : COLORS.success,
                                        },
                                    ]}
                                />
                            </View>
                        </View>

                        {/* General */}
                        <View style={styles.bedCard}>
                            <View style={[styles.bedIconContainer, { backgroundColor: COLORS.accent + '15' }]}>
                                <Ionicons name="bed-outline" size={24} color={COLORS.accent} />
                            </View>
                            <Text style={styles.bedType}>General Beds</Text>
                            {editingBeds ? (
                                <TextInput
                                    style={styles.bedInput}
                                    value={generalBeds}
                                    onChangeText={setGeneralBeds}
                                    keyboardType="number-pad"
                                />
                            ) : (
                                <Text style={styles.bedCount}>
                                    <Text style={{ color: parseInt(generalBeds) < 10 ? COLORS.high : COLORS.success }}>
                                        {generalBeds}
                                    </Text>
                                    /{totalGeneral}
                                </Text>
                            )}
                            <View style={styles.bedBar}>
                                <View
                                    style={[
                                        styles.bedBarFill,
                                        {
                                            width: `${(parseInt(generalBeds) / totalGeneral) * 100}%`,
                                            backgroundColor: parseInt(generalBeds) < 10 ? COLORS.high : COLORS.success,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {editingBeds && (
                        <TouchableOpacity style={styles.saveBedBtn} onPress={handleUpdateBeds}>
                            <Text style={styles.saveBedBtnText}>Save Changes</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Incoming Patients */}
                <Text style={styles.incomingTitle}>
                    Incoming Patients ({incomingPatients.length})
                </Text>

                {incomingPatients.map((patient) => (
                    <View key={patient.id} style={[styles.patientCard, patient.severity === 'critical' && styles.criticalPatient]}>
                        <View style={styles.patientHeader}>
                            <SeverityBadge severity={patient.severity} />
                            <Text style={styles.patientId}>{patient.id}</Text>
                        </View>

                        <Text style={styles.patientName}>
                            👤 {patient.citizen_name || 'Unknown'}
                        </Text>

                        <Text style={styles.patientDesc} numberOfLines={2}>
                            {patient.description}
                        </Text>

                        <View style={styles.patientMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="car-sport" size={14} color={COLORS.accent} />
                                <Text style={styles.metaText}>{patient.ambulance_id}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="timer" size={14} color={COLORS.high} />
                                <Text style={styles.metaText}>ETA: {Math.ceil(patient.eta / 60)} min</Text>
                            </View>
                        </View>

                        {patient.status !== 'reached_hospital' ? (
                            <TouchableOpacity
                                style={styles.acceptPatientBtn}
                                onPress={() => handleAcceptPatient(patient.id)}
                            >
                                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                                <Text style={styles.acceptPatientText}>Accept & Prepare</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.acceptedBadge}>
                                <Ionicons name="checkmark" size={16} color={COLORS.success} />
                                <Text style={styles.acceptedText}>Accepted — Bed Assigned</Text>
                            </View>
                        )}
                    </View>
                ))}

                {incomingPatients.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No incoming patients</Text>
                    </View>
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
    loadPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
    loadText: { fontSize: FONT_SIZES.xs, fontWeight: '800' },
    scrollView: { flex: 1 },
    content: { padding: SPACING.lg, gap: SPACING.md },
    card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
    bedGrid: { flexDirection: 'row', gap: SPACING.md },
    bedCard: { flex: 1, backgroundColor: COLORS.surfaceElevated, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center' },
    bedIconContainer: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.criticalBg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
    bedType: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    bedCount: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary },
    bedInput: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.accent, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.accent, width: 60, padding: 4 },
    bedBar: { width: '100%', height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2, marginTop: SPACING.sm },
    bedBarFill: { height: 4, borderRadius: 2 },
    saveBedBtn: { marginTop: SPACING.md, backgroundColor: COLORS.success, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
    saveBedBtnText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZES.sm },
    incomingTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.sm },
    patientCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
    criticalPatient: { borderColor: COLORS.critical, borderWidth: 2 },
    patientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    patientId: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
    patientName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
    patientDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
    patientMeta: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.md },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
    acceptPatientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, backgroundColor: COLORS.success, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
    acceptPatientText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZES.sm },
    acceptedBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.lowBg, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, justifyContent: 'center' },
    acceptedText: { color: COLORS.success, fontWeight: '700', fontSize: FONT_SIZES.sm },
    emptyState: { alignItems: 'center', padding: SPACING.xxl },
    emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginTop: SPACING.sm },
});
