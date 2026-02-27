import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/Theme';

interface ToggleSwitchProps {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export default function ToggleSwitch({ label, description, value, onValueChange }: ToggleSwitchProps) {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={value ? COLORS.primary : '#f4f3f4'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    textContainer: {
        flex: 1,
        paddingRight: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    description: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
});
