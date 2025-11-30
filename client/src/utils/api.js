import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

// Initialize socket connection
export const initializeSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('user-join', userId);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }
    return socket;
};

export const getSocket = () => socket;

// User API calls
export const userAPI = {
    getProfile: async (token) => {
        return fetch(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    getUserById: async (userId) => {
        return fetch(`${API_URL}/users/${userId}`).then(r => r.json());
    },

    updateProfile: async (token, data) => {
        return fetch(`${API_URL}/users/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json());
    },

    searchUsers: async (query) => {
        return fetch(`${API_URL}/users/search/${query}`).then(r => r.json());
    },

    getAllUsers: async () => {
        return fetch(`${API_URL}/users`).then(r => r.json());
    }
};

// Message API calls
export const messageAPI = {
    sendMessage: async (token, to_user_id, text, media_url, message_type) => {
        return fetch(`${API_URL}/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ to_user_id, text, media_url, message_type })
        }).then(r => r.json());
    },

    getConversation: async (token, userId) => {
        return fetch(`${API_URL}/messages/conversation/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    getConversations: async (token) => {
        return fetch(`${API_URL}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    markAsRead: async (token, messageId) => {
        return fetch(`${API_URL}/messages/mark-read/${messageId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    deleteMessage: async (token, messageId) => {
        return fetch(`${API_URL}/messages/${messageId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    }
};

// Connection API calls
export const connectionAPI = {
    sendRequest: async (token, to_user_id, message) => {
        return fetch(`${API_URL}/connections/send-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ to_user_id, message })
        }).then(r => r.json());
    },

    getPendingRequests: async (token) => {
        return fetch(`${API_URL}/connections/pending-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    getSentRequests: async (token) => {
        return fetch(`${API_URL}/connections/sent-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    acceptRequest: async (token, requestId) => {
        return fetch(`${API_URL}/connections/accept-request/${requestId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    declineRequest: async (token, requestId) => {
        return fetch(`${API_URL}/connections/decline-request/${requestId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    cancelRequest: async (token, requestId) => {
        return fetch(`${API_URL}/connections/cancel-request/${requestId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    getUserConnections: async (userId) => {
        return fetch(`${API_URL}/connections/${userId}/connections`).then(r => r.json());
    }
};

// Post API calls
export const postAPI = {
    createPost: async (token, title, content, image_url, visibility) => {
        return fetch(`${API_URL}/posts/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, image_url, visibility })
        }).then(r => r.json());
    },

    getFeed: async (token, page = 1) => {
        return fetch(`${API_URL}/posts/feed?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    getUserPosts: async (userId) => {
        return fetch(`${API_URL}/posts/user/${userId}`).then(r => r.json());
    },

    getPost: async (postId) => {
        return fetch(`${API_URL}/posts/${postId}`).then(r => r.json());
    },

    likePost: async (token, postId) => {
        return fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    addComment: async (token, postId, text) => {
        return fetch(`${API_URL}/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        }).then(r => r.json());
    },

    deleteComment: async (token, postId, commentIndex) => {
        return fetch(`${API_URL}/posts/${postId}/comment/${commentIndex}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    },

    deletePost: async (token, postId) => {
        return fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
    }
};

// Custom hook for token
export const useAuthToken = () => {
    const { user, isLoaded } = useUser();
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (isLoaded && user) {
            user.getIdToken().then(setToken);
        }
    }, [user, isLoaded]);

    return token;
};
