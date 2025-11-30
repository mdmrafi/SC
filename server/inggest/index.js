import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "SUSTConnect-app" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event})=>{
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            const email = email_addresses[0]?.email_address.split('@')[0];
            
            if (!email) {
                throw new Error('No email address found');
            }

            let username = email.split('@')[0];

            // Check availability of username
            let user = await User.findOne({username});
            if (user){
                username = username + Math.floor(Math.random() * 10000);
            }

            const userData = {
                _id : id,
                email: email,
                full_name: `${first_name || ''} ${last_name || ''}`.trim(),
                profile_picture: image_url || '',
                username,
                isVerified: true
            }
            
            await User.create(userData);
            console.log('User created:', userData);
        } catch (error) {
            console.error('Error in syncUserCreation:', error);
        }
    }
);

//Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event})=>{
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            const email = email_addresses[0]?.email_address;

            if (!email) {
                throw new Error('No email address found');
            }

            const updateUserData = {
                email: email,
                full_name: `${first_name || ''} ${last_name || ''}`.trim(),
                profile_picture: image_url || ''
            }
            
            await User.findByIdAndUpdate(id, updateUserData);
            console.log('User updated:', id);
        } catch (error) {
            console.error('Error in syncUserUpdation:', error);
        }
    }
);

//Inngest Function to delete user data in database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event})=>{
        try {
            const {id} = event.data;
            await User.findByIdAndDelete(id);
            console.log('User deleted:', id);
        } catch (error) {
            console.error('Error in syncUserDeletion:', error);
        }
    }
);


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];