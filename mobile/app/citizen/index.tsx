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

const TRANSLATIONS: any = {
    en: {
        appName: 'PraanSettu', appSub: 'Emergency Response System', status: 'You are connected to emergency services', press: 'Press in case of emergency', detecting: 'Detecting your location...', emergText: 'EMERGENCY', emergSubtext: 'Tap for help', reportText: 'Report Emergency with Details', natEmerg: 'National Emergency', amb: 'Ambulance', fire: 'Fire'
    },
    hi: {
        appName: 'प्राणसेतु', appSub: 'आपातकालीन प्रतिक्रिया प्रणाली', status: 'आप आपातकालीन सेवाओं से जुड़े हैं', press: 'आपातकाल के मामले में दबाएं', detecting: 'आपका स्थान खोजा जा रहा है...', emergText: 'आपातकाल', emergSubtext: 'मदद के लिए टैप करें', reportText: 'विवरण के साथ आपातकाल दर्ज करें', natEmerg: 'राष्ट्रीय आपातकाल', amb: 'एम्बुलेंस', fire: 'दमकल'
    },
    mr: {
        appName: 'प्राणसेतू', appSub: 'आणीबाणी प्रतिसाद प्रणाली', status: 'आपण आणीबाणी सेवांशी जोडलेले आहात', press: 'आणीबाणीच्या परिस्थितीत दाबा', detecting: 'तुमचे स्थान शोधत करत आहे...', emergText: 'आणीबाणी', emergSubtext: 'मदतीसाठी टॅप करा', reportText: 'तपशीलांसह आणीबाणी नोंदवा', natEmerg: 'राष्ट्रीय आणीबाणी', amb: 'रुग्णवाहिका', fire: 'अग्निशमन'
    },
    bn: {
        appName: 'প্রাণসেতু', appSub: 'জরুরী প্রতিক্রিয়া সিস্টেম', status: 'আপনি জরুরী সেবার সাথে যুক্ত', press: 'জরুরী অবস্থায় চাপুন', detecting: 'আপনার অবস্থান শনাক্ত হচ্ছে...', emergText: 'জরুরী', emergSubtext: 'সাহায্যের জন্য ট্যাপ করুন', reportText: 'জরুরী অবস্থা রিপোর্ট করুন', natEmerg: 'জাতীয় জরুরী সেবা', amb: 'অ্যাম্বুলেন্স', fire: 'ফায়ার'
    },
    te: {
        appName: 'ప్రాణసేతు', appSub: 'అత్యవసర ప్రతిస్పందన', status: 'మీరు కనెక్ట్ అయ్యారు', press: 'అత్యవసర పరిస్థితుల్లో నొక్కండి', detecting: 'స్థానం కనుగొనబడుతోంది...', emergText: 'అత్యవసర', emergSubtext: 'సహాయం కోసం నొక్కండి', reportText: 'అత్యవసర పరిస్థితిని నివేదించండి', natEmerg: 'జాతీయ అత్యవసర', amb: 'అంబులెన్స్', fire: 'అగ్నిమాపక'
    },
    ta: {
        appName: 'பிராண்சேது', appSub: 'அவசர அமைப்பு', status: 'இணைக்கப்பட்டுள்ளீர்கள்', press: 'அவசரத்திற்கு அழுத்தவும்', detecting: 'இடம் கண்டறியப்படுகிறது...', emergText: 'அவசரம்', emergSubtext: 'உதவிக்கு தட்டவும்', reportText: 'அவசரநிலையை புகாரளி', natEmerg: 'தேசிய அவசரம்', amb: 'ஆம்புலன்ஸ்', fire: 'தீயணைப்பு'
    },
    gu: {
        appName: 'પ્રાણસેતુ', appSub: 'ઇમરજન્સી રિસ્પોન્સ', status: 'તમે જોડાયેલા છો', press: 'ઇમરજન્સીમાં દબાવો', detecting: 'સ્થાન શોધી રહ્યું છે...', emergText: 'ઇમરજન્સી', emergSubtext: 'મદદ માટે ટેપ કરો', reportText: 'વિગતો સાથે જાણ કરો', natEmerg: 'રાષ્ટ્રીય ઇમરજન્સી', amb: 'એમ્બ્યુલન્સ', fire: 'ફાયર'
    },
    ur: {
        appName: 'پران سیتو', appSub: 'ایمرجنسی رسپانس', status: 'آپ منسلک ہیں', press: 'ایمرجنسی میں دبائیں', detecting: 'مقام کا پتہ لگا رہا ہے...', emergText: 'ایمرجنسی', emergSubtext: 'مدد کے لیے ٹیپ کریں', reportText: 'ایمرجنسی کی اطلاع دیں', natEmerg: 'قومی ایمرجنسی', amb: 'ایمبولینس', fire: 'فائر'
    },
    kn: {
        appName: 'ಪ್ರಾಣಸೇತು', appSub: 'ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ', status: 'ನೀವು ಸಂಪರ್ಕಗೊಂಡಿದ್ದೀರಿ', press: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಒತ್ತಿರಿ', detecting: 'ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...', emergText: 'ತುರ್ತು', emergSubtext: 'ಸಹಾಯಕ್ಕಾಗಿ ಟ್ಯಾಪ್ ಮಾಡಿ', reportText: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ವರದಿ ಮಾಡಿ', natEmerg: 'ರಾಷ್ಟ್ರೀಯ ತುರ್ತು', amb: 'ಆಂಬ್ಯುಲೆನ್ಸ್', fire: 'ಅಗ್ನಿಶಾಮಕ'
    },
    ml: {
        appName: 'പ്രാൺസേതു', appSub: 'അടിയന്തര പ്രതികരണം', status: 'ബന്ധിപ്പിച്ചിരിക്കുന്നു', press: 'അടിയന്തര സമയത്ത് അമർത്തുക', detecting: 'സ്ഥലം കണ്ടെത്തുന്നു...', emergText: 'അടിയന്തരാവസ്ഥ', emergSubtext: 'സഹായത്തിന് ടാപ്പുചെയ്യുക', reportText: 'അറിയിക്കുക', natEmerg: 'ദേശീയ അടിയന്തരാവസ്ഥ', amb: 'ആംബുലൻസ്', fire: 'ഫയർ'
    },
    pa: {
        appName: 'ਪ੍ਰਾਣਸੇਤੂ', appSub: 'ਐਮਰਜੈਂਸੀ ਰਿਸਪਾਂਸ', status: 'ਤੁਸੀਂ ਜੁੜੇ ਹੋਏ ਹੋ', press: 'ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਦਬਾਓ', detecting: 'ਸਥਾਨ ਲੱਭ ਰਿਹਾ ਹੈ...', emergText: 'ਐਮਰਜੈਂਸੀ', emergSubtext: 'ਮਦਦ ਲਈ ਟੈਪ ਕਰੋ', reportText: 'ਰਿਪੋਰਟ ਕਰੋ', natEmerg: 'ਨੈਸ਼ਨਲ ਐਮਰਜੈਂਸੀ', amb: 'ਐਂਬੂਲੈਂਸ', fire: 'ਫਾਇਰ'
    }
};

