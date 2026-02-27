"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socketManager_1 = require("./sockets/socketManager");
const emergencyRoutes_1 = __importDefault(require("./routes/emergencyRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// REST API Routes
app.use('/api/emergency', emergencyRoutes_1.default);
app.get('/', (req, res) => {
    res.send('HustleBytes Emergency Backend is running.');
});
// Setup Websockets
(0, socketManager_1.setupSockets)(io);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hustlebytes';
// Connect to Database and start server
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('MongoDB Connected Successfully!');
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('Database connection failed', err);
});
