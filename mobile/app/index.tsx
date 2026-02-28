import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp, UserRole } from "@/context/AppContext";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from "@/constants/Theme";

const { width } = Dimensions.get("window");

interface RoleCard {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  route: string;
}

const TRANSLATIONS: any = {
  en: {
    appName: "PraanSettu",
    tagline: "Intelligent Emergency Response",
    selectBtn: "Select your role to continue",
    r_cit: "Citizen", r_citSub: "Report an emergency & get help fast",
    r_drv: "Ambulance Driver", r_drvSub: "Respond to emergencies & save lives",
    r_hsp: "Hospital", r_hspSub: "Manage incoming patients & beds",
    r_adm: "Admin / Authority", r_admSub: "Monitor the entire emergency network",
    r_vol: "Volunteer", r_volSub: "Help citizens in your local community",
  },
  hi: {
    appName: "प्राणसेतु",
    tagline: "बुद्धिमान आपातकालीन प्रतिक्रिया",
    selectBtn: "जारी रखने के लिए अपनी भूमिका चुनें",
    r_cit: "नागरिक", r_citSub: "आपातकाल की रिपोर्ट करें और जल्दी मदद पाएं",
    r_drv: "एम्बुलेंस चालक", r_drvSub: "आपात स्थिति का जवाब दें और जीवन बचाएं",
    r_hsp: "अस्पताल", r_hspSub: "आने वाले मरीजों और बिस्तरों का प्रबंधन करें",
    r_adm: "प्रशासक / प्राधिकारी", r_admSub: "संपूर्ण आपातकालीन नेटवर्क की निगरानी करें",
    r_vol: "स्वयंसेवक", r_volSub: "अपने स्थानीय समुदाय में नागरिकों की मदद करें",
  },
  mr: {
    appName: "प्राणसेतू",
    tagline: "बुद्धिमान आपत्कालीन प्रतिसाद",
    selectBtn: "पुढे जाण्यासाठी आपली भूमिका निवडा",
    r_cit: "नागरिक", r_citSub: "आपत्कालीन स्थितीची तक्रार करा आणि जलद मदत मिळवा",
    r_drv: "रुग्णवाहिका चालक", r_drvSub: "आणीबाणीला प्रतिसाद द्या आणि जीव वाचवा",
    r_hsp: "रुग्णालय", r_hspSub: "येणाऱ्या रुग्णांचे आणि खाटांचे व्यवस्थापन करा",
    r_adm: "प्रशासक / अधिकारी", r_admSub: "संपूर्ण आपत्कालीन नेटवर्कचे निरीक्षण करा",
    r_vol: "स्वयंसेवक", r_volSub: "आपल्या स्थानिक समुदायातील नागरिकांना मदत करा",
  },
  bn: {
    appName: "প্রাণসেতু",
    tagline: "বুদ্ধিমান জরুরি প্রতিক্রিয়া",
    selectBtn: "এগিয়ে যেতে আপনার ভূমিকা বেছে নিন",
    r_cit: "নাগরিক", r_citSub: "জরুরির রিপোর্ট করুন এবং দ্রুত সাহায্য পান",
    r_drv: "অ্যাম্বুলেন্স চালক", r_drvSub: "জরুরি অবস্থায় সাড়া দিন এবং জীবন বাঁচান",
    r_hsp: "হাসপাতাল", r_hspSub: "আগত রোগী এবং শয্যা পরিচালনা করুন",
    r_adm: "অ্যাডমিন / কর্তৃপক্ষ", r_admSub: "পুরো জরুরি নেটওয়ার্ক পর্যবেক্ষণ করুন",
    r_vol: "স্বেচ্ছাসেবক", r_volSub: "স্থানীয় সম্প্রদায়ের নাগরিকদের সাহায্য করুন",
  },
  te: {
    appName: "ప్రాణసేతు",
    tagline: "తెలివైన అత్యవసర ప్రతిస్పందన",
    selectBtn: "కొనసాగించడానికి మీ పాత్రను ఎంచుకోండి",
    r_cit: "పౌరుడు", r_citSub: "అత్యవసర పరిస్థితిని నివేదించండి & సహాయం పొందండి",
    r_drv: "అంబులెన్స్ డ్రైవర్", r_drvSub: "అత్యవసర పరిస్థితులకు స్పందించండి & ప్రాణాలను రక్షించండి",
    r_hsp: "ఆసుపత్రి", r_hspSub: "రోగులు & పడకలను నిర్వహించండి",
    r_adm: "అడ్మిన్ / అధికారి", r_admSub: "మొత్తం నెట్‌వర్క్‌ను పర్యవేక్షించండి",
    r_vol: "వాలంటీర్", r_volSub: "కమ్యూనిటీలోని పౌరులకు సహాయం చేయండి",
  },
  ta: {
    appName: "பிராண்சேது",
    tagline: "அவசர கால பதில்",
    selectBtn: "தொடர உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்",
    r_cit: "குடிமகன்", r_citSub: "அவசரத்தை புகாரளித்து உதவி பெறவும்",
    r_drv: "ஆம்புலன்ஸ் டிரைவர்", r_drvSub: "அவசரங்களுக்கு பதிலளிக்கவும் & உயிர்களை காப்பாற்றவும்",
    r_hsp: "மருத்துவமனை", r_hspSub: "நோயாளிகள் மற்றும் படுக்கைகளை நிர்வகி",
    r_adm: "நிர்வாகி", r_admSub: "கண்காணிப்பு நெட்வொர்க்",
    r_vol: "தன்னார்வலர்", r_volSub: "குடிமக்களுக்கு உதவுங்கள்",
  },
  gu: {
    appName: "પ્રાણસેતુ",
    tagline: "બુદ્ધિશાળી ઇમરજન્સી પ્રતિસાદ",
    selectBtn: "ચાલુ રાખવા માટે તમારી ભૂમિકા પસંદ કરો",
    r_cit: "નાગરિક", r_citSub: "ઇમરજન્સી રિપોર્ટ કરો અને ઝડપી મદદ મેળવો",
    r_drv: "એમ્બ્યુલન્સ ડ્રાઇવર", r_drvSub: "ઇમરજન્સીને પ્રતિસાદ આપો અને જીવન બચાવો",
    r_hsp: "હોસ્પિટલ", r_hspSub: "દર્દીઓ અને પથારી સંચાલિત કરો",
    r_adm: "એડમિનિક અધિકારી", r_admSub: "સમગ્ર ઇમરજન્સી નેટવર્કનું નિરીક્ષણ કરો",
    r_vol: "સ્વયંસેવક", r_volSub: "તમારા સમુદાયના નાગરિકોને મદદ કરો",
  },
  ur: {
    appName: "پران سیتو",
    tagline: "ذہین ہنگامی ردعمل",
    selectBtn: "جاری رکھنے کے لیے اپنا کردار منتخب کریں۔",
    r_cit: "شہری", r_citSub: "ہنگامی صورتحال کی اطلاع دیں اور فوری مدد حاصل کریں۔",
    r_drv: "ایمبولینس", r_drvSub: "ہنگامی حالات کا جواب دیں اور جان بچائیں۔",
    r_hsp: "ہسپتال", r_hspSub: "مریضوں اور بستروں کا انتظام کریں۔",
    r_adm: "ایڈمن", r_admSub: "پوری ایمرجنسی نیٹ ورک کی نگرانی کریں۔",
    r_vol: "رضاکار", r_volSub: "مقامی کمیونٹی میں شہریوں کی مدد کریں۔",
  },
  kn: {
    appName: "ಪ್ರಾಣಸೇತು",
    tagline: "ಬುದ್ಧಿವಂತ ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ",
    selectBtn: "ಮುಂದುವರಿಯಲು ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    r_cit: "ನಾಗರಿಕ", r_citSub: "ತುರ್ತು ವರದಿ ಮಾಡಿ ಮತ್ತು ಸಹಾಯ ಪಡೆಯಿರಿ",
    r_drv: "ಆಂಬ್ಯುಲೆನ್ಸ್", r_drvSub: "ತುರ್ತುಸ್ಥಿತಿಗಳಿಗೆ ಸ್ಪಂದಿಸಿ, ಜೀವ ಉಳಿಸಿ",
    r_hsp: "ಆಸ್ಪತ್ರೆ", r_hspSub: "ರೋಗಿಗಳು ಮತ್ತು ಹಾಸಿಗೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    r_adm: "ಆಡಳಿತಾಧಿಕಾರಿ", r_admSub: "ಸಂಪೂರ್ಣ ತುರ್ತು ನೆಟ್‌ವರ್ಕ್ ಮೇಲ್ವಿಚಾರಣೆ",
    r_vol: "ಸ್ವಯಂಸೇವಕ", r_volSub: "ಸ್ಥಳೀಯ ನಾಗರಿಕರಿಗೆ ಸಹಾಯ ಮಾಡಿ",
  },
  ml: {
    appName: "പ്രാൺസേതു",
    tagline: "അടിയന്തര പ്രതികരണം",
    selectBtn: "തുടരാൻ റോളിൽ തിരഞ്ഞെടുക്കുക",
    r_cit: "പൗരൻ", r_citSub: "അടിയന്തരാവസ്ഥ റിപ്പോർട്ട് ചെയ്യുക",
    r_drv: "ആംബുലൻസ് ഡ്രൈവർ", r_drvSub: "അടിയന്തര ഘട്ടങ്ങളിൽ പ്രതികരിക്കുക",
    r_hsp: "ആശുപത്രി", r_hspSub: "രോഗികളെയും കിടക്കകളെയും കൈകാര്യം ചെയ്യുക",
    r_adm: "അഡ്മിൻ", r_admSub: "നെറ്റ്‌വർക്ക് നിരീക്ഷിക്കുക",
    r_vol: "വോളണ്ടിയർ", r_volSub: "പൗരന്മാരെ സഹായിക്കുക",
  },
  pa: {
    appName: "ਪ੍ਰਾਣਸੇਤੂ",
    tagline: "ਐਮਰਜੈਂਸੀ ਪ੍ਰਤੀਕਿਰਿਆ",
    selectBtn: "ਅੱਗੇ ਵਧਣ ਲਈ ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ",
    r_cit: "ਨਾਗਰਿਕ", r_citSub: "ਐਮਰਜੈਂਸੀ ਦੀ ਰਿਪੋਰਟ ਕਰੋ",
    r_drv: "ਐਂਬੂਲੈਂਸ ਡਰਾਈਵਰ", r_drvSub: "ਐਮਰਜੈਂਸੀ ਦਾ ਜਵਾਬ ਦਿਓ",
    r_hsp: "ਹਸਪਤਾਲ", r_hspSub: "ਮਰੀਜ਼ਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
    r_adm: "ਐਡਮਿਨ", r_admSub: "ਪੂਰੇ ਨੈੱਟਵਰਕ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ",
    r_vol: "ਵਲੰਟੀਅਰ", r_volSub: "ਨਾਗਰਿਕਾਂ ਦੀ ਮਦਦ ਕਰੋ",
  }
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'ur', label: 'اردو' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const BASE_ROLES: RoleCard[] = [
  {
    role: "citizen",
    title: "Citizen",
    subtitle: "Report an emergency & get help fast",
    icon: "people",
    gradient: ["#DC2626", "#991B1B"],
    route: "/citizen",
  },
  {
    role: "driver",
    title: "Ambulance Driver",
    subtitle: "Respond to emergencies & save lives",
    icon: "car-sport",
    gradient: ["#2563EB", "#1D4ED8"],
    route: "/driver",
  },
  {
    role: "hospital",
    title: "Hospital",
    subtitle: "Manage incoming patients & beds",
    icon: "medkit",
    gradient: ["#059669", "#047857"],
    route: "/hospital",
  },
  {
    role: "admin",
    title: "Admin / Authority",
    subtitle: "Monitor the entire emergency network",
    icon: "shield-checkmark",
    gradient: ["#7C3AED", "#6D28D9"],
    route: "/admin",
  },
  {
    role: "volunteer",
    title: "Volunteer",
    subtitle: "Help citizens in your local community",
    icon: "hand-left",
    gradient: ["#F59E0B", "#D97706"], // Amber gradient
    route: "/volunteer",
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setRole, language, setLanguage } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(BASE_ROLES.map(() => new Animated.Value(0))).current;

  // Derive translated text properly
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const translatedRoles = [
    { ...BASE_ROLES[0], title: t.r_cit, subtitle: t.r_citSub },
    { ...BASE_ROLES[1], title: t.r_drv, subtitle: t.r_drvSub },
    { ...BASE_ROLES[2], title: t.r_hsp, subtitle: t.r_hspSub },
    { ...BASE_ROLES[3], title: t.r_adm, subtitle: t.r_admSub },
    { ...BASE_ROLES[4], title: t.r_vol, subtitle: t.r_volSub },
  ];

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    const cardAnimations = cardAnims.map((anim, index) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200 + index * 100,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(100, cardAnimations).start();
  }, []);

  const handleRoleSelect = (card: RoleCard) => {
    router.push(`/auth/login?role=${card.role}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="pulse" size={28} color={COLORS.critical} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>{t.appName}</Text>
              <Text style={styles.tagline}>{t.tagline}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtext}>{t.selectBtn}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15, paddingBottom: 5 }}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                onPress={() => setLanguage(l.code)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                  backgroundColor: language === l.code ? '#FFF' : 'rgba(255,255,255,0.2)',
                  marginRight: 8
                }}
              >
                <Text style={{ color: language === l.code ? COLORS.primary : '#FFF', fontWeight: 'bold' }}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      {/* Role Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {translatedRoles.map((card: any, index) => (
          <Animated.View
            key={card.role}
            style={{
              opacity: cardAnims[index],
              transform: [
                {
                  translateY: cardAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
                {
                  scale: cardAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleRoleSelect(card)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={card.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name={card.icon as any} size={32} color="#FFF" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="rgba(255,255,255,0.7)"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Bottom branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🇮🇳 Built for India • National Emergency Response
          </Text>
          <Text style={styles.versionText}>v1.0.0 • Hackathon Demo</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginTop: 2,
  },
  headerSubtext: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    minHeight: 100,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "400",
  },
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
