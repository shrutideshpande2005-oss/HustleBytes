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

const TRANSLATIONS: any = {
    en: {
        citizenTitle: 'Citizen', driverTitle: 'Ambulance Driver', hospitalTitle: 'Hospital', adminTitle: 'Admin', volunteerTitle: 'Volunteer',
        loginSuffix: 'Login', welcome: 'Welcome back to PraanSettu',
        emailPlaceholder: 'Email Address', passwordPlaceholder: 'Password', signIn: 'Sign In', noAccount: "Don't have an account?", signUp: 'Sign Up', user: 'User'
    },
    hi: {
        citizenTitle: 'नागरिक', driverTitle: 'एम्बुलेंस चालक', hospitalTitle: 'अस्पताल', adminTitle: 'प्रशासक / प्राधिकारी', volunteerTitle: 'स्वयंसेवक',
        loginSuffix: 'लॉगिन', welcome: 'प्राणसेतु में वापसी पर स्वागत है',
        emailPlaceholder: 'ईमेल पता', passwordPlaceholder: 'पासवर्ड', signIn: 'साइन इन करें', noAccount: "खाता नहीं है?", signUp: 'साइन अप करें', user: 'उपयोगकर्ता'
    },
    mr: {
        citizenTitle: 'नागरिक', driverTitle: 'रुग्णवाहिका चालक', hospitalTitle: 'रुग्णालय', adminTitle: 'प्रशासक / अधिकारी', volunteerTitle: 'स्वयंसेवक',
        loginSuffix: 'लॉगिन', welcome: 'प्राणसेतू मध्ये पुन्हा स्वागत आहे',
        emailPlaceholder: 'ईमेल पत्ता', passwordPlaceholder: 'पासवर्ड', signIn: 'साइन इन करा', noAccount: "खाते नाही?", signUp: 'साइन अप करा', user: 'वापरकर्ता'
    },
    bn: {
        citizenTitle: 'নাগরিক', driverTitle: 'অ্যাম্বুলেন্স চালক', hospitalTitle: 'হাসপাতাল', adminTitle: 'অ্যাডমিন / কর্তৃপক্ষ', volunteerTitle: 'স্বেচ্ছাসেবক',
        loginSuffix: 'লগইন', welcome: 'প্রাণসেতু তে স্বাগতম',
        emailPlaceholder: 'ইমেইল ঠিকানা', passwordPlaceholder: 'পাসওয়ার্ড', signIn: 'সাইন ইন', noAccount: "অ্যাকাউন্ট নেই?", signUp: 'সাইন আপ', user: 'ব্যবহারকারী'
    },
    te: {
        citizenTitle: 'పౌరుడు', driverTitle: 'అంబులెన్స్ డ్రైవర్', hospitalTitle: 'ఆసుపత్రి', adminTitle: 'అడ్మిన్ / అధికారి', volunteerTitle: 'వాలంటీర్',
        loginSuffix: 'లాగిన్', welcome: 'ప్రాణసేతు కు తిరిగి స్వాగతం',
        emailPlaceholder: 'ఇమెయిల్ అడ్రస్', passwordPlaceholder: 'పాస్వర్డ్', signIn: 'సైన్ ఇన్', noAccount: "ఖాతా లేదా?", signUp: 'సైన్ అప్', user: 'వినియోగదారు'
    },
    ta: {
        citizenTitle: 'குடிமகன்', driverTitle: 'ஆம்புலன்ஸ் டிரைவர்', hospitalTitle: 'மருத்துவமனை', adminTitle: 'நிர்வாகி', volunteerTitle: 'தன்னார்வலர்',
        loginSuffix: 'உள்நுழைய', welcome: 'பிராண்சேதுக்கு மீண்டும் வருக',
        emailPlaceholder: 'மின்னஞ்சல் முகவரி', passwordPlaceholder: 'கடவுச்சொல்', signIn: 'உள்நுழைக', noAccount: "கணக்கு இல்லையா?", signUp: 'பதிவு செய்க', user: 'பயனர்'
    },
    gu: {
        citizenTitle: 'નાગરિક', driverTitle: 'એમ્બ્યુલન્સ ડ્રાઇવર', hospitalTitle: 'હોસ્પિટલ', adminTitle: 'એડમિનિક અધિકારી', volunteerTitle: 'સ્વયંસેવક',
        loginSuffix: 'લૉગિન', welcome: 'પ્રાણસેતુમાં ફરી સ્વાગત છે',
        emailPlaceholder: 'ઇમેઇલ સરનામું', passwordPlaceholder: 'પાસવર્ડ', signIn: 'સાઇન ઇન', noAccount: "ખાતું નથી?", signUp: 'સાઇન અપ', user: 'વપરાશકર્તા'
    },
    ur: {
        citizenTitle: 'شہری', driverTitle: 'ایمبولینس', hospitalTitle: 'ہسپتال', adminTitle: 'ایڈمن', volunteerTitle: 'رضاکار',
        loginSuffix: 'لاگ ان', welcome: 'پران سیتو میں خوش آمدید',
        emailPlaceholder: 'ای میل ایڈریس', passwordPlaceholder: 'پاس ورڈ', signIn: 'سائن ان', noAccount: "اکاؤنٹ نہیں ہے؟", signUp: 'سائن اپ', user: 'صارف'
    },
    kn: {
        citizenTitle: 'ನಾಗರಿಕ', driverTitle: 'ಆಂಬ್ಯುಲೆನ್ಸ್', hospitalTitle: 'ಆಸ್ಪತ್ರೆ', adminTitle: 'ಆಡಳಿತಾಧಿಕಾರಿ', volunteerTitle: 'ಸ್ವಯಂಸೇವಕ',
        loginSuffix: 'ಲಾಗಿನ್', welcome: 'ಪ್ರಾಣಸೇತುಗೆ ಸ್ವಾಗತ',
        emailPlaceholder: 'ಇಮೇಲ್ ವಿಳಾಸ', passwordPlaceholder: 'ಪಾಸ್ವರ್ಡ್', signIn: 'ಸೈನ್ ಇನ್', noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?", signUp: 'ಸೈನ್ ಅಪ್', user: 'ಬಳಕೆದಾರ'
    },
    ml: {
        citizenTitle: 'പൗരൻ', driverTitle: 'ആംബുലൻസ് ഡ്രൈവർ', hospitalTitle: 'ആശുപത്രി', adminTitle: 'അഡ്മിൻ', volunteerTitle: 'വോളണ്ടിയർ',
        loginSuffix: 'ലോഗിൻ', welcome: 'പ്രാൺസേതുവിലേക്ക് സ്വാഗതം',
        emailPlaceholder: 'ഇമെയിൽ വിലാസം', passwordPlaceholder: 'പാസ്വേഡ്', signIn: 'സൈൻ ഇൻ', noAccount: "അക്കൗണ്ട് ഇല്ലേ?", signUp: 'സൈൻ അപ്പ്', user: 'ഉപയോക്താവ്'
    },
    pa: {
        citizenTitle: 'ਨਾਗਰਿਕ', driverTitle: 'ਐਂਬੂਲੈਂਸ ਡਰਾਈਵਰ', hospitalTitle: 'ਹਸਪਤਾਲ', adminTitle: 'ਐਡਮਿਨ', volunteerTitle: 'ਵਲੰਟੀਅਰ',
        loginSuffix: 'ਲਾਗਿਨ', welcome: 'ਪ੍ਰਾਣਸੇਤੂ ਵਿੱਚ ਵਾਪਸੀ ਤੇ ਸਵਾਗਤ ਹੈ',
        emailPlaceholder: 'ਈਮੇਲ ਪਤਾ', passwordPlaceholder: 'ਪਾਸਵਰਡ', signIn: 'ਸਾਈਨ ਇਨ', noAccount: "ਖਾਤਾ ਨਹੀਂ ਹੈ?", signUp: 'ਸਾਈਨ ਅਪ', user: 'ਉਪਯੋਗਕਰਤਾ'
    }
};

