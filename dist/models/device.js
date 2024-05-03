import mongoose from "mongoose";
const DeviceSchema = new mongoose.Schema({
    os: {
        type: String,
        required: true,
    },
    version: {
        type: Number,
        required: true,
    },
    clientname: {
        type: String,
        required: true,
    },
    clienttype: {
        type: String,
        required: true,
    },
    devicetype: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ip: {
        type: String,
        required: true,
    },
    timeoflogin: {
        type: Number,
        default: Date.now()
    },
});
export const Device = mongoose.model('Device', DeviceSchema);
//# sourceMappingURL=device.js.map