import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './configs/db.js';
import { inngest, functions } from './inggest/index.js';
import { serve } from 'inngest/express'
import { clerkMiddleware } from '@clerk/express'

// Load environment variables FIRST
dotenv.config();

console.log('Environment Debug:', {
    hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
    clerkSecretPrefix: process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 7) : 'missing',
    hasClerkPublishable: !!process.env.CLERK_PUBLISHABLE_KEY
});

// Import routes
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import connectionRoutes from './routes/connections.js';
import postRoutes from './routes/posts.js';
import uploadRoutes from './routes/uploads.js';
import storyRoutes from './routes/stories.js';

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

// Clerk middleware should come BEFORE body parsers but AFTER CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Clerk middleware - explicit keys to handle potential environment loading issues
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Routes
app.get('/', (req, res) => res.send('SUST Connect Server is running'));

// Setup Socket.io
const { activeUsers } = await import('./sockets/socketHandler.js');
const { setupSocketIO } = await import('./sockets/socketHandler.js');
setupSocketIO(io);

// Make io and activeUsers accessible to routes
app.set('io', io);
app.set('activeUsers', activeUsers);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stories', storyRoutes);

app.use('/api/inngest', serve({ client: inngest, functions }));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`✅ SUST Connect Server is running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready for real-time communication`);
    console.log(`🔑 Clerk authentication enabled`);
});

