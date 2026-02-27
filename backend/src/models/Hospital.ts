import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
    name: string;
    address: string;
    lat: number;
    lon: number;
    icu_beds_total: number;
    icu_beds_available: number;
    general_beds_total: number;
    general_beds_available: number;
    blood_bank: {
        'A+': number;
        'A-': number;
        'B+': number;
        'B-': number;
        'O+': number;
        'O-': number;
        'AB+': number;
        'AB-': number;
    };
    contact_number: string;
    updated_at: Date;
}

const hospitalSchema: Schema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    icu_beds_total: { type: Number, default: 0 },
    icu_beds_available: { type: Number, default: 0 },
    general_beds_total: { type: Number, default: 0 },
    general_beds_available: { type: Number, default: 0 },
    blood_bank: {
        'A+': { type: Number, default: 0 },
        'A-': { type: Number, default: 0 },
        'B+': { type: Number, default: 0 },
        'B-': { type: Number, default: 0 },
        'O+': { type: Number, default: 0 },
        'O-': { type: Number, default: 0 },
        'AB+': { type: Number, default: 0 },
        'AB-': { type: Number, default: 0 },
    },
    contact_number: { type: String },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IHospital>('Hospital', hospitalSchema);
