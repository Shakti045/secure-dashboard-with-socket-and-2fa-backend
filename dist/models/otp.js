import mongoose from "mongoose";
import { sendmail } from "../utils/mail.js";
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdat: {
        type: Number,
        required: true,
        default: Date.now(),
        expires: 3000
    }
});
OTPSchema.post('save', async (doc) => {
    try {
        await sendmail(doc.email, 'OTP for verify your mail id', `Your OTP is ${doc.otp}`);
    }
    catch (error) {
        console.log(error);
        throw new Error('Mail not sent');
    }
});
export const Otp = mongoose.model('OTP', OTPSchema);
//# sourceMappingURL=otp.js.map