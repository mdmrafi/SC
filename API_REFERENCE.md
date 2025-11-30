# 📚 Backend API Reference Sheet

## Base URL
```
http://localhost:4000/api
```

## Authentication
All endpoints marked with 🔒 require:
```
Header: Authorization: Bearer {token}
```

Get token in frontend:
```javascript
const token = await user.getIdToken(); // From Clerk
```

---

## 👥 Users Endpoints

### Get Current User Profile 🔒
```
GET /users/profile
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@sust.edu",
    "full_name": "John Doe",
    "username": "johndoe",
    "profile_picture": "url",
    "bio": "Student",
    "followers": [],
    "following": [],
    "connections": []
  }
}
```

### Get User by ID
```
GET /users/:userId

Response:
{
  "success": true,
  "user": { ...user object... }
}
```

### Update Profile 🔒
```
PUT /users/update
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "username": "johndoe",
  "bio": "SUST Student",
  "location": "Sylhet",
  "department": "CSE",
  "year": "3rd",
  "cover_photo": "url"
}

Response:
{
  "success": true,
  "message": "Profile updated",
  "user": { ...updated user... }
}
```

### Search Users
```
GET /users/search/{query}

Example:
GET /users/search/john

Response:
{
  "success": true,
  "users": [
    { user object },
    { user object }
  ]
}
```

### Get All Users
```
GET /users

Response:
{
  "success": true,
  "users": [ ...array of users... ]
}
```

---

## 💬 Messages Endpoints

