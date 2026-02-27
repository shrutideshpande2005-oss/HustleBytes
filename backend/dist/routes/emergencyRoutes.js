"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emergencyController_1 = require("../controllers/emergencyController");
const router = (0, express_1.Router)();
// REST API Endpoints
router.post('/create', emergencyController_1.createEmergency);
router.get('/all', emergencyController_1.getEmergencies);
router.patch('/:id/status', emergencyController_1.updateEmergencyStatus);
exports.default = router;
