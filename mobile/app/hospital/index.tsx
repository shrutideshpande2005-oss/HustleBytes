import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    RefreshControl,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import SeverityBadge from '@/components/ui/SeverityBadge';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PatientStatus = 'en_route_hospital' | 'accepted' | 'reached_hospital' | 'treatment_initiated' | 'completed';

interface IncomingPatient {
    id: string;
    description: string;
    severity: 'critical' | 'high' | 'moderate' | 'low';
    status: PatientStatus;
    ambulance_id: string;
    eta: number; // seconds
    citizen_name: string;
    bloodGroup: string;
    conditions: string[];
    allergies: string[];
    age: number;
    traumaIndex: number; // 0-10
    distance: number; // km
    reservationExpiresAt?: number | null; // ms timestamp
}

// -------------------------
// MOCK DATA
// -------------------------
const INITIAL_PATIENTS: IncomingPatient[] = [
    {
        id: 'EMG-001',
        description: 'Road accident victim, multiple fractures, internal bleeding suspected',
        severity: 'critical',
        status: 'en_route_hospital',
        ambulance_id: 'AMB-042',
        eta: 450,
        citizen_name: 'Rahul Sharma',
        bloodGroup: 'O+',
        conditions: ['None'],
        allergies: ['Penicillin'],
        age: 34,
        traumaIndex: 8.5,
        distance: 4.2
    },
    {
        id: 'EMG-003',
        description: 'Elderly collapse, possible cardiac event, conscious but weak',
        severity: 'high',
        status: 'en_route_hospital',
        ambulance_id: 'AMB-017',
        eta: 720,
        citizen_name: 'Priya Patel',
        bloodGroup: 'A-',
        conditions: ['Hypertension', 'Diabetes'],
        allergies: ['None'],
        age: 68,
        traumaIndex: 4.0,
        distance: 7.1
    },
];

const NEARBY_HOSPITALS = [
    { id: 'H1', name: 'Safdarjung Hospital', icuBeds: 2, load: 88, distance: 3.5, accepting: true },
    { id: 'H2', name: 'Fortis Escorts', icuBeds: 0, load: 95, distance: 5.1, accepting: false },
    { id: 'H3', name: 'Max Super Speciality', icuBeds: 5, load: 72, distance: 8.2, accepting: true },
];

// -------------------------
// ENGINE FUNCTIONS
// -------------------------
function calculatePriority(patient: IncomingPatient): number {
    let score = 30;
    if (patient.severity === 'critical') score += 40;
    if (patient.severity === 'high') score += 25;
    if (patient.age > 65 || patient.age < 5) score += 10;
    if (patient.traumaIndex > 7) score += 15;
    return Math.min(100, Math.round(score));
}

function getPriorityColor(score: number): string {
    if (score >= 90) return COLORS.critical || '#DC2626';
    if (score >= 70) return COLORS.high || '#F59E0B';
    if (score >= 50) return COLORS.moderate || '#FCD34D';
    return COLORS.success || '#10B981';
}

function predictLoad(currentLoad: number, incomingCount: number, avgArrivalRate: number): number {
    const projected = currentLoad + (incomingCount * 5) + (avgArrivalRate * 2);
    return Math.min(100, Math.round(projected));
}

function evaluateHospitalCapacity(
    emergency: IncomingPatient,
    hospitalData: { icuTotal: number; icuAvailable: number; load: number; isSurgeMode: boolean }
) {
    const priority = calculatePriority(emergency);

    if (hospitalData.isSurgeMode) {
        if (emergency.severity !== 'critical' && priority < 80) {
            return {
                accept: false,
                reason: 'Surge Mode Active: Only Critical Cases Accpected.',
                alternativeHospital: 'Safdarjung Hospital'
            };
        }
    }

    const reqUnit = emergency.traumaIndex > 7 ? 'Trauma ICU' : 'General ICU';
    if (emergency.severity === 'critical' || emergency.severity === 'high') {
        if (hospitalData.icuAvailable <= 0) {
            return {
                accept: false,
                reason: 'No ICU beds available.',
                alternativeHospital: 'Fortis Escorts'
            };
        }
    }

    if (hospitalData.load > 95) {
        return {
            accept: false,
            reason: 'Hospital CRITICAL Overload.',
            alternativeHospital: 'Safdarjung Hospital'
        };
    }

    return { accept: true, assignedUnit: reqUnit, reason: 'Capacity Available & Evaluated.' };
}

