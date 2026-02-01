import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const dummyUsers = [
    {
        _id: 'user_dummy_1',
        email: 'sarah.j@example.com',
        full_name: 'Sarah Jenkins',
        username: 'sarahj',
        bio: 'Computer Science student | Loves coding and coffee ☕',
        profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        location: 'Sylhet, Bangladesh',
        isVerified: true
    },
    {
        _id: 'user_dummy_2',
        email: 'mike.chen@example.com',
        full_name: 'Mike Chen',
        username: 'mikec',
        bio: 'Photography enthusiast 📸 | SUST CSE',
        profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        location: 'Dhaka, Bangladesh',
        isVerified: false
    },
    {
        _id: 'user_dummy_3',
        email: 'emily.w@example.com',
        full_name: 'Emily Wong',
        username: 'emilyw',
        bio: 'Art & Design | Digital Artist',
        profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        location: 'Chittagong, Bangladesh',
        isVerified: true
    },
    {
        _id: 'user_dummy_4',
        email: 'alex.r@example.com',
        full_name: 'Alex Rivera',
        username: 'alexr',
        bio: 'Music lover 🎵 | Guitarist',
        profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        location: 'Sylhet, Bangladesh',
        isVerified: false
    },
    {
        _id: 'user_dummy_5',
        email: 'lisa.k@example.com',
        full_name: 'Lisa Kumar',
        username: 'lisak',
        bio: 'Traveler ✈️ | Foodie 🍕',
        profile_picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        location: 'Dhaka, Bangladesh',
        isVerified: true
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        for (const user of dummyUsers) {
            const existingUser = await User.findById(user._id);
            if (!existingUser) {
                await User.create(user);
                console.log(`Created user: ${user.full_name}`);
            } else {
                console.log(`User already exists: ${user.full_name}`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
