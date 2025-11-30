# SUST Connect Backend Setup Guide

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account or local MongoDB instance
- Clerk account for authentication

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

This will install:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **socket.io** - Real-time bidirectional communication
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload handling
- **cloudinary** - Cloud storage for images
- **inngest** - Background job queue

### 2. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net

# JWT Secret (for optional API authentication)
JWT_SECRET=your_super_secret_jwt_key_12345

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key

# Server Configuration
PORT=4000
CLIENT_URL=http://localhost:5173

# Inngest API Key (for background jobs)
INNGEST_API_KEY=your_inngest_api_key

# Cloudinary (optional, for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. MongoDB Setup

1. Create a MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Add it to your `.env` file as `MONGODB_URL`

## Project Structure

```
server/
├── configs/          # Configuration files
│   └── db.js         # MongoDB connection
├── middleware/       # Express middleware
│   └── auth.js       # Authentication middleware
├── models/          # Mongoose schemas
│   ├── User.js      # User model
│   ├── Message.js   # Message model
│   ├── Post.js      # Post model
│   └── ConnectionRequest.js  # Connection request model
├── routes/          # API routes
│   ├── users.js     # User endpoints
│   ├── messages.js  # Messaging endpoints
│   ├── posts.js     # Post endpoints
│   └── connections.js  # Connection request endpoints
├── sockets/         # Socket.io setup
│   └── socketHandler.js  # Real-time events
├── inggest/         # Background jobs
│   └── index.js     # Inngest functions for Clerk sync
├── server.js        # Main server file
└── package.json
```

## API Endpoints

### Users (`/api/users`)
- `GET /profile` - Get current user profile (auth required)
- `GET /:userId` - Get user by ID
- `PUT /update` - Update user profile (auth required)
- `GET /search/:query` - Search users by name/username/email
- `GET /` - Get all users

### Messages (`/api/messages`)
- `POST /send` - Send a message (auth required)
- `GET /conversation/:userId` - Get messages with a user (auth required)
- `GET /conversations` - Get all conversations (auth required)
- `PUT /mark-read/:messageId` - Mark message as read (auth required)
- `DELETE /:messageId` - Delete message (auth required)

### Connections (`/api/connections`)
- `POST /send-request` - Send connection request (auth required)
- `GET /pending-requests` - Get pending requests for current user (auth required)
- `GET /sent-requests` - Get sent requests from current user (auth required)
- `POST /accept-request/:requestId` - Accept request (auth required)
- `POST /decline-request/:requestId` - Decline request (auth required)
- `DELETE /cancel-request/:requestId` - Cancel sent request (auth required)
- `GET /:userId/connections` - Get user's connections

### Posts (`/api/posts`)
- `POST /create` - Create a post (auth required)
- `GET /feed` - Get feed posts (auth required, with pagination)
- `GET /user/:userId` - Get user's posts
- `GET /:postId` - Get single post
- `POST /:postId/like` - Like/unlike post (auth required)
- `POST /:postId/comment` - Add comment to post (auth required)
- `DELETE /:postId/comment/:commentIndex` - Delete comment (auth required)
- `DELETE /:postId` - Delete post (auth required)

## Socket.io Events

### Client to Server
- `user-join` - Notify server user is online (emit userId)
- `user-typing` - Notify user is typing (emit {from_user_id, to_user_id})
- `send-message` - Send message via socket
- `message-read` - Mark message as read
- `user-status` - Update user status

### Server to Client
- `user-status-changed` - User online/offline status
- `user-typing` - User is typing notification
- `message-received` - New message received
- `message-sent` - Message sent confirmation
- `message-read-notification` - Message read by recipient

## Running the Server

### Development Mode
```bash
npm run server
```
This uses nodemon for auto-restart on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:4000` and connect to MongoDB.

## Database Models

### User Schema
```javascript
{
  _id: String (Clerk user ID),
  email: String (unique),
  full_name: String,
  username: String (unique),
  password: String (optional),
  bio: String,
  profile_picture: String,
  cover_photo: String,
  location: String,
  department: String,
  year: String,
  followers: [userId],
  following: [userId],
  connections: [userId],
  isVerified: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  from_user_id: String (ref: User),
  to_user_id: String (ref: User),
  text: String,
  media_url: String,
  message_type: 'text' | 'image',
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Post Schema
```javascript
{
  _id: ObjectId,
  author_id: String (ref: User),
  title: String,
  content: String (required),
  image_url: String,
  likes: [userId],
  comments: [{user_id, text, createdAt}],
  shares: Number,
  visibility: 'public' | 'connections' | 'private',
  createdAt: Date,
  updatedAt: Date
}
```

### ConnectionRequest Schema
```javascript
{
  _id: ObjectId,
  from_user_id: String (ref: User),
  to_user_id: String (ref: User),
  status: 'pending' | 'accepted' | 'declined',
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

1. User logs in via Clerk on the frontend
2. Clerk provides an ID token
3. Client sends token in Authorization header: `Bearer {token}`
4. Backend verifies token using Clerk's verification
5. Request is processed with authenticated user context

## Real-Time Features

The server uses Socket.io for:
- **Real-time messaging** - Messages delivered instantly
- **User status** - Show who's online/offline
- **Typing indicators** - See when someone is typing
- **Message read receipts** - Know when message is read

## Features Implemented

✅ User Registration (via Clerk)
✅ User Profiles (create, read, update)
✅ Messaging System (send, receive, read, delete)
✅ Connection Requests (send, accept, decline)
✅ Posts (create, read, like, comment)
✅ Real-time Communication (Socket.io)
✅ Search Functionality
✅ Conversation Management

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct

### Socket.io Connection Issues
- Check CORS settings match client URL
- Verify client and server are on expected ports
- Check browser console for connection errors

### Authentication Issues
- Ensure Clerk keys are set correctly
- Verify token is being passed in headers
- Check token hasn't expired

## Next Steps

1. Set up Cloudinary for image uploads
2. Implement file upload endpoints
3. Add email notifications
4. Set up admin dashboard
5. Implement analytics
6. Deploy to Vercel/Render

## Support

For issues or questions, check:
- MongoDB documentation: https://docs.mongodb.com
- Express documentation: https://expressjs.com
- Socket.io documentation: https://socket.io
- Clerk documentation: https://clerk.com/docs
