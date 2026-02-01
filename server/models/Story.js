import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    media_url: {
        type: String,
        default: ''
    },
    media_type: {
        type: String,
        enum: ['image', 'video', 'text'],
        default: 'text'
    },
    text: {
        type: String,
        default: ''
    },
    background_color: {
        type: String,
        default: '#1e293b' // slate-900 for text-only stories
    },
    views: [{
        user_id: {
            type: String,
            ref: 'User'
        },
        viewed_at: {
            type: Date,
            default: Date.now
        }
    }],
    expires_at: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, {
    timestamps: true
});

// Index for automatic deletion of expired stories
storySchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index for querying active stories
storySchema.index({ user_id: 1, expires_at: 1 });

const Story = mongoose.model('Story', storySchema);

export default Story;
