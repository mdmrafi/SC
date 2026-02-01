import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { title, content, image_url, visibility } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Post content is required' });

    const post = new Post({ author_id: req.userId, title, content, image_url, visibility: visibility || 'public' });
    await post.save();
    await post.populate('author_id', 'full_name username profile_picture');

    return res.status(201).json({ success: true, message: 'Post created', data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId);
    const connectionIds = user?.connections || [];

    const visibilityFilter = [
      { visibility: 'public' },
      { author_id: req.userId },
      { author_id: { $in: connectionIds } }
    ];

    const [posts, total] = await Promise.all([
      Post.find({ $or: visibilityFilter })
        .populate('author_id', 'full_name username profile_picture')
        .populate('comments.user_id', 'full_name username profile_picture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ $or: visibilityFilter })
    ]);

    return res.status(200).json({ success: true, posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author_id: req.params.userId })
      .populate('author_id', 'full_name username profile_picture')
      .populate('comments.user_id', 'full_name username profile_picture')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author_id', 'full_name username profile_picture')
      .populate('comments.user_id', 'full_name username profile_picture')
      .populate('likes', 'full_name username profile_picture');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.likes.includes(req.userId)) post.likes = post.likes.filter(id => id !== req.userId);
    else post.likes.push(req.userId);

    await post.save();
    await post.populate('author_id', 'full_name username profile_picture');
    await post.populate('likes', 'full_name username profile_picture');

    return res.status(200).json({ success: true, message: 'Post liked/unliked', data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const post = await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: { user_id: req.userId, text, createdAt: new Date() } } }, { new: true })
      .populate('author_id', 'full_name username profile_picture')
      .populate('comments.user_id', 'full_name username profile_picture');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    return res.status(201).json({ success: true, message: 'Comment added', data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments[req.params.commentIndex];
    if (!comment || comment.user_id !== req.userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    post.comments.splice(req.params.commentIndex, 1);
    await post.save();
    await post.populate('author_id', 'full_name username profile_picture');
    await post.populate('comments.user_id', 'full_name username profile_picture');

    return res.status(200).json({ success: true, message: 'Comment deleted', data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author_id !== req.userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await Post.findByIdAndDelete(req.params.postId);
    return res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  likePost,
  addComment,
  deleteComment,
  deletePost
};
