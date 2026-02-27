import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSockets } from './sockets/socketManager';
import emergencyRoutes from './routes/emergencyRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);

app.get('/', (req, res) => {
    res.send('HustleBytes Emergency Backend is running.');
});

// Setup Websockets
setupSockets(io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hustlebytes';

// Connect to Database and start server
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection failed', err);
    });
