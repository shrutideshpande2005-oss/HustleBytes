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