### Send Message 🔒
```
POST /messages/send
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "to_user_id": "user_id",
  "text": "Hello!",
  "media_url": "", // optional
  "message_type": "text" // or "image"
}

Response:
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "msg_id",
    "from_user_id": { ...user... },
    "to_user_id": "user_id",
    "text": "Hello!",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Conversation 🔒
```
GET /messages/conversation/:userId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "messages": [
    {
      "_id": "msg_id",
      "from_user_id": { ...user... },
      "to_user_id": { ...user... },
      "text": "Hi",
      "isRead": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get All Conversations 🔒
```
GET /messages/conversations
Authorization: Bearer {token}

Response:
{
  "success": true,
  "conversations": [
    {
      "_id": "user_id",
      "user": { ...user... },
      "lastMessage": { ...message... },
      "unreadCount": 3
    }
  ]
}
```

### Mark as Read 🔒
```
PUT /messages/mark-read/:messageId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": { ...updated message... }
}
```

### Delete Message 🔒
```
DELETE /messages/:messageId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Message deleted"
}
```

---

## 🤝 Connections Endpoints

### Send Connection Request 🔒
```
POST /connections/send-request
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "to_user_id": "user_id",
  "message": "Let's connect!" // optional
}

Response:
{
  "success": true,
  "message": "Connection request sent",
  "data": {
    "_id": "req_id",
    "from_user_id": { ...user... },
    "to_user_id": { ...user... },
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Pending Requests 🔒
```
GET /connections/pending-requests
Authorization: Bearer {token}

Response:
{
  "success": true,
  "requests": [
    {
      "_id": "req_id",
      "from_user_id": { ...user... },
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Sent Requests 🔒
```
GET /connections/sent-requests
Authorization: Bearer {token}

Response:
{
  "success": true,
  "requests": [
    {
      "_id": "req_id",
      "to_user_id": { ...user... },
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Accept Request 🔒
```
POST /connections/accept-request/:requestId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Connection request accepted",
  "data": { ...request with status "accepted"... }
}
```

### Decline Request 🔒
```
POST /connections/decline-request/:requestId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Connection request declined",
  "data": { ...request with status "declined"... }
}
```

### Cancel Sent Request 🔒
```
DELETE /connections/cancel-request/:requestId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Request cancelled"
}
```

### Get User Connections
```
GET /connections/:userId/connections

Response:
{
  "success": true,
  "connections": [
    { ...user object... },
    { ...user object... }
  ]
}
```

---

## 📝 Posts Endpoints

### Create Post 🔒
```
POST /posts/create
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "My Post", // optional
  "content": "This is my first post!",
  "image_url": "", // optional
  "visibility": "public" // public, connections, private
}

Response:
{
  "success": true,
  "message": "Post created",
  "data": {
    "_id": "post_id",
    "author_id": { ...user... },
    "content": "This is my first post!",
    "likes": [],
    "comments": [],
    "visibility": "public",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Feed 🔒
```
GET /posts/feed?page=1
Authorization: Bearer {token}

Response:
{
  "success": true,
  "posts": [ ...array of posts... ],
  "total": 50,
  "page": 1,
  "pages": 5
}
```

### Get User Posts
```
GET /posts/user/:userId

Response:
{
  "success": true,
  "posts": [ ...array of posts... ]
}
```

### Get Single Post
```
GET /posts/:postId

Response:
{
  "success": true,
  "post": {
    "_id": "post_id",
    "author_id": { ...user... },
    "content": "Post content",
    "likes": [ ...user ids... ],
    "comments": [
      {
        "user_id": { ...user... },
        "text": "Great post!",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Like/Unlike Post 🔒
```
POST /posts/:postId/like
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post liked/unliked",
  "data": {
    "_id": "post_id",
    "likes": [ "user_id", "user_id2" ],
    ...rest of post...
  }
}
```

### Add Comment 🔒
```
POST /posts/:postId/comment
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "text": "Great post!"
}

Response:
{
  "success": true,
  "message": "Comment added",
  "data": {
    "_id": "post_id",
    "comments": [
      {
        "user_id": { ...user... },
        "text": "Great post!",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    ...rest of post...
  }
}
```

### Delete Comment 🔒
```
DELETE /posts/:postId/comment/:commentIndex
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Comment deleted",
  "data": { ...updated post... }
}
```

### Delete Post 🔒
```
DELETE /posts/:postId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post deleted"
}
```

---

## 🔌 Socket.io Events

### Client → Server

#### Join as User
```javascript
socket.emit('user-join', userId);
```

#### Send Message
```javascript
socket.emit('send-message', {
  from_user_id: "user1",
  to_user_id: "user2",
  text: "Hello!",
  message_type: "text"
});
```

#### Typing Indicator
```javascript
socket.emit('user-typing', {
  from_user_id: "user1",
  to_user_id: "user2"
});
```

#### Mark Message as Read
```javascript
socket.emit('message-read', messageId);
```

#### Update User Status
```javascript
socket.emit('user-status', {
  userId: "user1",
  status: "online" // or "offline"
});
```

### Server → Client

#### User Status Changed
```javascript
socket.on('user-status-changed', data => {
  // data: {userId, status, lastSeen, activeUsers}
  console.log(`${data.userId} is ${data.status}`);
});
```

#### User Typing
```javascript
socket.on('user-typing', data => {
  // data: {from_user_id, to_user_id}
  console.log(`${data.from_user_id} is typing...`);
});
```

#### Message Received
```javascript
socket.on('message-received', message => {
  console.log('New message:', message);
});
```

#### Message Sent
```javascript
socket.on('message-sent', message => {
  console.log('Message sent:', message);
});
```

#### Message Read Notification
```javascript
socket.on('message-read-notification', data => {
  // data: {messageId, readAt}
  console.log(`Message read at ${data.readAt}`);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Required field missing"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided" or "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found" or "Post not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Common Usage Patterns

### Get and Display User Profile
```javascript
const response = await fetch('http://localhost:4000/api/users/:userId');
const { user } = await response.json();

if (user) {
  console.log(`${user.full_name} (@${user.username})`);
  console.log(`Bio: ${user.bio}`);
  console.log(`Connections: ${user.connections.length}`);
}
```

### Send Message and Listen for Response
```javascript
const token = await user.getIdToken();

// Via REST
const response = await fetch('http://localhost:4000/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to_user_id: recipientId,
    text: 'Hello!',
    message_type: 'text'
  })
});

// Via Socket.io
const socket = io('http://localhost:4000');
socket.on('connect', () => {
  socket.emit('send-message', {
    from_user_id: currentUserId,
    to_user_id: recipientId,
    text: 'Hello!',
    message_type: 'text'
  });
  
  socket.on('message-sent', (message) => {
    console.log('Message delivered:', message);
  });
});
```

### Handle Typing Indicator
```javascript
const socket = io('http://localhost:4000');

// Show that you're typing
socket.emit('user-typing', {
  from_user_id: currentUserId,
  to_user_id: recipientId
});

// Listen for others typing
socket.on('user-typing', (data) => {
  if (data.to_user_id === currentUserId) {
    showTypingIndicator(data.from_user_id);
  }
});

// Clear typing after 3 seconds of inactivity
let typingTimeout;
function onUserType() {
  clearTimeout(typingTimeout);
  socket.emit('user-typing', {
    from_user_id: currentUserId,
    to_user_id: recipientId
  });
  
  typingTimeout = setTimeout(() => {
    // User stopped typing
  }, 3000);
}
```

---

## Rate Limiting (Future)
Currently not implemented but recommended:
- 100 requests per 15 minutes per IP
- 50 messages per hour per user
- 20 connection requests per day per user

---

## Pagination Info
- Posts: 10 items per page
- Messages: Loaded as needed
- Conversations: All loaded
- Users search: Limited to 20 results

---

This reference covers all 27 endpoints and Socket.io events! 🚀
