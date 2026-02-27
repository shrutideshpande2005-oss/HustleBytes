import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { createEmergency } from '@/services/api';

export default function CitizenDashboard() {
    const router = useRouter();
    const { setUserLocation, addToast, setCurrentEmergency } = useApp();
    const [gettingLocation, setGettingLocation] = useState(false);

    // Pulsing animation for emergency button
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        const glow = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.8,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        pulse.start();
        glow.start();

        return () => {
            pulse.stop();
            glow.stop();
        };
    }, []);

    const handleEmergencyPress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setGettingLocation(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Required',
                    'Please enable location access so we can send help to your exact location.',
                    [{ text: 'OK' }]
                );
                setGettingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setUserLocation({
                lat: location.coords.latitude,
                lon: location.coords.longitude,
            });

            addToast('Location detected! Dispatching Emergency Services...', 'success');

            // 🔥 NEW: Instant Create Emergency flow API
            const response = await createEmergency({
                description: '🚨 INSTANT SOS TRIGGERED BY CITIZEN APP 🚨',
                lat: location.coords.latitude,
                lon: location.coords.longitude,
                severity: 'critical',
            });

            if (response && response.success) {
                // Save context and redirect directly to Tracking Map!
                setCurrentEmergency(response.emergency);
                addToast('Emergency Services Dispatched.', 'success');
                router.push('/citizen/tracking');
            } else {
                addToast('Network error dispatching SOS, switching to form.', 'warning');
                router.push('/citizen/emergency-form');
            }

        } catch (error) {
            addToast('Could not get precise location. Routing to Manual Form.', 'warning');
            // Fallback: use a default location for demo
            setUserLocation({ lat: 18.5204, lon: 73.8567 }); // Pune Fallback
            router.push('/citizen/emergency-form');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleReportEmergency = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/citizen/emergency-form');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.header}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>PraanSettu</Text>
                    <Text style={styles.headerSubtitle}>Emergency Response System</Text>
                </View>
            </LinearGradient>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Safety Status */}
                <View style={styles.statusCard}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                        You are connected to emergency services
                    </Text>
                </View>

                {/* Emergency Button */}
                <View style={styles.emergencySection}>
                    <Text style={styles.emergencyLabel}>Press in case of emergency</Text>

                    {gettingLocation ? (
                        <View style={styles.loadingContainer}>
                            <LoadingSpinner size={60} color={COLORS.critical} />
                            <Text style={styles.loadingText}>Detecting your location...</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleEmergencyPress}
                            activeOpacity={0.8}
                        >
                            <Animated.View
                                style={[
                                    styles.emergencyButtonOuter,
                                    { opacity: glowAnim },
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.emergencyButton,
                                    { transform: [{ scale: pulseAnim }] },
                                ]}
                            >
                                <LinearGradient
                                    colors={['#EF4444', '#DC2626', '#B91C1C']}
                                    style={styles.emergencyGradient}
                                >
                                    <Ionicons name="warning" size={48} color="#FFF" />
                                    <Text style={styles.emergencyText}>EMERGENCY</Text>
                                    <Text style={styles.emergencySubtext}>Tap for help</Text>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Report Button */}
                <TouchableOpacity
                    style={styles.reportButton}
                    onPress={handleReportEmergency}
                    activeOpacity={0.85}
                >
                    <Ionicons name="document-text-outline" size={22} color={COLORS.accent} />
                    <Text style={styles.reportButtonText}>Report Emergency with Details</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Quick Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Ionicons name="call-outline" size={24} color={COLORS.critical} />
                        <Text style={styles.infoTitle}>112</Text>
                        <Text style={styles.infoSubtitle}>National Emergency</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="medkit-outline" size={24} color={COLORS.success} />
                        <Text style={styles.infoTitle}>108</Text>
                        <Text style={styles.infoSubtitle}>Ambulance</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="flame-outline" size={24} color={COLORS.high} />
                        <Text style={styles.infoTitle}>101</Text>
                        <Text style={styles.infoSubtitle}>Fire</Text>
                    </View>
                </View>
            </View>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lowBg,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: SPACING.xl,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.success,
        marginRight: SPACING.sm,
    },
    statusText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.success,
        fontWeight: '600',
        flex: 1,
    },
    emergencySection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    emergencyLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        fontWeight: '500',
        marginBottom: SPACING.lg,
    },
    emergencyButtonOuter: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: COLORS.critical,
        top: -10,
        left: -10,
    },
    emergencyButton: {
        width: 180,
        height: 180,
        borderRadius: 90,
        overflow: 'hidden',
        ...SHADOWS.large,
        shadowColor: COLORS.critical,
    },
    emergencyGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emergencyText: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '900',
        color: COLORS.white,
        marginTop: SPACING.sm,
        letterSpacing: 2,
    },
    emergencySubtext: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginTop: 4,
    },
    loadingContainer: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.critical,
        fontWeight: '600',
        marginTop: SPACING.md,
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
        ...SHADOWS.small,
    },
    reportButtonText: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },
    infoRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    infoCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    infoTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
    infoSubtitle: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        fontWeight: '500',
        textAlign: 'center',
    },
});
