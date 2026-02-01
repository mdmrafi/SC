import Story from '../models/Story.js';
import User from '../models/User.js';

// Create a new story
export const createStory = async (req, res) => {
    try {
        const { media_url, media_type, text, background_color } = req.body;

        if (!media_url && !text) {
            return res.status(400).json({
                success: false,
                message: 'Story must contain either media or text'
            });
        }

        const story = new Story({
            user_id: req.userId,
            media_url,
            media_type: media_type || (media_url ? 'image' : 'text'),
            text,
            background_color: background_color || '#1e293b'
        });

        await story.save();
        await story.populate('user_id', 'full_name username profile_picture');

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('story-added', {
                userId: req.userId,
                storyId: story._id
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story
        });
    } catch (error) {
        console.error('Create story error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get stories from connected users only
export const getConnectionStories = async (req, res) => {
    try {
        // Get current user's connections
        const currentUser = await User.findById(req.userId).select('connections');
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const connectionIds = currentUser.connections || [];

        // Get active stories from connections + own stories
        const now = new Date();
        const stories = await Story.find({
            user_id: { $in: [...connectionIds, req.userId] },
            expires_at: { $gt: now }
        })
            .populate('user_id', 'full_name username profile_picture')
            .populate('views.user_id', 'full_name username profile_picture')
            .sort({ createdAt: -1 });

        // Group stories by user
        const groupedStories = stories.reduce((acc, story) => {
            const userId = story.user_id._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.user_id,
                    stories: [],
                    hasUnviewed: false
                };
            }
            acc[userId].stories.push(story);

            // Check if current user has viewed this story
            const hasViewed = story.views.some(v => v.user_id._id.toString() === req.userId);
            if (!hasViewed) {
                acc[userId].hasUnviewed = true;
            }

            return acc;
        }, {});

        // Convert to array and sort (own stories first, then unviewed, then viewed)
        const storyGroups = Object.values(groupedStories).sort((a, b) => {
            if (a.user._id.toString() === req.userId) return -1;
            if (b.user._id.toString() === req.userId) return 1;
            if (a.hasUnviewed && !b.hasUnviewed) return -1;
            if (!a.hasUnviewed && b.hasUnviewed) return 1;
            return 0;
        });

        return res.status(200).json({ success: true, stories: storyGroups });
    } catch (error) {
        console.error('Get connection stories error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark story as viewed
export const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check if already viewed
        const alreadyViewed = story.views.some(v => v.user_id.toString() === req.userId);
        if (!alreadyViewed) {
            story.views.push({ user_id: req.userId });
            await story.save();
        }

        return res.status(200).json({ success: true, message: 'Story viewed' });
    } catch (error) {
        console.error('View story error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete own story
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        if (story.user_id.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await Story.findByIdAndDelete(storyId);

        return res.status(200).json({ success: true, message: 'Story deleted' });
    } catch (error) {
        console.error('Delete story error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    createStory,
    getConnectionStories,
    viewStory,
    deleteStory
};