export default function CitizenDashboard() {
    const router = useRouter();
    const { setUserLocation, addToast, setCurrentEmergency, language, setLanguage } = useApp();
    const [gettingLocation, setGettingLocation] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

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

    const handleEmergencyPress = async (customSeverity?: 'low' | 'moderate' | 'high' | 'critical', customDesc?: string) => {
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
                description: customDesc || '🚨 INSTANT SOS TRIGGERED BY CITIZEN APP 🚨',
                lat: location.coords.latitude,
                lon: location.coords.longitude,
                severity: customSeverity || 'critical',
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
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{t.appName}</Text>
                    <Text style={styles.headerSubtitle}>{t.appSub}</Text>
                </View>
            </LinearGradient>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Safety Status */}
                <View style={styles.statusCard}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                        {t.status}
                    </Text>
                </View>

                {/* Emergency Button */}
                <View style={styles.emergencySection}>
                    <Text style={styles.emergencyLabel}>{t.press}</Text>

                    {gettingLocation ? (
                        <View style={styles.loadingContainer}>
                            <LoadingSpinner size={60} color={COLORS.critical} />
                            <Text style={styles.loadingText}>{t.detecting}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => handleEmergencyPress()}
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
                                    <Text style={styles.emergencyText}>{t.emergText}</Text>
                                    <Text style={styles.emergencySubtext}>{t.emergSubtext}</Text>
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
                    <Text style={styles.reportButtonText}>{t.reportText}</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Quick Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Ionicons name="call-outline" size={24} color={COLORS.critical} />
                        <Text style={styles.infoTitle}>112</Text>
                        <Text style={styles.infoSubtitle}>{t.natEmerg}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="medkit-outline" size={24} color={COLORS.success} />
                        <Text style={styles.infoTitle}>108</Text>
                        <Text style={styles.infoSubtitle}>{t.amb}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="flame-outline" size={24} color={COLORS.high} />
                        <Text style={styles.infoTitle}>101</Text>
                        <Text style={styles.infoSubtitle}>{t.fire}</Text>
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
