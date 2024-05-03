import { NextFunction ,Request , Response } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.js";
import mongoose from "mongoose";

interface jwtpayload  {
    id: string;
    email: string;
    deviceid: mongoose.Types.ObjectId;
}

export const authenticate = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const token = req?.header("Authorization")?.replace("Bearer ", "") || req?.cookies?.token;
        if(!token || token === ''){
            return res.status(401).json({success:false, message:'Token missing'});
        }

        const decoded:jwtpayload = jwt.verify(token, process.env.JWT_SECRET!) as jwtpayload;
        const user = await User.findById({_id: decoded?.id});
        if(user?.logindevices.indexOf(decoded?.deviceid) === -1){
            return res.status(200).json({ success: false, message: 'Device has been removed' });
        }
        //@ts-ignore
        req.userId = decoded.id;
        next();
    } catch (error:any) {
        console.log('Error in authenticate middleware', error?.message || 'jwt verification error');
        return res.status(500).json({success:false, message:'Internal server error'});
    }
}