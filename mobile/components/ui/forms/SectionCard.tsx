import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';

interface SectionCardProps {
    title: string;
    children: React.ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
        ...SHADOWS.small,
    },
    header: {
        backgroundColor: COLORS.primaryLight + '10',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    content: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },
});
