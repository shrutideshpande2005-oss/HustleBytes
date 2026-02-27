import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    user_type: 'citizen' | 'driver' | 'hospital' | 'volunteer' | 'admin';
    full_name: string;
    phone_number: string;
    email?: string;
    password_hash: string;
    is_verified: boolean;
    // Role-specific optional fields
    license_number?: string;
    hospital_id?: string;
    blood_group?: string;
    created_at: Date;
}

const userSchema: Schema = new Schema({
    user_type: {
        type: String,
        enum: ['citizen', 'driver', 'hospital', 'volunteer', 'admin'],
        required: true
    },
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password_hash: { type: String, required: true },
    is_verified: { type: Boolean, default: false },

    // Role-specific fields 
    license_number: { type: String }, // For drivers
    hospital_id: { type: String }, // For hospital staff
    blood_group: { type: String }, // For citizens/volunteers

    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);
