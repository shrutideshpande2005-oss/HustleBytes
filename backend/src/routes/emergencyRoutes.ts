import { Router } from 'express';
import { createEmergency, getEmergencies, updateEmergencyStatus, getAssignedEmergencies, acceptEmergency, rejectEmergency, updateBeds } from '../controllers/emergencyController';

const router = Router();

// REST API Endpoints
router.post('/create-emergency', createEmergency);
router.put('/update-emergency/:id', updateEmergencyStatus);
router.get('/driver/:driverId/emergencies', getAssignedEmergencies);
router.post('/emergency/:id/accept', acceptEmergency);
router.post('/emergency/:id/reject', rejectEmergency);
router.put('/update-beds/:hospitalId', updateBeds);

// General Endpoints
router.get('/all', getEmergencies);
router.patch('/:id/status', updateEmergencyStatus);

export default router;
