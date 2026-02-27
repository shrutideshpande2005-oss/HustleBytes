// Temporary mock socket service

const socketService = {
  connect: () => {
    console.log("Mock socket connected");
  },
  disconnect: () => {
    console.log("Mock socket disconnected");
  },
  emit: (event: string, data: any) => {
    console.log("Mock socket emit:", event, data);
  },
};

export const SOCKET_EVENTS = {
  LOCATION_UPDATE: "location_update",
  EMERGENCY_STATUS: "emergency_status",
};

export default socketService;