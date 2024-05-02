import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const dburl = process.env.MONGODB_URI;
export const connectDb = async () => {
    try {
        await mongoose.connect(dburl);
        console.log('Database connected successfully');
    }
    catch (error) {
        console.log('Database connection failed');
        throw new Error('Database connection failed');
    }
};
//# sourceMappingURL=dbconfig.js.map