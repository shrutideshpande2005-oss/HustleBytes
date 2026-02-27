import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export const setupSockets = (io: Server) => {
    ioInstance = io;

    // We can store active users/ambulances in memory or Redis. 
    // For the hackathon, in-memory is fastest.
    const activeAmbulances = new Map<string, any>();

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Volunteer or Driver emitting location
        socket.on('LOCATION_UPDATE', (data: any) => {
            // data contains: driverId, lat, lon
            // console.log(`Location update from ${data.driverId || data.volunteerId}`);

            // Broadcast to all admins or citizens tracking this specific entity
            // Instead of filtering, we just broadcast for now:
            socket.broadcast.emit('LOCATION_UPDATE', data);
        });

        // Trigger a new emergency (likely sent from an API or Citizen App)
        socket.on('EMERGENCY_CREATED', (data: any) => {
            console.log('🚨 New Emergency created!', data);

            // Broadcast to volunteers and drivers
            io.emit('new_emergency', data);
        });

        // Whenever an ambulance or volunteer clicks "Arrived" or "Accepted"
        socket.on('STATUS_UPDATE', (data: any) => {
            console.log(`Status changed for ${data.emergency_id}: ${data.status}`);

            // Let the Admin dashboard and citizen know
            io.emit('STATUS_UPDATE', data);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};

export const getIO = (): Server => {
    if (!ioInstance) {
        throw new Error("Socket.io has not been initialized yet!");
    }
    return ioInstance;
};