// -------------------------
// MAIN COMPONENT
// -------------------------
export default function HospitalIntelligenceDashboard() {
    const router = useRouter();
    const { addToast } = useApp();

    const [refreshing, setRefreshing] = useState(false);
    const [surgeMode, setSurgeMode] = useState(false);

    // Bed Stats
    const totalIcuBeds = 20;
    const [icuAvailable, setIcuAvailable] = useState(4);
    const totalGeneralBeds = 100;
    const [generalAvailable, setGeneralAvailable] = useState(45);

    const [incomingPatients, setIncomingPatients] = useState<IncomingPatient[]>(INITIAL_PATIENTS);
    const [now, setNow] = useState(Date.now());

    // Analytics Calculation
    const currentOccupancy = Math.round(
        ((totalIcuBeds - icuAvailable) + (totalGeneralBeds - generalAvailable)) / (totalIcuBeds + totalGeneralBeds) * 100
    );
    const projectedOccupancy = predictLoad(currentOccupancy, incomingPatients.length, 1.5);

    // Tick for timers
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleSurgeMode = (val: boolean) => {
        setSurgeMode(val);
        Haptics.notificationAsync(
            val ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
        );
        addToast(val ? 'SURGE MODE ACTIVATED' : 'Surge Mode Deactivated', val ? 'warning' : 'success');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const handleAcceptPatient = (patient: IncomingPatient) => {
        const evaluation = evaluateHospitalCapacity(patient, {
            icuTotal: totalIcuBeds,
            icuAvailable,
            load: currentOccupancy,
            isSurgeMode: surgeMode
        });

        if (!evaluation.accept) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            addToast(`Rejected: ${evaluation.reason} Redirecting to ${evaluation.alternativeHospital}`, 'error');
            setIncomingPatients(prev => prev.filter(p => p.id !== patient.id));
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        addToast(`Accepted: Auto-assigned to ${evaluation.assignedUnit}`, 'success');

        if (evaluation.assignedUnit?.includes('ICU')) {
            setIcuAvailable(prev => Math.max(0, prev - 1));
        } else {
            setGeneralAvailable(prev => Math.max(0, prev - 1));
        }

        // Reserve for 10 minutes
        const reserveTime = Date.now() + (10 * 60 * 1000);

        setIncomingPatients(prev => prev.map(p =>
            p.id === patient.id ? { ...p, status: 'accepted', reservationExpiresAt: reserveTime } : p
        ));
    };

    const handleReleaseReservation = (patient: IncomingPatient) => {
        addToast(`Bed Reservation Released for ${patient.id}`, 'warning');
        setIcuAvailable(prev => prev + 1);
        setIncomingPatients(prev => prev.filter(p => p.id !== patient.id));
    };

    // Rendering smaller views
    const renderLoadAnalytics = () => {
        const isCritical = projectedOccupancy > 90;
        return (
            <View style={[styles.card, surgeMode && styles.cardSurge]}>
                <Text style={styles.sectionTitle}>Live Load Analytics</Text>
                <View style={styles.loadGrid}>
                    <View style={styles.loadItem}>
                        <Text style={styles.loadLabel}>Current</Text>
                        <Text style={[styles.loadValue, { color: currentOccupancy > 80 ? COLORS.critical : COLORS.success }]}>{currentOccupancy}%</Text>
                    </View>
                    <View style={styles.loadItem}>
                        <Text style={styles.loadLabel}>ICU Usage</Text>
                        <Text style={[styles.loadValue, { color: COLORS.high }]}>{Math.round((totalIcuBeds - icuAvailable) / totalIcuBeds * 100)}%</Text>
                    </View>
                    <View style={styles.loadItem}>
                        <Text style={styles.loadLabel}>Projected 30m</Text>
                        <Text style={[styles.loadValue, { color: isCritical ? COLORS.critical : COLORS.warning }]}>{projectedOccupancy}%</Text>
                    </View>
                </View>
                {isCritical && (
                    <View style={styles.alertBanner}>
                        <Ionicons name="warning" size={16} color={COLORS.critical} />
                        <Text style={styles.alertText}>Critical Overload Risk Detected</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderBedReservationState = (patient: IncomingPatient) => {
        if (!patient.reservationExpiresAt) return null;

        const timeLeft = patient.reservationExpiresAt - now;
        const isExpired = timeLeft <= 0;
        const isExpiringSoon = timeLeft < 3 * 60 * 1000 && !isExpired;

        const minutes = Math.floor(Math.abs(timeLeft) / 60000);
        const seconds = Math.floor((Math.abs(timeLeft) % 60000) / 1000);

        if (isExpired) {
            return (
                <View style={[styles.timerBadge, { backgroundColor: COLORS.criticalBg, borderColor: COLORS.critical }]}>
                    <Ionicons name="time" size={16} color={COLORS.critical} />
                    <Text style={[styles.timerText, { color: COLORS.critical }]}>Reservation Expired - Re-evaluation Req</Text>
                    <TouchableOpacity onPress={() => handleReleaseReservation(patient)} style={{ marginLeft: 8 }}>
                        <Text style={{ color: COLORS.critical, fontWeight: 'bold' }}>RELEASE</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={[styles.timerBadge, { backgroundColor: isExpiringSoon ? COLORS.warning + '20' : COLORS.success + '20' }]}>
                <Ionicons name="time" size={16} color={isExpiringSoon ? COLORS.warning : COLORS.success} />
                <Text style={[styles.timerText, { color: isExpiringSoon ? COLORS.warning : COLORS.success }]}>
                    Bed Reserved: {minutes}:{seconds.toString().padStart(2, '0')}
                </Text>
            </View>
        );
    };

    const renderRegionalHeatmap = () => {
        return (
            <View style={styles.card}>
                <View style={styles.heatmapHeader}>
                    <Text style={styles.sectionTitle}>Regional Emergency Heatmap</Text>
                    <View style={styles.stressBadge}>
                        <Text style={styles.stressText}>Stress Level: HIGH</Text>
                    </View>
                </View>

                <View style={styles.heatmapGrid}>
                    <View style={styles.heatmapItem}>
                        <Text style={styles.heatmapValue}>12</Text>
                        <Text style={styles.heatmapLabel}>Emergencies</Text>
                    </View>
                    <View style={styles.heatmapItem}>
                        <Text style={styles.heatmapValue}>4</Text>
                        <Text style={styles.heatmapLabel}>Active Ambulances</Text>
                    </View>
                    <View style={styles.heatmapItem}>
                        <Text style={styles.heatmapValue}>11m</Text>
                        <Text style={styles.heatmapLabel}>Avg Response Time</Text>
                    </View>
                </View>

                {/* Severity Distribution */}
                <View style={styles.severityDistContainer}>
                    <View style={styles.severityBar}>
                        <View style={[styles.sevFill, { flex: 2, backgroundColor: COLORS.critical }]} />
                        <View style={[styles.sevFill, { flex: 4, backgroundColor: COLORS.high }]} />
                        <View style={[styles.sevFill, { flex: 4, backgroundColor: COLORS.moderate }]} />
                        <View style={[styles.sevFill, { flex: 2, backgroundColor: COLORS.low || '#3B82F6' }]} />
                    </View>
                    <View style={styles.sevLabels}>
                        <Text style={[styles.sevLabelText, { color: COLORS.critical }]}>Crit(2)</Text>
                        <Text style={[styles.sevLabelText, { color: COLORS.high }]}>High(4)</Text>
                        <Text style={[styles.sevLabelText, { color: COLORS.moderate }]}>Mod(4)</Text>
                        <Text style={[styles.sevLabelText, { color: COLORS.low || '#3B82F6' }]}>Low(2)</Text>
                    </View>
                </View>
            </View>
        );
    };

    const INTEROP_STEPS = [
        { key: 'gps', label: 'Ambulance GPS Connected' },
        { key: 'ack', label: 'Hospital Acknowledged' },
        { key: 'bed', label: 'Bed Locked' },
        { key: 'ot', label: 'OT Ready' },
        { key: 'blood', label: 'Blood Bank Confirmed' },
        { key: 'closed', label: 'Case Closed' }
    ];

    const renderInteropStatus = (patient: IncomingPatient) => {
        let activeStep = 0;
        if (patient.status === 'en_route_hospital') activeStep = 1;
        if (patient.status === 'accepted') activeStep = 3;
        if (patient.status === 'treatment_initiated') activeStep = 4;
        if (patient.status === 'completed') activeStep = 6;

        return (
            <View style={styles.interopBoard}>
                <Text style={styles.interopTitle}>Live Coordination Status</Text>
                {INTEROP_STEPS.map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isActive = index === activeStep;
                    const color = isCompleted ? COLORS.success : isActive ? COLORS.accent : COLORS.border;
                    return (
                        <View key={step.key} style={styles.interopStepRow}>
                            <View style={styles.interopLines}>
                                <View style={[styles.interopDot, { backgroundColor: color, borderColor: isActive ? COLORS.accent : 'transparent', borderWidth: isActive ? 2 : 0 }]} />
                                {index < INTEROP_STEPS.length - 1 && (
                                    <View style={[styles.interopLineVertical, { backgroundColor: isCompleted ? COLORS.success : COLORS.border }]} />
                                )}
                            </View>
                            <View style={styles.interopContent}>
                                <Text style={[styles.interopStepLabel, { color: isCompleted || isActive ? COLORS.textPrimary : COLORS.textMuted }]}>{step.label}</Text>
                                {(isCompleted || isActive) && <Text style={styles.interopTimestamp}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Intelligent Header */}
            <LinearGradient colors={surgeMode ? ['#991B1B', '#7F1D1D'] : ['#059669', '#047857']} style={styles.header}>
                <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Command Center</Text>
                    <Text style={styles.headerSub}>AIIMS Intelligence System</Text>
                </View>
                <View style={styles.surgeToggleContainer}>
                    <Text style={styles.surgeToggleText}>SURGE</Text>
                    <Switch
                        value={surgeMode}
                        onValueChange={toggleSurgeMode}
                        trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#DC2626' }}
                        thumbColor="#FFF"
                    />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { }} />}
            >
                {surgeMode && (
                    <View style={styles.surgeBanner}>
                        <Ionicons name="alert-circle" size={24} color="#FFF" />
                        <Text style={styles.surgeBannerText}>DISASTER PREPAREDNESS MODE ON</Text>
                    </View>
                )}

                {/* Live Load Analytics */}
                {renderLoadAnalytics()}

                {/* Regional Heatmap Summary */}
                {renderRegionalHeatmap()}

                {/* Patient Case Stream */}
                <Text style={styles.sectionHeading}>Active Cases ({incomingPatients.length})</Text>

                {incomingPatients.map((patient) => {
                    const pScore = calculatePriority(patient);
                    const pColor = getPriorityColor(pScore);

                    return (
                        <View key={patient.id} style={[styles.patientCard, { borderLeftColor: pColor, borderLeftWidth: 4 }]}>
                            {/* Pre-Arrival Triage Header */}
                            <View style={styles.patientHeader}>
                                <View>
                                    <Text style={styles.patientName}>{patient.citizen_name}</Text>
                                    <Text style={styles.patientId}>{patient.id} • {patient.age} Yrs</Text>
                                </View>
                                <View style={[styles.triageScoreBadge, { backgroundColor: pColor }]}>
                                    <Text style={styles.triageScoreText}>{pScore}</Text>
                                    <Text style={styles.triageScoreLabel}>PRIORITY</Text>
                                </View>
                            </View>

                            {/* Medical Data Panel */}
                            <View style={styles.medicalDataGrid}>
                                <View style={styles.medDataBox}>
                                    <Ionicons name="water" size={14} color={COLORS.critical} />
                                    <Text style={styles.medDataLabel}>{patient.bloodGroup}</Text>
                                </View>
                                <View style={styles.medDataBox}>
                                    <Ionicons name="warning" size={14} color={COLORS.high} />
                                    <Text style={styles.medDataLabel}>TI: {patient.traumaIndex}/10</Text>
                                </View>
                                <View style={styles.medDataBox}>
                                    <Ionicons name="medical" size={14} color={COLORS.primary} />
                                    <Text style={styles.medDataLabel} numberOfLines={1}>{patient.conditions[0] || 'None'}</Text>
                                </View>
                            </View>

                            <Text style={styles.patientDesc}>{patient.description}</Text>

                            {/* Tracking & ETA */}
                            <View style={styles.etaRow}>
                                <Ionicons name="locate" size={16} color={COLORS.accent} />
                                <Text style={styles.etaText}>Ambulance {patient.ambulance_id} • {patient.distance}km away</Text>
                                <View style={{ flex: 1 }} />
                                <Text style={styles.liveEta}>ETA: {Math.ceil(patient.eta / 60)} min</Text>
                            </View>

                            {/* Interoperability Progress */}
                            {patient.status === 'accepted' && renderInteropStatus(patient)}

                            {/* Actions / Timer */}
                            <View style={styles.actionSection}>
                                {patient.status === 'en_route_hospital' ? (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                                        onPress={() => handleAcceptPatient(patient)}
                                    >
                                        <Ionicons name="flash" size={18} color="#FFF" />
                                        <Text style={styles.actionBtnText}>Auto-Allocate & Accept</Text>
                                    </TouchableOpacity>
                                ) : (
                                    renderBedReservationState(patient)
                                )}
                            </View>
                        </View>
                    );
                })}

                {/* Cross Hospital Network Visibility */}
                <Text style={[styles.sectionHeading, { marginTop: SPACING.lg }]}>Nearby Network Visibility</Text>
                {NEARBY_HOSPITALS.map(hosp => (
                    <View key={hosp.id} style={styles.networkCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.networkName}>{hosp.name}</Text>
                            <Text style={styles.networkStats}>{hosp.distance} km away • Load: {hosp.load}% • ICU: {hosp.icuBeds}</Text>
                        </View>
                        {hosp.accepting ? (
                            <TouchableOpacity style={styles.transferBtn}>
                                <Text style={styles.transferText}>Transfer</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.fullBadge}>
                                <Text style={styles.fullText}>FULL</Text>
                            </View>
                        )}
                    </View>
                ))}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
    headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)' },
    surgeToggleContainer: { alignItems: 'center', marginLeft: 10 },
    surgeToggleText: { fontSize: 10, color: '#FFF', fontWeight: 'bold', marginBottom: 2 },
    surgeBanner: { backgroundColor: COLORS.critical, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: SPACING.md },
    surgeBannerText: { color: '#FFF', fontWeight: '800', fontSize: FONT_SIZES.sm },
    scrollView: { flex: 1 },
    content: { padding: SPACING.lg, paddingBottom: 80 },
    sectionHeading: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
    card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.small },
    cardSurge: { borderColor: COLORS.critical, borderWidth: 1 },
    sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.md },
    loadGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    loadItem: { alignItems: 'center' },
    loadLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 4 },
    loadValue: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
    alertBanner: { backgroundColor: COLORS.criticalBg, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.md },
    alertText: { color: COLORS.critical, fontWeight: '700', fontSize: FONT_SIZES.xs },

    patientCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.small },
    patientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
    patientName: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
    patientId: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
    triageScoreBadge: { alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.sm, width: 50, height: 50 },
    triageScoreText: { color: '#FFF', fontWeight: '900', fontSize: 20 },
    triageScoreLabel: { color: '#FFF', fontSize: 8, fontWeight: '700' },

    medicalDataGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
    medDataBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm, flex: 1, justifyContent: 'center' },
    medDataLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },

    patientDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 20 },
    etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.lowBg, padding: 8, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.md },
    etaText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.accent },
    liveEta: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.critical },

    progressTimeline: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
    progressDot: { width: 12, height: 12, borderRadius: 6 },
    progressLine: { flex: 1, height: 3 },
    progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: '700', marginLeft: SPACING.sm },

    actionSection: { marginTop: SPACING.xs },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: BORDER_RADIUS.md, gap: 8 },
    actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: FONT_SIZES.sm },

    timerBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: 'transparent' },
    timerText: { fontWeight: '700', fontSize: FONT_SIZES.sm, marginLeft: 6 },

    networkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, ...SHADOWS.small },
    networkName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
    networkStats: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
    transferBtn: { backgroundColor: COLORS.accent + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm },
    transferText: { color: COLORS.accent, fontWeight: '800', fontSize: FONT_SIZES.xs },
    fullBadge: { backgroundColor: COLORS.criticalBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm },
    fullText: { color: COLORS.critical, fontWeight: '800', fontSize: FONT_SIZES.xs },

    // Heatmap Styles
    heatmapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    stressBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.high + '20' },
    stressText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.high },
    heatmapGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
    heatmapItem: { alignItems: 'center' },
    heatmapValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
    heatmapLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
    severityDistContainer: { marginTop: SPACING.xs },
    severityBar: { flexDirection: 'row', height: 12, borderRadius: BORDER_RADIUS.sm, overflow: 'hidden', gap: 2, marginBottom: 6 },
    sevFill: { height: '100%' },
    sevLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    sevLabelText: { fontSize: 10, fontWeight: '700' },

    // Interoperability Board Styles
    interopBoard: { marginVertical: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
    interopTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
    interopStepRow: { flexDirection: 'row', minHeight: 40 },
    interopLines: { width: 24, alignItems: 'center' },
    interopDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
    interopLineVertical: { width: 2, flex: 1, marginVertical: 2 },
    interopContent: { flex: 1, paddingBottom: SPACING.md, paddingLeft: SPACING.xs, flexDirection: 'row', justifyContent: 'space-between' },
    interopStepLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
    interopTimestamp: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
});
