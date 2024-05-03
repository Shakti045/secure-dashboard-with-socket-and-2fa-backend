import mongoose from "mongoose";
const IPSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    attemptnumber: {
        type: Number,
        required: true,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});
export const Ip = mongoose.model('IP', IPSchema);
//# sourceMappingURL=ip.js.map