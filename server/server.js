import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './configs/db.js';
import {inngest, functions} from './inggest/index.js';
import {serve} from 'inngest/express'
import { setupSocketIO } from './sockets/socketHandler.js';

// Import routes
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import connectionRoutes from './routes/connections.js';
import postRoutes from './routes/posts.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

await connectDB();

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Routes
app.get('/', (req, res)=> res.send('SUST Connect Server is running'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postRoutes);

app.use('/api/inngest', serve({ client: inngest, functions}));

// Setup Socket.io
setupSocketIO(io);

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({success: false, message: 'Route not found'});
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({success: false, message: 'Internal server error', error: err.message});
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, ()=> {
    console.log(`✅ SUST Connect Server is running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready for real-time communication`);
});

