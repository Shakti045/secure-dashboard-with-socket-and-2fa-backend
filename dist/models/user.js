import mongoose from "mongoose";
const UserSchhema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    secretKey: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        required: true,
    },
    logindevices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device'
        }
    ]
});
export const User = mongoose.model('User', UserSchhema);
//# sourceMappingURL=user.js.map