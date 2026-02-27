import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { useApp } from '@/context/AppContext';

const TOAST_ICONS: Record<string, string> = {
    success: 'checkmark-circle',
    error: 'close-circle',
    warning: 'warning',
    info: 'information-circle',
};

const TOAST_COLORS: Record<string, string> = {
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,
};

export default function ToastContainer() {
    const { toasts } = useApp();

    return (
        <View style={styles.container} pointerEvents="none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} message={toast.message} type={toast.type} />
            ))}
        </View>
    );
}

function ToastItem({ message, type }: { message: string; type: string }) {
    const translateY = useRef(new Animated.Value(-80)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();

        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -80,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 3500);

        return () => clearTimeout(timeout);
    }, [translateY, opacity]);

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    borderLeftColor: TOAST_COLORS[type],
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <Ionicons
                name={TOAST_ICONS[type] as any}
                size={22}
                color={TOAST_COLORS[type]}
            />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 9999,
        gap: SPACING.sm,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        borderLeftWidth: 4,
        ...SHADOWS.medium,
    },
    toastText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },
});
