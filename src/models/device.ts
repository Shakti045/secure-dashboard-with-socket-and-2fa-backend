import mongoose from "mongoose";

export interface DeviceType {
    _id: mongoose.Types.ObjectId;
    os: string;
    version: number;
    clientname: string;
    clienttype: string;
    devicetype:string;
    user: string;
    ip:string;
    timeoflogin:Date;
}

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
    devicetype:{
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ip:{
        type: String,
        required: true,
    },
    timeoflogin:{
        type: Date,
        default: Date.now()
    },
});


export const Device = mongoose.model('Device', DeviceSchema);