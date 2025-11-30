import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
    from_user_id: {type: String, required: true, ref: 'User'},
    to_user_id: {type: String, required: true, ref: 'User'},
    status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending'},
    message: {type: String, default: ''},
}, {timestamps: true});

// Ensure a user can't send multiple pending requests to the same person
connectionRequestSchema.index({from_user_id: 1, to_user_id: 1, status: 1});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema, 'connectionrequests');

export default ConnectionRequest;
