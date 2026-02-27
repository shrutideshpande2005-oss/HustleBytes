import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { createEmergency } from '@/services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SEVERITY_OPTIONS = [
    { value: 'low', label: 'Low', icon: 'information-circle', color: COLORS.low, desc: 'Minor injury, no immediate danger' },
    { value: 'moderate', label: 'Moderate', icon: 'alert-circle', color: COLORS.moderate, desc: 'Needs attention within 30 min' },
    { value: 'high', label: 'High', icon: 'warning', color: COLORS.high, desc: 'Serious condition, urgent care needed' },
    { value: 'critical', label: 'Critical', icon: 'skull', color: COLORS.critical, desc: 'Life threatening, immediate response' },
];

export default function EmergencyForm() {
    const router = useRouter();
    const { userLocation, setCurrentEmergency, addToast } = useApp();
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('');
    const [age, setAge] = useState('');
    const [bloodGroup, setBloodGroup] = useState('Unknown');
    const [isRecording, setIsRecording] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleVoiceRecord = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsRecording(true);
        addToast('Listening... Speak now.', 'info');
        // Mock voice to text translation
        setTimeout(() => {
            setIsRecording(false);
            setDescription(prev => prev + (prev ? ' ' : '') + 'Car accident on main street, my chest hurts.');
            addToast('Audio transcribed.', 'success');
        }, 3000);
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            addToast('Please describe the emergency', 'warning');
            return;
        }
        if (!severity) {
            addToast('Please select severity level', 'warning');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSubmitting(true);

        try {
            const response = await createEmergency({
                description: description.trim(),
                lat: userLocation?.lat || 28.6139,
                lon: userLocation?.lon || 77.2090,
                severity,
            });

            setCurrentEmergency(response.data);
            addToast('Emergency reported! Help is on the way.', 'success');
            router.replace('/citizen/tracking');
        } catch (error: any) {
            // For demo: simulate a successful response
            const mockEmergency = {
                id: 'EMG-' + Date.now().toString().slice(-6),
                description: description.trim(),
                lat: userLocation?.lat || 28.6139,
                lon: userLocation?.lon || 77.2090,
                severity: severity as any,
                age: age ? parseInt(age) : 30,
                bloodGroup: bloodGroup,
                conditions: [],
                allergies: [],
                traumaIndex: severity === 'critical' ? 9.5 : (severity === 'high' ? 7.0 : 4.0),
                distance: 3.5,
                citizen_name: 'Rahul (Citizen App User)',
                status: 'assigned' as const,
                ambulance_id: 'AMB-' + Math.floor(Math.random() * 100).toString().padStart(3, '0'),
                hospital_id: 'HOSP-001',
                hospital_name: 'AIIMS Trauma Centre',
                eta: 480, // 8 minutes
                created_at: new Date().toISOString(),
            };
            setCurrentEmergency(mockEmergency);
            addToast('Emergency reported! Help is on the way.', 'success');
            router.replace('/citizen/tracking');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#DC2626', '#991B1B']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Report Emergency</Text>
                    <Text style={styles.headerSub}>
                        📍 Location: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}` : 'Detecting...'}
                    </Text>
                </View>
                <Ionicons name="location" size={24} color="#FCA5A5" />
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.form}>
                {/* Description & Voice Input */}
                <View style={[styles.headerRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={styles.label}>What's happening?</Text>
                    <TouchableOpacity
                        onPress={handleVoiceRecord}
                        style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
                    >
                        <Ionicons name={isRecording ? "mic" : "mic-outline"} size={16} color={isRecording ? "#FFF" : COLORS.accent} />
                        <Text style={[styles.voiceText, isRecording && { color: "#FFF" }]}>{isRecording ? 'Listening...' : 'Voice Triage'}</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.textArea}
                    placeholder="Describe the emergency situation in detail or tap Voice Triage..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />

                {/* Pre-Arrival Medical Tags (Fast) */}
                <Text style={styles.label}>Patient Fast Data (Optional)</Text>
                <View style={styles.fastDataGrid}>
                    <TextInput
                        style={styles.fastInput}
                        placeholder="Age"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="number-pad"
                        value={age}
                        onChangeText={setAge}
                    />
                    <View style={styles.bloodRadioBlock}>
                        {['A+', 'B+', 'O+', 'O-'].map(bg => (
                            <TouchableOpacity
                                key={bg}
                                style={[styles.bloodRadio, bloodGroup === bg && styles.bloodRadioActive]}
                                onPress={() => setBloodGroup(bg)}
                            >
                                <Text style={[styles.bloodRadioText, bloodGroup === bg && styles.bloodRadioTextActive]}>{bg}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Severity */}
                <Text style={styles.label}>Severity Level</Text>
                <View style={styles.severityGrid}>
                    {SEVERITY_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.severityCard,
                                severity === opt.value && {
                                    borderColor: opt.color,
                                    backgroundColor: opt.color + '10',
                                },
                            ]}
                            onPress={() => {
                                setSeverity(opt.value);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.severityIcon, { backgroundColor: opt.color + '20' }]}>
                                <Ionicons name={opt.icon as any} size={24} color={opt.color} />
                            </View>
                            <Text style={[styles.severityLabel, severity === opt.value && { color: opt.color }]}>
                                {opt.label}
                            </Text>
                            <Text style={styles.severityDesc}>{opt.desc}</Text>
                            {severity === opt.value && (
                                <View style={[styles.checkMark, { backgroundColor: opt.color }]}>
                                    <Ionicons name="checkmark" size={14} color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, (!description || !severity) && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting || !description || !severity}
                    activeOpacity={0.85}
                >
                    {submitting ? (
                        <LoadingSpinner size={24} color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="send" size={20} color="#FFF" />
                            <Text style={styles.submitText}>Send Emergency Alert</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* SMS Fallback - Unique Feature */}
                <TouchableOpacity style={styles.smsFallback}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.smsText}>No internet? Use SMS Fallback</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 20,
        paddingHorizontal: SPACING.lg,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: '#FFF',
    },
    headerSub: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: SPACING.lg,
    },
    label: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    textArea: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        minHeight: 120,
        ...SHADOWS.small,
    },
    severityGrid: {
        gap: SPACING.sm,
    },
    headerRow: { flexDirection: 'row' },
    voiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, gap: 4 },
    voiceBtnActive: { backgroundColor: COLORS.critical },
    voiceText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.accent },
    fastDataGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
    fastInput: { backgroundColor: COLORS.surface, flex: 0.3, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, textAlign: 'center' },
    bloodRadioBlock: { flex: 0.7, flexDirection: 'row', gap: 6, alignItems: 'center' },
    bloodRadio: { backgroundColor: COLORS.surface, flex: 1, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', paddingVertical: 10 },
    bloodRadioActive: { backgroundColor: COLORS.criticalBg, borderColor: COLORS.critical },
    bloodRadioText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted },
    bloodRadioTextActive: { color: COLORS.critical },
    severityCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    severityIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    severityLabel: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.textPrimary,
        width: 80,
    },
    severityDesc: {
        flex: 1,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    checkMark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.critical,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginTop: SPACING.xl,
        gap: SPACING.sm,
        ...SHADOWS.medium,
        shadowColor: COLORS.critical,
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: '#FFF',
    },
    smsFallback: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        marginTop: SPACING.md,
        gap: SPACING.xs,
    },
    smsText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});
