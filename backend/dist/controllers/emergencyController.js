"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmergencyStatus = exports.getEmergencies = exports.createEmergency = void 0;
const Emergency_1 = __importDefault(require("../models/Emergency"));
const createEmergency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { description, lat, lon, severity, citizen_name, citizen_phone } = req.body;
        const newEmergency = new Emergency_1.default({
            description,
            lat,
            lon,
            severity,
            citizen_name,
            citizen_phone,
            status: 'pending'
        });
        yield newEmergency.save();
        res.status(201).json({ success: true, emergency: newEmergency });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});
exports.createEmergency = createEmergency;
const getEmergencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emergencies = yield Emergency_1.default.find().sort({ created_at: -1 });
        res.status(200).json({ success: true, emergencies });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});
exports.getEmergencies = getEmergencies;
const updateEmergencyStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, ambulance_id } = req.body;
        const updatedEmergency = yield Emergency_1.default.findByIdAndUpdate(id, Object.assign({ status }, (ambulance_id && { ambulance_id })), { new: true });
        if (!updatedEmergency) {
            res.status(404).json({ success: false, error: 'Emergency not found' });
            return;
        }
        res.status(200).json({ success: true, emergency: updatedEmergency });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});
exports.updateEmergencyStatus = updateEmergencyStatus;
