import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/Theme';

interface FormInputProps extends TextInputProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    error?: string;
}

export default function FormInput({ label, icon, error, style, ...props }: FormInputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, error && styles.errorBorder]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={error ? COLORS.critical : COLORS.textMuted}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={COLORS.textMuted}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
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
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        minHeight: 50,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        paddingVertical: 12,
    },
    errorBorder: {
        borderColor: COLORS.critical,
    },
    errorText: {
        color: COLORS.critical,
        fontSize: FONT_SIZES.xs,
        marginTop: 4,
        marginLeft: 4,
    },
});
