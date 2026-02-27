import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SEVERITY_COLORS, COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '@/constants/Theme';

interface SeverityBadgeProps {
    severity: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
    const colors = SEVERITY_COLORS[severity.toLowerCase()] || SEVERITY_COLORS.low;
    const sizeStyles = SIZE_MAP[size];

    return (
        <View style={[styles.badge, { backgroundColor: colors.bg }, sizeStyles.container]}>
            <View style={[styles.dot, { backgroundColor: colors.dot }, sizeStyles.dot]} />
            <Text style={[styles.text, { color: colors.text }, sizeStyles.text]}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Text>
        </View>
    );
}

const SIZE_MAP = {
    sm: {
        container: { paddingHorizontal: 8, paddingVertical: 3 },
        dot: { width: 6, height: 6 },
        text: { fontSize: FONT_SIZES.xs },
    },
    md: {
        container: { paddingHorizontal: 12, paddingVertical: 5 },
        dot: { width: 8, height: 8 },
        text: { fontSize: FONT_SIZES.sm },
    },
    lg: {
        container: { paddingHorizontal: 16, paddingVertical: 8 },
        dot: { width: 10, height: 10 },
        text: { fontSize: FONT_SIZES.md },
    },
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.full,
        alignSelf: 'flex-start',
    },
    dot: {
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.xs,
    },
    text: {
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
