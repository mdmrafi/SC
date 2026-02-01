import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const connectDB = async () => {
    try{
        console.log('MONGODB_URL:', process.env.MONGODB_URL);
        mongoose.connection.on('connected', ()=> console.log('Database connected'))
        await mongoose.connect(process.env.MONGODB_URL);
    }catch(error){
        console.log(error.message);
    }

}

export default connectDB;