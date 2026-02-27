import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/Theme';

interface MultiSelectProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onToggle: (value: string) => void;
}

export default function MultiSelect({ label, options, selectedValues, onToggle }: MultiSelectProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chipsContainer}>
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option);
                    return (
                        <TouchableOpacity
                            key={option}
                            style={[styles.chip, isSelected && styles.chipSelected]}
                            onPress={() => onToggle(option)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.sm,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
    },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primaryLight + '20',
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    chipTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
