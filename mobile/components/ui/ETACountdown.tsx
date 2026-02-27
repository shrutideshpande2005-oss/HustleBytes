import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/Theme';

interface ETACountdownProps {
    etaSeconds: number;
    label?: string;
}

export default function ETACountdown({ etaSeconds, label = 'Estimated Arrival' }: ETACountdownProps) {
    const [remaining, setRemaining] = useState(etaSeconds);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setRemaining(etaSeconds);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [etaSeconds]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const isUrgent = remaining < 120;

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <View style={[styles.container, isUrgent && styles.containerUrgent]}>
            <View style={styles.iconRow}>
                <Ionicons
                    name="timer-outline"
                    size={20}
                    color={isUrgent ? COLORS.critical : COLORS.accent}
                />
                <Text style={[styles.label, isUrgent && styles.labelUrgent]}>{label}</Text>
            </View>

            <View style={styles.timeRow}>
                <View style={[styles.timeBox, isUrgent && styles.timeBoxUrgent]}>
                    <Text style={[styles.timeValue, isUrgent && styles.timeValueUrgent]}>
                        {pad(minutes)}
                    </Text>
                    <Text style={styles.timeUnit}>min</Text>
                </View>

                <Text style={[styles.colon, isUrgent && styles.colonUrgent]}>:</Text>

                <View style={[styles.timeBox, isUrgent && styles.timeBoxUrgent]}>
                    <Text style={[styles.timeValue, isUrgent && styles.timeValueUrgent]}>
                        {pad(seconds)}
                    </Text>
                    <Text style={styles.timeUnit}>sec</Text>
                </View>
            </View>

            {remaining === 0 && (
                <Text style={styles.arrivedText}>🚑 Arrived!</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    containerUrgent: {
        borderColor: COLORS.critical,
        backgroundColor: COLORS.criticalBg,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    labelUrgent: {
        color: COLORS.critical,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeBox: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        minWidth: 70,
    },
    timeBoxUrgent: {
        backgroundColor: COLORS.critical,
    },
    timeValue: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: '800',
        color: COLORS.white,
    },
    timeValueUrgent: {
        color: COLORS.white,
    },
    timeUnit: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    colon: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: '800',
        color: COLORS.primaryDark,
        marginHorizontal: SPACING.sm,
    },
    colonUrgent: {
        color: COLORS.critical,
    },
    arrivedText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.success,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
});
