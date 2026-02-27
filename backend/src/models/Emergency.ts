import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergency extends Document {
    description: string;
    lat: number;
    lon: number;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    status: string;
    ambulance_id?: string;
    hospital_id?: string;
    hospital_name?: string;
    citizen_name?: string;
    citizen_phone?: string;
    created_at: Date;
}

const emergencySchema: Schema = new Schema({
    description: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
    status: { type: String, default: 'pending' },
    ambulance_id: { type: String },
    hospital_id: { type: String },
    hospital_name: { type: String },
    citizen_name: { type: String },
    citizen_phone: { type: String },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IEmergency>('Emergency', emergencySchema);
