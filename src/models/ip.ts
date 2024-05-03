import mongoose from "mongoose";

export interface IPType {
    _id: mongoose.Types.ObjectId;
    address: string;
    attemptnumber:number;
    date: number;
}
const IPSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    attemptnumber:{
        type: Number,
        required: true,
        default:1
    },
    date: {
        type:Number,
        default: Date.now()
    }
});

export const Ip = mongoose.model('IP', IPSchema);