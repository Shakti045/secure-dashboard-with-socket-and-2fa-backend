import mongoose from "mongoose";

export interface UserType {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    secretKey:string;
    secretenabled:boolean;
    role: string;
    logindevices: mongoose.Types.ObjectId[];
}

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
    secretKey:{
        type:String,
        default:null,
    },
    secretenabled:{
        type:Boolean,
        default:false,
    },
    role:{
        type: String,
        enum: ['admin', 'user'],
        required: true,    
    },
    logindevices:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device'
        }
    ]
});

export const User = mongoose.model('User', UserSchhema);