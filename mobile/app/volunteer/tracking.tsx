import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useApp } from '@/context/AppContext';
import { updateEmergencyStatus } from '@/services/api';
import socketService, { SOCKET_EVENTS } from '@/services/socket';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';

export default function VolunteerTracking() {
    const router = useRouter();
    const { currentEmergency, setCurrentEmergency, userId } = useApp();

    const [volunteerLocation, setVolunteerLocation] = useState<{ lat: number, lon: number } | null>(null);
    const mapRef = useRef<MapView>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    // ---------------------------------------------------------------------------
    // 1. INITIALIZATION & LIVE LOCATION
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (!currentEmergency) {
            router.replace('/volunteer/' as any);
            return;
        }

        startTracking();

        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const startTracking = async () => {
        try {
            // Get initial location quickly
            const initialLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setVolunteerLocation({
                lat: initialLocation.coords.latitude,
                lon: initialLocation.coords.longitude
            });

            // Start continuous high-accuracy watch
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 3000,
                    distanceInterval: 5,
                },
                (location) => {
                    const newCoords = { lat: location.coords.latitude, lon: location.coords.longitude };
                    setVolunteerLocation(newCoords);

                    // Transmit to backend
                    socketService.emit(SOCKET_EVENTS.LOCATION_UPDATE, {
                        volunteerId: userId,
                        targetId: currentEmergency?.id,
                        lat: newCoords.lat,
                        lon: newCoords.lon
                    });
                }
            );
        } catch (error) {
            Alert.alert("Tracking Error", "Could not track your location properly.");
        }
    };

    // ---------------------------------------------------------------------------
    // 2. STATUS UPDATES (Arrival & Completion)
    // ---------------------------------------------------------------------------
    const handleArrived = async () => {
        if (!currentEmergency) return;
        try {
            await updateEmergencyStatus(currentEmergency.id, 'volunteer_arrived');
            setCurrentEmergency({ ...currentEmergency, status: 'volunteer_arrived' });
        } catch (error) {
            Alert.alert("Error", "Failed to update status.");
        }
    };

    const handleComplete = async () => {
        if (!currentEmergency) return;
        try {
            await updateEmergencyStatus(currentEmergency.id, 'completed');
            setCurrentEmergency(null); // Clear context immediately cleans up the local state
            router.replace('/volunteer/' as any); // Go back to dashboard
        } catch (error) {
            Alert.alert("Error", "Failed to complete emergency.");
        }
    };

    // ---------------------------------------------------------------------------
    // 3. MAP RENDERING
    // ---------------------------------------------------------------------------
    const renderMap = () => {
        if (!currentEmergency || !volunteerLocation) {
            return (
                <View style={styles.loadingMap}>
                    <Text>Loading Map...</Text>
                </View>
            );
        }

        // Fake Polyline (Straight line for demo, would use Directions API in prod)
        const coords = [
            { latitude: volunteerLocation.lat, longitude: volunteerLocation.lon },
            { latitude: currentEmergency.lat, longitude: currentEmergency.lon }
        ];

        return (
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: volunteerLocation.lat,
                    longitude: volunteerLocation.lon,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {/* Volunteer Marker */}
                <Marker
                    coordinate={{ latitude: volunteerLocation.lat, longitude: volunteerLocation.lon }}
                    title="You"
                >
                    <View style={styles.volunteerMarker}>
                        <Ionicons name="body" size={24} color="#FFF" />
                    </View>
                </Marker>

                {/* Emergency Marker */}
                <Marker
                    coordinate={{ latitude: currentEmergency.lat, longitude: currentEmergency.lon }}
                    title="Target"
                >
                    <View style={styles.emergencyMarker}>
                        <Ionicons name="medical" size={20} color="#FFF" />
                    </View>
                </Marker>

                {/* Simulated Route Route */}
                <Polyline
                    coordinates={coords}
                    strokeColor={COLORS.accent}
                    strokeWidth={4}
                    lineDashPattern={[10, 10]}
                />
            </MapView>
        );
    };

    if (!currentEmergency) return null;

    return (
        <View style={styles.container}>
            {/* Header Overlay */}
            <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Response</Text>
            </LinearGradient>

            {/* Map */}
            {renderMap()}

            {/* Info Panel Bottom Sheet */}
            <View style={styles.infoPanel}>
                <View style={styles.panelHandle} />

                <Text style={styles.panelDistance}>0.8 km away • 3 min ETA</Text>
                <Text style={styles.emergencyDesc}>{currentEmergency.description}</Text>

                {/* Citizen Details if available */}
                {currentEmergency.citizen_name && (
                    <View style={styles.citizenBox}>
                        <Ionicons name="person-circle" size={32} color={COLORS.textSecondary} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.citizenName}>{currentEmergency.citizen_name}</Text>
                            <Text style={styles.citizenPhone}>{currentEmergency.citizen_phone}</Text>
                        </View>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actionContainer}>
                    {currentEmergency.status !== 'volunteer_arrived' ? (
                        <TouchableOpacity style={styles.arrivedBtn} onPress={handleArrived}>
                            <Text style={styles.arrivedText}>I HAVE ARRIVED</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                            <Text style={styles.completeText}>MARK COMPLETED</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 30, paddingHorizontal: SPACING.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#FFF' },

    loadingMap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    volunteerMarker: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    emergencyMarker: { backgroundColor: COLORS.critical, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },

    infoPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, paddingBottom: 40, ...SHADOWS.large },
    panelHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
    panelDistance: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.accent, marginBottom: SPACING.xs },
    emergencyDesc: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.lg },

    citizenBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
    citizenName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
    citizenPhone: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

    actionContainer: { flexDirection: 'row' },
    arrivedBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
    arrivedText: { color: '#FFF', fontWeight: '800', fontSize: FONT_SIZES.md },
    completeBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.success, paddingVertical: 16, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', gap: 8 },
    completeText: { color: '#FFF', fontWeight: '800', fontSize: FONT_SIZES.md },
});
