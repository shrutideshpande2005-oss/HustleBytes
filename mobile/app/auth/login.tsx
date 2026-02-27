import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
    COLORS,
    SPACING,
    FONT_SIZES,
    BORDER_RADIUS,
    SHADOWS,
} from "@/constants/Theme";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
    const { role } = useLocalSearchParams<{ role: string }>();
    const router = useRouter();
    const { setRole } = useApp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Derived UI based on role
    const getRoleDetails = () => {
        switch (role) {
            case "citizen":
                return {
                    title: "Citizen",
                    gradient: ["#DC2626", "#991B1B"],
                    color: "#DC2626",
                };
            case "driver":
                return {
                    title: "Driver",
                    gradient: ["#2563EB", "#1D4ED8"],
                    color: "#2563EB",
                };
            case "hospital":
                return {
                    title: "Hospital",
                    gradient: ["#059669", "#047857"],
                    color: "#059669",
                };
            case "admin":
                return {
                    title: "Admin",
                    gradient: ["#7C3AED", "#6D28D9"],
                    color: "#7C3AED",
                };
            case "volunteer":
                return {
                    title: "Volunteer",
                    gradient: ["#F59E0B", "#D97706"], // Amber
                    color: "#F59E0B",
                };
            default:
                return {
                    title: "User",
                    gradient: [COLORS.primary, COLORS.primaryLight],
                    color: COLORS.primary,
                };
        }
    };

    const details = getRoleDetails();

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert("Missing Fields", "Please enter your email and password.");
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Mock authentication
        setRole(role as any);

        // Route to actual dashboard
        router.push(`/${role}` as any);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <LinearGradient colors={details.gradient as any} style={styles.header}>
                <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{details.title} Login</Text>
                    <Text style={styles.headerSub}>Welcome back to PraanSettu</Text>
                </View>
            </LinearGradient>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Ionicons
                        name="mail-outline"
                        size={20}
                        color={COLORS.textMuted}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={COLORS.textMuted}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={COLORS.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: details.color }]}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Ionicons name="log-in-outline" size={20} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity
                        onPress={() => router.push(`/auth/signup?role=${role}` as any)}
                    >
                        <Text style={[styles.signupText, { color: details.color }]}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: SPACING.lg,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        ...SHADOWS.medium,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: "800",
        color: "#FFF",
    },
    headerSub: {
        fontSize: FONT_SIZES.sm,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    formContainer: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
    },
    loginBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 54,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
        ...SHADOWS.medium,
    },
    loginBtnText: {
        color: "#FFF",
        fontSize: FONT_SIZES.lg,
        fontWeight: "bold",
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    signupText: {
        fontSize: FONT_SIZES.md,
        fontWeight: "bold",
    },
});