export default function LoginScreen() {
    const { role } = useLocalSearchParams<{ role: string }>();
    const router = useRouter();
    const { setRole, language } = useApp();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Derived UI based on role
    const getRoleDetails = () => {
        switch (role) {
            case "citizen":
                return {
                    title: t.citizenTitle,
                    gradient: ["#DC2626", "#991B1B"],
                    color: "#DC2626",
                };
            case "driver":
                return {
                    title: t.driverTitle,
                    gradient: ["#2563EB", "#1D4ED8"],
                    color: "#2563EB",
                };
            case "hospital":
                return {
                    title: t.hospitalTitle,
                    gradient: ["#059669", "#047857"],
                    color: "#059669",
                };
            case "admin":
                return {
                    title: t.adminTitle,
                    gradient: ["#7C3AED", "#6D28D9"],
                    color: "#7C3AED",
                };
            case "volunteer":
                return {
                    title: t.volunteerTitle,
                    gradient: ["#F59E0B", "#D97706"], // Amber
                    color: "#F59E0B",
                };
            default:
                return {
                    title: t.user,
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
                    <Text style={styles.headerTitle}>{details.title} {t.loginSuffix}</Text>
                    <Text style={styles.headerSub}>{t.welcome}</Text>
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
                        placeholder={t.emailPlaceholder}
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
                        placeholder={t.passwordPlaceholder}
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
                    <Text style={styles.loginBtnText}>{t.signIn}</Text>
                    <Ionicons name="log-in-outline" size={20} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>{t.noAccount} </Text>
                    <TouchableOpacity
                        onPress={() => router.push(`/auth/signup?role=${role}` as any)}
                    >
                        <Text style={[styles.signupText, { color: details.color }]}>
                            {t.signUp}
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
