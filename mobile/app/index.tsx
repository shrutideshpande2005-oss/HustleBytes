import React, { useEffect, useRef } from "react";
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

const ROLES: RoleCard[] = [
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
  const { setRole } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(ROLES.map(() => new Animated.Value(0))).current;

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
            <View>
              <Text style={styles.appName}>PraanSettu</Text>
              <Text style={styles.tagline}>Intelligent Emergency Response</Text>
            </View>
          </View>
          <Text style={styles.headerSubtext}>Select your role to continue</Text>
        </Animated.View>
      </LinearGradient>

      {/* Role Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {ROLES.map((card, index) => (
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
