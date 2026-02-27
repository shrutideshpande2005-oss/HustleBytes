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

  on: (event: string, callback: Function) => {
    console.log("Mock socket listening to:", event);
  },

  off: (event: string, callback?: Function) => {
    console.log("Mock socket stopped listening to:", event);
  },
};

export const SOCKET_EVENTS = {
  LOCATION_UPDATE: "location_update",
  EMERGENCY_STATUS: "emergency_status",
  NEW_EMERGENCY: "new_emergency",
  STATUS_UPDATE: "status_update",
};

export default socketService;