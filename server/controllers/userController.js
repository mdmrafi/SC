import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.userId)
      .populate('followers', 'full_name username profile_picture')
      .populate('following', 'full_name username profile_picture')
      .populate('connections', 'full_name username profile_picture');

    // If user doesn't exist in DB, create them from Clerk data
    if (!user) {
      const auth = typeof req.auth === 'function' ? req.auth() : req.auth;

      if (!auth) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { userId, sessionClaims } = auth;

      console.log('🔍 Creating user from Clerk. SessionClaims:', JSON.stringify(sessionClaims, null, 2));

      // Extract email from various possible locations
      let email = '';
      if (sessionClaims) {
        email = sessionClaims.email ||
          sessionClaims.emailAddress ||
          sessionClaims.primaryEmailAddress?.emailAddress ||
          (sessionClaims.email_addresses && sessionClaims.email_addresses[0]?.email_address) ||
          '';
      }

      // If still no email, create a temporary one
      if (!email) {
        email = `user_${userId.substring(0, 8)}@sustconnect.temp`;
        console.log('⚠️ No email found, using temporary:', email);
      }

      let username = email.split('@')[0];

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }

      // Create user in database
      const userData = {
        _id: userId,
        email: email,
        full_name: sessionClaims?.name ||
          (sessionClaims?.firstName ? `${sessionClaims.firstName} ${sessionClaims.lastName || ''}`.trim() : '') ||
          sessionClaims?.fullName ||
          'User',
        profile_picture: sessionClaims?.imageUrl ||
          sessionClaims?.image_url ||
          sessionClaims?.picture ||
          '',
        username,
        isVerified: true
      };

      console.log('📝 Creating user with data:', userData);

      user = await User.create(userData);
      console.log('✅ Auto-created user from Clerk:', user.full_name);
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'full_name username profile_picture')
      .populate('following', 'full_name username profile_picture')
      .populate('connections', 'full_name username profile_picture');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, location, department, year, cover_photo, profile_picture } = req.body;

    const update = { username, bio, location, department, year };
    if (cover_photo) update.cover_photo = cover_photo;
    if (profile_picture) update.profile_picture = profile_picture;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { full_name: { $regex: req.params.query, $options: 'i' } },
        { username: { $regex: req.params.query, $options: 'i' } },
        { email: { $regex: req.params.query, $options: 'i' } }
      ]
    }).limit(20);

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().limit(50);
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!userToFollow.followers.includes(req.userId)) {
      await userToFollow.updateOne({ $push: { followers: req.userId } });
      await currentUser.updateOne({ $push: { following: req.params.id } });
      return res.status(200).json({ success: true, message: "User followed successfully" });
    } else {
      return res.status(400).json({ success: false, message: "You already follow this user" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userToUnfollow.followers.includes(req.userId)) {
      await userToUnfollow.updateOne({ $pull: { followers: req.userId } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      return res.status(200).json({ success: true, message: "User unfollowed successfully" });
    } else {
      return res.status(400).json({ success: false, message: "You don't follow this user" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getProfile,
  getUserById,
  updateProfile,
  searchUsers,
  getAllUsers,
  followUser,
  unfollowUser
};
