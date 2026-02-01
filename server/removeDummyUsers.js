import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const removeDummyUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const result = await User.deleteMany({ _id: { $regex: /^user_dummy_/ } });
        console.log(`Removed ${result.deletedCount} dummy users`);

        process.exit(0);
    } catch (error) {
        console.error('Error removing users:', error);
        process.exit(1);
    }
};

removeDummyUsers();
