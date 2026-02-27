import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────────
export type UserRole =
  | "citizen"
  | "driver"
  | "hospital"
  | "admin"
  | "volunteer"
  | null;

export type EmergencySeverity = "low" | "moderate" | "high" | "critical";

export type EmergencyStatus =
  | "pending"
  | "assigned"
  | "accepted"
  | "arrived_at_scene"
  | "picked_patient"
  | "en_route_hospital"
  | "reached_hospital"
  | "completed";

export interface Emergency {
  id: string;
  description: string;
  lat: number;
  lon: number;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  ambulance_id?: string;
  hospital_id?: string;
  hospital_name?: string;
  eta?: number;
  created_at: string;
  citizen_name?: string;
  citizen_phone?: string;
  age?: number;
  bloodGroup?: string;
  conditions?: string[];
  allergies?: string[];
  traumaIndex?: number;
  distance?: number;
}

export interface AmbulanceLocation {
  driver_id: string;
  lat: number;
  lon: number;
  status: string;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  icu_beds: number;
  general_beds: number;
  available_icu: number;
  available_general: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

// ─── Context ────────────────────────────────────────────────
interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: string;
  setUserId: (id: string) => void;
  currentEmergency: Emergency | null;
  setCurrentEmergency: (e: Emergency | null) => void;
  userLocation: { lat: number; lon: number } | null;
  setUserLocation: (loc: { lat: number; lon: number } | null) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
  surgeMode: boolean;
  setSurgeMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => useContext(AppContext);

// ─── Provider ───────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string>("user_001");
  const [currentEmergency, setCurrentEmergency] = useState<Emergency | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [surgeMode, setSurgeMode] = useState(false);

  const addToast = useCallback(
    (message: string, type: ToastMessage["type"]) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        userId,
        setUserId,
        currentEmergency,
        setCurrentEmergency,
        userLocation,
        setUserLocation,
        toasts,
        addToast,
        removeToast,
        surgeMode,
        setSurgeMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
