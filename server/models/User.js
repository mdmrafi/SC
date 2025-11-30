import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String},
    email: {type: String, required: true, unique: true},
    full_name: {type: String, required: true},
    username: {type: String, unique: true, sparse: true},
    password: {type: String},
    bio: {type: String, default: ''},
    profile_picture: {type: String, default: ''},
    cover_photo: {type: String, default: ''},
    location: {type: String, default: ''},
    department: {type: String, default: ''},
    year: {type: String, default: ''},
    followers: [{type: String, ref: 'User'}],
    following: [{type: String, ref: 'User'}],
    connections: [{type: String, ref: 'User'}],
    isVerified: {type: Boolean, default: false},
    lastSeen: {type: Date, default: Date.now},
}, {collection: 'users', timestamps: true, minimize: false});

// Ensure unique index for email and username
const User = mongoose.model('User', userSchema, 'users');

export default User;