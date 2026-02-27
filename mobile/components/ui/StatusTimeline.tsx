import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, STATUS_LABELS } from '@/constants/Theme';
import type { EmergencyStatus } from '@/context/AppContext';

interface StatusTimelineProps {
    currentStatus: EmergencyStatus;
}

const TIMELINE_STEPS: EmergencyStatus[] = [
    'pending',
    'assigned',
    'accepted',
    'arrived_at_scene',
    'picked_patient',
    'en_route_hospital',
    'reached_hospital',
    'completed',
];

// Using 'as any' to avoid complex Ionicons glyph type resolution
const STEP_ICONS: Record<string, string> = {
    pending: 'time-outline',
    assigned: 'car-outline',
    accepted: 'checkmark-circle-outline',
    arrived_at_scene: 'location-outline',
    picked_patient: 'person-outline',
    en_route_hospital: 'navigate-outline',
    reached_hospital: 'medkit-outline',
    completed: 'checkmark-done-outline',
};

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
    const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);

    return (
        <View style={styles.container}>
            {TIMELINE_STEPS.map((step, index) => {
                const isDone = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;
                const isLast = index === TIMELINE_STEPS.length - 1;

                return (
                    <View key={step} style={styles.stepRow}>
                        {/* Left column: circle + connector */}
                        <View style={styles.iconColumn}>
                            <View
                                style={[
                                    styles.iconCircle,
                                    isDone && styles.iconCircleDone,
                                    isCurrent && styles.iconCircleCurrent,
                                    isPending && styles.iconCirclePending,
                                ]}
                            >
                                <Ionicons
                                    name={STEP_ICONS[step] as any}
                                    size={16}
                                    color={isDone || isCurrent ? COLORS.white : COLORS.textMuted}
                                />
                            </View>
                            {!isLast && (
                                <View style={[styles.connector, isDone && styles.connectorDone]} />
                            )}
                        </View>

                        {/* Right column: label */}
                        <View style={styles.labelColumn}>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    isDone && styles.stepLabelDone,
                                    isCurrent && styles.stepLabelCurrent,
                                ]}
                            >
                                {STATUS_LABELS[step] ?? step.replace(/_/g, ' ')}
                            </Text>
                            {isCurrent && <Text style={styles.currentBadge}>● Current</Text>}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.sm,
    },
    stepRow: {
        flexDirection: 'row',
        minHeight: 52,
    },
    iconColumn: {
        alignItems: 'center',
        width: 40,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.borderLight,
    },
    iconCircleDone: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    iconCircleCurrent: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
        elevation: 4,
    },
    iconCirclePending: {
        backgroundColor: COLORS.surfaceElevated,
        borderColor: COLORS.border,
    },
    connector: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.border,
        marginVertical: 2,
    },
    connectorDone: {
        backgroundColor: COLORS.success,
    },
    labelColumn: {
        flex: 1,
        paddingLeft: SPACING.sm,
        paddingBottom: SPACING.md,
        justifyContent: 'center',
    },
    stepLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    stepLabelDone: {
        color: COLORS.textSecondary,
    },
    stepLabelCurrent: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: FONT_SIZES.md,
    },
    currentBadge: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.accent,
        fontWeight: '600',
        marginTop: 2,
    },
});
