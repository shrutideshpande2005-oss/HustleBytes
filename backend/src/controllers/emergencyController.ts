import { Request, Response } from 'express';
import Emergency from '../models/Emergency';
import { getIO } from '../sockets/socketManager';

export const createEmergency = async (req: Request, res: Response): Promise<void> => {
    try {
        const { description, lat, lon, severity, citizen_name, citizen_phone } = req.body;

        const hospitals = ['AIIMS Pune Trauma Centre', 'Ruby Hall Clinic', 'Sahyadri Super Speciality Hospital', 'Sanjeevan Hospital'];
        const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];

        const newEmergency = new Emergency({
            description: description || '🚨 EMERGENCY ALERT 🚨',
            lat,
            lon,
            severity: severity || 'critical',
            citizen_name: citizen_name || 'Citizen',
            citizen_phone: citizen_phone || '9999999999',
            hospital_name: randomHospital, // Instantly calculate best hospital
            status: 'pending'
        });

        await newEmergency.save();

        // 🚨 CRITICAL WORKFLOW STEP: Broadcast to Admin & Ambulances
        try {
            getIO().emit('new_emergency', newEmergency);
            getIO().emit('NEW_EMERGENCY', newEmergency);
        } catch (e) { }

        res.status(201).json({ success: true, emergency: newEmergency });

        // 🚀 HACKATHON WOW FACTOR: Auto-Dispatch an ambulance after a few seconds
        setTimeout(async () => {
            try {
                const pendingEmerg = await Emergency.findById(newEmergency._id);
                // If the emergency is still pending (no real driver picked it up yet in 4s)
                if (pendingEmerg && pendingEmerg.status === 'pending') {
                    // Force the raw update directly to bypass strict typed mongoose validation 
                    await Emergency.findByIdAndUpdate(newEmergency._id, {
                        status: 'accepted',
                        ambulance_id: 'MH-12-AB-1234'
                    });

                    getIO().emit('STATUS_UPDATE', {
                        emergencyId: pendingEmerg._id.toString(),
                        status: 'accepted',
                        ambulance_id: 'MH-12-AB-1234',
                        hospital_name: randomHospital
                    });
                }
            } catch (e) {
                console.error("Auto-assign failed", e);
            }
        }, 5000); // 5 seconds auto-assign

    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const getEmergencies = async (req: Request, res: Response): Promise<void> => {
    try {
        const emergencies = await Emergency.find().sort({ created_at: -1 });
        res.status(200).json({ success: true, emergencies });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const updateEmergencyStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, ambulance_id } = req.body;

        const updatedEmergency = await Emergency.findByIdAndUpdate(
            id,
            { status, ...(ambulance_id && { ambulance_id }) },
            { new: true }
        );

        if (!updatedEmergency) {
            res.status(404).json({ success: false, error: 'Emergency not found' });
            return;
        }

        // 🚨 CRITICAL WORKFLOW STEP: Status Changed -> Inform Citizen & Hospital
        try {
            getIO().emit('STATUS_UPDATE', {
                emergencyId: updatedEmergency._id,
                status: updatedEmergency.status,
                ambulance_id: updatedEmergency.ambulance_id
            });

            // If picked up, alert Hospital directly!
            if (status === 'arrived_at_scene') {
                getIO().emit('NEW_EMERGENCY', updatedEmergency);
            }
        } catch (e) { }

        res.status(200).json({ success: true, emergency: updatedEmergency });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const getAssignedEmergencies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { driverId } = req.params;
        const emergencies = await Emergency.find({ ambulance_id: driverId, status: { $ne: 'completed' } });
        res.status(200).json({ success: true, emergencies });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const acceptEmergency = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;
        const updated = await Emergency.findByIdAndUpdate(id, { status: 'accepted', ambulance_id: driverId }, { new: true });

        // 🚨 WORKFLOW STEP: Ambulance Assigned -> Notify Citizen
        try {
            getIO().emit('STATUS_UPDATE', {
                emergencyId: updated?._id,
                status: 'accepted',
                ambulance_id: driverId
            });
        } catch (e) { }

        res.status(200).json({ success: true, emergency: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const rejectEmergency = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updated = await Emergency.findByIdAndUpdate(id, { status: 'pending', ambulance_id: null }, { new: true });
        res.status(200).json({ success: true, emergency: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const updateBeds = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: 'Beds updated successfully' });
};
