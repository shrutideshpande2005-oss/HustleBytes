export const API_BASE_URL = "http://192.168.1.5:8000";
// Replace with your laptop IP if needed

export const createEmergency = async (data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-emergency`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};

export const updateEmergencyStatus = async (id: string, status: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-emergency/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};

export const updateBedAvailability = async (hospitalId: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-beds/${hospitalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};

export const getAssignedEmergencies = async (driverId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/${driverId}/emergencies`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { data: [] };
  }
};

export const acceptEmergency = async (emergencyId: string, driverId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/emergency/${emergencyId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId })
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};

export const rejectEmergency = async (emergencyId: string, driverId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/emergency/${emergencyId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId })
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};