// PraanSettu Design System
// Government-grade, professional emergency response theme

export const COLORS = {
  // ─── Primary Brand ─────────────────────────────────────
  primary: '#0F2B5B',       // Deep navy
  primaryLight: '#1A3F7A',
  primaryDark: '#091D3E',
  accent: '#2196F3',        // Bright blue
  accentLight: '#64B5F6',

  // ─── Emergency Severity ────────────────────────────────
  critical: '#DC2626',      // Red
  criticalBg: '#FEF2F2',
  high: '#EA580C',          // Orange
  highBg: '#FFF7ED',
  moderate: '#D97706',      // Amber
  moderateBg: '#FFFBEB',
  low: '#16A34A',           // Green
  lowBg: '#F0FDF4',

  // ─── Status Colors ────────────────────────────────────
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2196F3',

  // ─── Neutral ──────────────────────────────────────────
  white: '#FFFFFF',
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // ─── Dark Mode Variants ───────────────────────────────
  darkBg: '#0F172A',
  darkSurface: '#1E293B',
  darkBorder: '#334155',

  // ─── Ambulance / Emergency ────────────────────────────
  ambulanceYellow: '#FBBF24',
  hospitalBlue: '#3B82F6',
  emergencyRed: '#EF4444',
  pulseRed: '#FCA5A5',

  // ─── Surge Mode ───────────────────────────────────────
  surgeOrange: '#F97316',
  surgeBg: '#431407',
} as const;

export const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: COLORS.criticalBg, text: COLORS.critical, dot: COLORS.critical },
  high: { bg: COLORS.highBg, text: COLORS.high, dot: COLORS.high },
  moderate: { bg: COLORS.moderateBg, text: COLORS.moderate, dot: COLORS.moderate },
  low: { bg: COLORS.lowBg, text: COLORS.low, dot: COLORS.low },
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Waiting for Ambulance',
  assigned: 'Ambulance Assigned',
  accepted: 'Driver Accepted',
  arrived_at_scene: 'Ambulance at Scene',
  picked_patient: 'Patient Picked Up',
  en_route_hospital: 'En Route to Hospital',
  reached_hospital: 'Reached Hospital',
  completed: 'Completed',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  }),
} as const;
