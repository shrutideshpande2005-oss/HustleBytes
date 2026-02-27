import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from "@/constants/Theme";
import { useApp } from "@/context/AppContext";

import FormInput from "@/components/ui/forms/FormInput";
import Dropdown from "@/components/ui/forms/Dropdown";
import ToggleSwitch from "@/components/ui/forms/ToggleSwitch";
import MultiSelect from "@/components/ui/forms/MultiSelect";
import SectionCard from "@/components/ui/forms/SectionCard";

export default function SignupScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const router = useRouter();
  const { setRole } = useApp();

  const [formData, setFormData] = useState<Record<string, any>>({
    locationConsent: false,
    liveLocation: false,
    organDonor: false,
    traumaCenter: false,
    cardiacUnit: false,
    bloodBank: false,
    emergency247: false,
    availabilityStatus: true,
    twoFactorAuth: false,
    masterAccess: false,
    medicalConditions: [],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => {
      const current = (prev[field] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // Derived UI based on role
  const getRoleDetails = () => {
    switch (role) {
      case "citizen":
        return {
          title: "Citizen",
          desc: "Secure reliable access to emergency services",
          gradient: ["#DC2626", "#991B1B"],
          color: "#DC2626",
        };
      case "driver":
        return {
          title: "Driver",
          desc: "Join the response network and save lives",
          gradient: ["#2563EB", "#1D4ED8"],
          color: "#2563EB",
        };
      case "hospital":
        return {
          title: "Hospital",
          desc: "Register your facility on the network",
          gradient: ["#059669", "#047857"],
          color: "#059669",
        };
      case "admin":
        return {
          title: "Admin",
          desc: "Request official access to dashboard",
          gradient: ["#7C3AED", "#6D28D9"],
          color: "#7C3AED",
        };
      case "volunteer":
        return {
          title: "Volunteer",
          desc: "Sign up to assist your community",
          gradient: ["#F59E0B", "#D97706"], // Amber
          color: "#F59E0B",
        };
      default:
        return {
          title: "User",
          desc: "Join PraanSettu",
          gradient: [COLORS.primary, COLORS.primaryLight],
          color: COLORS.primary,
        };
    }
  };

  const details = getRoleDetails();

  const handleSignup = () => {
    if (!formData.email || !formData.password) {
      Alert.alert(
        "Missing Fields",
        "Please make sure required fields are filled.",
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(role as any);
    router.push(`/${role}` as any);
  };

  const renderBasicInfo = () => (
    <SectionCard title="Basic Information">
      <FormInput
        label={role === "hospital" ? "Hospital Name" : "Full Name"}
        icon={role === "hospital" ? "business-outline" : "person-outline"}
        placeholder={`Enter ${role === "hospital" ? "hospital" : "your"} name`}
        value={formData.name || ""}
        onChangeText={(v) => updateField("name", v)}
      />

      {role === "hospital" && (
        <FormInput
          label="Admin Name"
          icon="person-outline"
          placeholder="Hospital Admin Name"
          value={formData.adminName || ""}
          onChangeText={(v) => updateField("adminName", v)}
        />
      )}

      {role === "admin" && (
        <FormInput
          label="Official Email"
          icon="mail-outline"
          placeholder="name@gov.in"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email || ""}
          onChangeText={(v) => updateField("email", v)}
        />
      )}

      {role !== "admin" && (
        <FormInput
          label="Email Address"
          icon="mail-outline"
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email || ""}
          onChangeText={(v) => updateField("email", v)}
        />
      )}

      {(role !== "admin" || (role === "admin" && !formData.phoneHidden)) && (
        <FormInput
          label="Phone Number"
          icon="call-outline"
          placeholder="+91"
          keyboardType="phone-pad"
          value={formData.phone || ""}
          onChangeText={(v) => updateField("phone", v)}
        />
      )}

      <FormInput
        label="Password"
        icon="lock-closed-outline"
        placeholder="Create a strong password"
        secureTextEntry
        value={formData.password || ""}
        onChangeText={(v) => updateField("password", v)}
      />
    </SectionCard>
  );

  const renderCitizenFields = () => (
    <>
      <SectionCard title="Additional Information">
        <FormInput
          label="Occupation"
          icon="briefcase-outline"
          placeholder="e.g. Software Engineer"
          value={formData.occupation || ""}
          onChangeText={(v) => updateField("occupation", v)}
        />
      </SectionCard>
    </>
  );

  const renderVolunteerFields = () => (
    <>
      <SectionCard title="Advanced Emergency Profile">
        <Dropdown
          label="Blood Group"
          icon="water-outline"
          options={[
            { label: "A+", value: "A+" },
            { label: "A-", value: "A-" },
            { label: "B+", value: "B+" },
            { label: "B-", value: "B-" },
            { label: "AB+", value: "AB+" },
            { label: "AB-", value: "AB-" },
            { label: "O+", value: "O+" },
            { label: "O-", value: "O-" },
          ]}
          selectedValue={formData.bloodGroup}
          onSelect={(v) => updateField("bloodGroup", v)}
        />
        <FormInput
          label="Age"
          icon="calendar-outline"
          placeholder="e.g. 25"
          keyboardType="numeric"
          value={formData.age || ""}
          onChangeText={(v) => updateField("age", v)}
        />
        <Dropdown
          label="Gender"
          icon="male-female-outline"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ]}
          selectedValue={formData.gender}
          onSelect={(v) => updateField("gender", v)}
        />
        <FormInput
          label="Occupation"
          icon="briefcase-outline"
          placeholder="e.g. Social Worker"
          value={formData.occupation || ""}
          onChangeText={(v) => updateField("occupation", v)}
        />
      </SectionCard>

      <SectionCard title="Emergency Contact">
        <FormInput
          label="Contact Name"
          icon="person-outline"
          placeholder="Relative or Friend"
          value={formData.emergencyContactName || ""}
          onChangeText={(v) => updateField("emergencyContactName", v)}
        />
        <FormInput
          label="Contact Phone"
          icon="call-outline"
          placeholder="+91"
          keyboardType="phone-pad"
          value={formData.emergencyContactPhone || ""}
          onChangeText={(v) => updateField("emergencyContactPhone", v)}
        />
      </SectionCard>

      <SectionCard title="Medical Information">
        <MultiSelect
          label="Known Medical Conditions"
          options={[
            "Diabetes",
            "Hypertension",
            "Asthma",
            "Heart Disease",
            "None",
          ]}
          selectedValues={formData.medicalConditions}
          onToggle={(v) => toggleMultiSelect("medicalConditions", v)}
        />
        <FormInput
          label="Allergies (Optional)"
          icon="medical-outline"
          placeholder="e.g. Penicillin, Peanuts"
          value={formData.allergies || ""}
          onChangeText={(v) => updateField("allergies", v)}
        />
      </SectionCard>

      <SectionCard title="Permissions & Consent">
        <ToggleSwitch
          label="Location Permission"
          description="Allow access to device location for volunteering mapping"
          value={formData.locationConsent}
          onValueChange={(v) => updateField("locationConsent", v)}
        />
        <ToggleSwitch
          label="Live Location Sharing"
          description="Share live tracking with dispatch"
          value={formData.liveLocation}
          onValueChange={(v) => updateField("liveLocation", v)}
        />
        <ToggleSwitch
          label="Organ Donor"
          description="Registered as an organ donor"
          value={formData.organDonor}
          onValueChange={(v) => updateField("organDonor", v)}
        />
      </SectionCard>
    </>
  );

  const renderDriverFields = () => (
    <>
      <SectionCard title="Professional Information">
        <FormInput
          label="Ambulance ID"
          icon="car-outline"
          placeholder="e.g. AMB-1049"
          value={formData.ambulanceId || ""}
          onChangeText={(v) => updateField("ambulanceId", v)}
        />
        <FormInput
          label="Vehicle Registration Number"
          icon="document-text-outline"
          placeholder="e.g. DL 1C AB 1234"
          value={formData.vehicleReg || ""}
          onChangeText={(v) => updateField("vehicleReg", v)}
        />
        <FormInput
          label="Driving License Number"
          icon="card-outline"
          placeholder="Enter DL number"
          value={formData.dlNumber || ""}
          onChangeText={(v) => updateField("dlNumber", v)}
        />
        <FormInput
          label="License Expiry Date"
          icon="calendar-outline"
          placeholder="DD/MM/YYYY"
          value={formData.dlExpiry || ""}
          onChangeText={(v) => updateField("dlExpiry", v)}
        />
        <FormInput
          label="Years of Experience"
          icon="time-outline"
          keyboardType="numeric"
          placeholder="e.g. 5"
          value={formData.experience || ""}
          onChangeText={(v) => updateField("experience", v)}
        />
        <Dropdown
          label="Certification Type"
          icon="medal-outline"
          options={[
            { label: "BLS (Basic Life Support)", value: "bls" },
            { label: "ALS (Advanced Life Support)", value: "als" },
            { label: "Paramedic", value: "paramedic" },
          ]}
          selectedValue={formData.certification}
          onSelect={(v) => updateField("certification", v)}
        />
      </SectionCard>

      <SectionCard title="Status & Geography">
        <FormInput
          label="Current Location"
          icon="location-outline"
          value="Detecting via GPS..."
          editable={false}
        />
        <Dropdown
          label="Shift Type"
          icon="time-outline"
          options={[
            { label: "Day", value: "day" },
            { label: "Night", value: "night" },
            { label: "24/7", value: "24_7" },
          ]}
          selectedValue={formData.shiftType}
          onSelect={(v) => updateField("shiftType", v)}
        />
        <ToggleSwitch
          label="Availability Status"
          description="Currently available for dispatch"
          value={formData.availabilityStatus}
          onValueChange={(v) => updateField("availabilityStatus", v)}
        />
      </SectionCard>

      <SectionCard title="Security Verification">
        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons
            name="cloud-upload-outline"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.uploadText}>Upload License Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons
            name="document-attach-outline"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.uploadText}>Upload ID Proof</Text>
        </TouchableOpacity>
      </SectionCard>
    </>
  );

  const renderHospitalFields = () => (
    <>
      <SectionCard title="Infrastructure Details">
        <FormInput
          label="Total Beds"
          icon="bed-outline"
          keyboardType="numeric"
          placeholder="Total capacity"
          value={formData.totalBeds || ""}
          onChangeText={(v) => updateField("totalBeds", v)}
        />
        <FormInput
          label="ICU Beds Available"
          icon="pulse-outline"
          keyboardType="numeric"
          placeholder="Current ICU availability"
          value={formData.icuBeds || ""}
          onChangeText={(v) => updateField("icuBeds", v)}
        />
        <FormInput
          label="Ventilators Available"
          icon="medical-outline"
          keyboardType="numeric"
          placeholder="Current ventilator count"
          value={formData.ventilators || ""}
          onChangeText={(v) => updateField("ventilators", v)}
        />
        <FormInput
          label="Oxygen Supply Capacity"
          icon="water-outline"
          placeholder="e.g. 5000 Liters"
          value={formData.oxygenCapacity || ""}
          onChangeText={(v) => updateField("oxygenCapacity", v)}
        />
        <Dropdown
          label="Hospital Type"
          icon="business-outline"
          options={[
            { label: "Government", value: "govt" },
            { label: "Private", value: "private" },
            { label: "Multi-specialty", value: "multi" },
          ]}
          selectedValue={formData.hospitalType}
          onSelect={(v) => updateField("hospitalType", v)}
        />
        <ToggleSwitch
          label="Trauma Center"
          description="Equipped for severe physical trauma"
          value={formData.traumaCenter}
          onValueChange={(v) => updateField("traumaCenter", v)}
        />
        <ToggleSwitch
          label="Cardiac Emergency Unit"
          description="24/7 cardiac life support"
          value={formData.cardiacUnit}
          onValueChange={(v) => updateField("cardiacUnit", v)}
        />
        <ToggleSwitch
          label="Blood Bank Available"
          description="In-house blood bank"
          value={formData.bloodBank}
          onValueChange={(v) => updateField("bloodBank", v)}
        />
      </SectionCard>

      <SectionCard title="Geo Details">
        <FormInput
          label="Hospital Address"
          icon="map-outline"
          placeholder="Full address"
          multiline
          style={{ height: 80, textAlignVertical: "top" }}
          value={formData.address || ""}
          onChangeText={(v) => updateField("address", v)}
        />
        <FormInput
          label="Latitude"
          icon="pin-outline"
          keyboardType="numeric"
          placeholder="e.g. 28.6139"
          value={formData.lat || ""}
          onChangeText={(v) => updateField("lat", v)}
        />
        <FormInput
          label="Longitude"
          icon="pin-outline"
          keyboardType="numeric"
          placeholder="e.g. 77.2090"
          value={formData.lon || ""}
          onChangeText={(v) => updateField("lon", v)}
        />
        <ToggleSwitch
          label="24/7 Emergency Available"
          description="Open for automated routing at all hours"
          value={formData.emergency247}
          onValueChange={(v) => updateField("emergency247", v)}
        />
      </SectionCard>
    </>
  );

  const renderAdminFields = () => (
    <>
      <SectionCard title="Authority Verification">
        <FormInput
          label="Department Name"
          icon="business-outline"
          placeholder="e.g. MoHFW / State Traffic Police"
          value={formData.department || ""}
          onChangeText={(v) => updateField("department", v)}
        />
        <FormInput
          label="Designation"
          icon="ribbon-outline"
          placeholder="e.g. Chief Medical Officer"
          value={formData.designation || ""}
          onChangeText={(v) => updateField("designation", v)}
        />
        <FormInput
          label="Region / City"
          icon="map-outline"
          placeholder="e.g. Delhi NCR"
          value={formData.region || ""}
          onChangeText={(v) => updateField("region", v)}
        />
        <FormInput
          label="Government ID"
          icon="id-card-outline"
          placeholder="Official Gov ID Number"
          value={formData.govId || ""}
          onChangeText={(v) => updateField("govId", v)}
        />
        <FormInput
          label="Admin Authorization Code"
          icon="key-outline"
          placeholder="Internal security code"
          secureTextEntry
          value={formData.authCode || ""}
          onChangeText={(v) => updateField("authCode", v)}
        />
        <Dropdown
          label="Access Level"
          icon="shield-checkmark-outline"
          options={[
            { label: "District", value: "district" },
            { label: "City", value: "city" },
            { label: "State", value: "state" },
            { label: "National", value: "national" },
          ]}
          selectedValue={formData.accessLevel}
          onSelect={(v) => updateField("accessLevel", v)}
        />
      </SectionCard>

      <SectionCard title="Security">
        <ToggleSwitch
          label="Two-Factor Authentication"
          description="Require OTP on login"
          value={formData.twoFactorAuth}
          onValueChange={(v) => updateField("twoFactorAuth", v)}
        />
        <ToggleSwitch
          label="Master Access Approval Required"
          description="Flag for secondary admin approval"
          value={formData.masterAccess}
          onValueChange={(v) => updateField("masterAccess", v)}
        />
      </SectionCard>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={details.gradient as any} style={styles.header}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace(`/auth/login?role=${role}` as any); } }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{details.title} Registration</Text>
          <Text style={styles.headerSub}>{details.desc}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.formScroll}
        showsVerticalScrollIndicator={false}
      >
        {renderBasicInfo()}

        {role === "citizen" && renderCitizenFields()}
        {role === "volunteer" && renderVolunteerFields()}
        {role === "driver" && renderDriverFields()}
        {role === "hospital" && renderHospitalFields()}
        {role === "admin" && renderAdminFields()}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: details.color }]}
          onPress={handleSignup}
        >
          <Text style={styles.submitBtnText}>Create Account</Text>
          <Ionicons name="person-add-outline" size={20} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push(`/auth/login?role=${role}` as any)}
          >
            <Text style={[styles.loginText, { color: details.color }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 30,
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
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: "#FFF",
  },
  headerSub: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  formScroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.primaryLight + "10",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  uploadText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: FONT_SIZES.md,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  loginText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "bold",
  },
});
