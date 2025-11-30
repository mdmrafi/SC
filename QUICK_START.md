# 🚀 Quick Start Guide - SUST Connect Backend

## What's Been Built

Your complete social media backend with:
- ✅ User authentication (Clerk integration)
- ✅ Real-time messaging (Socket.io)
- ✅ Connection/friend requests
- ✅ Posts with likes & comments
- ✅ User profiles & search
- ✅ All API endpoints
- ✅ Database models & schemas

---

## 5-Minute Setup

### Step 1: Configure Environment

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net
CLERK_SECRET_KEY=sk_test_xxxxx  # From Clerk Dashboard
PORT=4000
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # From Clerk Dashboard
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

### Step 2: Install & Run

**Terminal 1 - Backend:**
```bash
cd server
npm run server  # Runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev  # Runs on http://localhost:5173
```

That's it! 🎉

---

## API Quick Reference

### Send a Message
```javascript
const token = await user.getIdToken();
const result = await fetch('http://localhost:4000/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to_user_id: 'user_123',
    text: 'Hello!',
    message_type: 'text'
  })
});
```

### Get Conversations
```javascript
const result = await fetch('http://localhost:4000/api/messages/conversations', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Send Connection Request
```javascript
const result = await fetch('http://localhost:4000/api/connections/send-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to_user_id: 'user_123',
    message: 'Let\'s connect!'
  })
});
```

### Create a Post
```javascript
const result = await fetch('http://localhost:4000/api/posts/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Post',
    content: 'This is my first post!',
    visibility: 'public'
  })
});
```

### Real-Time Messaging with Socket.io
```javascript
import { initializeSocket, getSocket } from './utils/api';

// Initialize when user logs in
useEffect(() => {
  const socket = initializeSocket(userId);

  socket.on('message-received', (message) => {
    console.log('New message:', message);
  });

  return () => socket.disconnect();
}, []);

// Send message via socket (instant delivery)
const socket = getSocket();
socket.emit('send-message', {
  from_user_id: currentUserId,
  to_user_id: recipientId,
  text: 'Hello!',
  message_type: 'text'
});
```

---

## Database Structure

### Users Collection
```javascript
{
  _id: "clerk_user_id",
  email: "user@sust.edu",
  full_name: "John Doe",
  username: "johndoe",
  profile_picture: "url",
  bio: "Student at SUST",
  followers: [],
  following: [],
  connections: [],
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  from_user_id: "user_1",
  to_user_id: "user_2",
  text: "Hello!",
  message_type: "text",
  isRead: false,
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  author_id: "user_1",
  content: "My first post!",
  likes: [],
  comments: [{user_id: "user_2", text: "Great!"}],
  visibility: "public",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Connection Requests Collection
```javascript
{
  _id: ObjectId,
  from_user_id: "user_1",
  to_user_id: "user_2",
  status: "pending",
  createdAt: "2024-01-01T00:00:00Z"
}
```

---

## File Structure

```
SC/
├── client/
│   ├── src/
│   │   ├── utils/api.js       ← All API functions here
│   │   ├── pages/
│   │   │   ├── Feed.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── Connections.jsx
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── .env
│
├── server/
│   ├── models/
│   │   ├── User.js           ← Updated user model
│   │   ├── Message.js        ← New: message model
│   │   ├── Post.js           ← New: post model
│   │   └── ConnectionRequest.js ← New: connection model
│   │
│   ├── routes/
│   │   ├── users.js          ← User endpoints
│   │   ├── messages.js       ← Message endpoints
│   │   ├── posts.js          ← Post endpoints
│   │   └── connections.js    ← Connection endpoints
│   │
│   ├── middleware/
│   │   └── auth.js           ← Authentication middleware
│   │
│   ├── sockets/
│   │   └── socketHandler.js  ← Real-time socket events
│   │
│   ├── server.js             ← Main server (updated)
│   ├── package.json
│   └── .env
```

---

## Endpoints Cheat Sheet

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/users/:userId` | No | Get user profile |
| GET | `/api/users/search/:query` | No | Search users |
| PUT | `/api/users/update` | **Yes** | Update profile |
| POST | `/api/messages/send` | **Yes** | Send message |
| GET | `/api/messages/conversation/:userId` | **Yes** | Get messages |
| GET | `/api/messages/conversations` | **Yes** | Get all chats |
| POST | `/api/connections/send-request` | **Yes** | Send request |
| GET | `/api/connections/pending-requests` | **Yes** | Pending requests |
| POST | `/api/connections/accept-request/:id` | **Yes** | Accept request |
| POST | `/api/posts/create` | **Yes** | Create post |
| GET | `/api/posts/feed` | **Yes** | Get feed |
| POST | `/api/posts/:id/like` | **Yes** | Like post |
| POST | `/api/posts/:id/comment` | **Yes** | Add comment |

---

## Common Tasks

### Get Current User Profile
```javascript
import { userAPI, useAuthToken } from './utils/api';

const Profile = () => {
  const token = useAuthToken();
  const [user, setUser] = useState(null);

  useEffect(() => {
    userAPI.getProfile(token).then(res => {
      if (res.success) setUser(res.user);
    });
  }, [token]);

  return <div>{user?.full_name}</div>;
};
```

### Display Messages
```javascript
import { messageAPI, useAuthToken } from './utils/api';

const ChatBox = ({ userId }) => {
  const token = useAuthToken();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    messageAPI.getConversation(token, userId).then(res => {
      if (res.success) setMessages(res.messages);
    });
  }, [token, userId]);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>{msg.text}</div>
      ))}
    </div>
  );
};
```

### Display Feed
```javascript
import { postAPI, useAuthToken } from './utils/api';

const Feed = () => {
  const token = useAuthToken();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    postAPI.getFeed(token).then(res => {
      if (res.success) setPosts(res.posts);
    });
  }, [token]);

  return (
    <div>
      {posts.map(post => (
        <div key={post._id}>
          <h3>{post.author_id.full_name}</h3>
          <p>{post.content}</p>
          <button onClick={() => postAPI.likePost(token, post._id)}>
            Like ({post.likes.length})
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :4000
kill -9 <PID>
```

### MongoDB Connection Error
- Check connection string in `.env`
- Verify IP address is whitelisted in MongoDB Atlas
- Ensure database user has correct password

### Socket.io Not Connecting
- Check both client and server running
- Verify `VITE_SOCKET_URL` matches server URL
- Check browser console for errors

### Authentication Fails
- Verify Clerk keys are correct
- Check token is passed in header
- Ensure user exists in MongoDB

---

## Production Deployment

### Environment Variables for Production
```env
MONGODB_URL=<production-mongodb-url>
CLERK_SECRET_KEY=<production-clerk-key>
CLIENT_URL=https://yourdomain.com
PORT=4000
NODE_ENV=production
```

### Deploy Backend to Render
1. Push to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!

### Deploy Frontend to Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

---

## Need Help?

- Check `server/SETUP_GUIDE.md` for detailed setup
- Check `IMPLEMENTATION_COMPLETE.md` for full documentation
- Check browser console for errors
- Check server logs for API errors

---

**You're all set! Start building! 🚀**
