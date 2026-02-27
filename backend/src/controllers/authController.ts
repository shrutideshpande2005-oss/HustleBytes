import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_key_123';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_type, full_name, phone_number, password, email, license_number, hospital_id, blood_group } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ phone_number });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Phone number already registered' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            user_type,
            full_name,
            phone_number,
            email,
            password_hash,
            license_number,
            hospital_id,
            blood_group
        });

        await newUser.save();

        res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone_number, password } = req.body;

        const user = await User.findOne({ phone_number });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user._id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                full_name: user.full_name,
                user_type: user.user_type
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
