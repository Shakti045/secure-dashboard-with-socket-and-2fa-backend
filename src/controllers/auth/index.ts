import { Otp } from "../../models/otp.js";
import { User, UserType } from "../../models/user.js";
import otpgenerator from 'otp-generator';
import bcrypt from 'bcrypt';
import e, { Request, Response } from 'express';
import DeviceDetector from "node-device-detector";
import { Ip } from "../../models/ip.js";
import requestip from 'request-ip';
import { sendmail } from "../../utils/mail.js";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import mongoose from "mongoose";
import { Device } from "../../models/device.js";
import { getio} from "../../socket/index.js";
dotenv.config({path:'.env'})


export const getOtp= async (req:Request, res:Response) => {
    try {
        const {email} = req.body;
        if(!email){
            return res.status(400).json({success:false, message:'Please provide email'});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({success:false,message:'User already exists'});
        }
        const otp = otpgenerator.generate(6, {lowerCaseAlphabets:false, upperCaseAlphabets:false, specialChars:false});
        await Otp.create({email, otp});
        return res.status(200).json({success:true, message:'OTP sent successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
};



export const signUp = async (req:Request, res:Response) => {
    try {
        const {username,email, password, otp} = req.body;
        if(!username || !email || !password || !otp){
            return res.status(400).json({success:false, message:'Please provide all the details'});
        }
        const recentotp=await Otp.find({email:email}).sort({createdat:-1}).limit(1);
        if(!recentotp || recentotp.length===0){
            return res.status(400).json({success:false, message:'OTP expired'});
        }
        
        if(recentotp[0].createdat.getTime() + 5*60*1000 < Date.now()){
            return res.status(400).json({success:false, message:'OTP expired'});
        }

        if(recentotp[0].otp !== otp){
            return res.status(400).json({success:false, message:'Invalid OTP'});
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        await User.create({email, password:hashedpassword,username,role:'user'});
        return res.status(200).json({success:true, message:'User created successfully'});
       }catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Internal server error'});
       }
}






export const get2faqrcode = async(userid:mongoose.Types.ObjectId) => {
    try {
        const secretKey = speakeasy.generateSecret({length:20}).base32;
        const otpauth = speakeasy.otpauthURL({secret:secretKey, label:'Secure Login System',issuer:'Tseting App',encoding:'base32'});
        await User.findByIdAndUpdate({_id:userid},{secretKey:secretKey});
        const qrCode = await QRCode.toDataURL(otpauth);
        return qrCode;
    } catch (error) {
        console.log('Error occured while generating QR code',error);
        throw new Error('Error occured while generating QR code');
    }
}


export const performdeviceregistration = async (user:UserType,email:string,req:Request) => {
    try {  
        const userAgent = req.headers['user-agent'];
        //@ts-ignore
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
            deviceTrusted: true,
            deviceInfo: true,
            maxUserAgentSize: 500,
          });
          //@ts-ignore
          const result = detector.detect(userAgent);
          const info = {
               os:result?.os?.name || 'unknown',
               version:result?.os?.version || 'unknown',
               clientname:result?.client?.name || 'unknown',
               clienttype:result?.client?.type || 'unknown',
               devicetype:result?.device?.type || 'unknown'
          };
        const ip  = requestip.getClientIp(req) || req.socket.remoteAddress;
        const device = await Device.create({os:info.os,version:info.version,clientname:info.clientname,clienttype:info.clienttype,devicetype:info.devicetype,user:user._id,ip:ip});

        await User.findByIdAndUpdate({_id:user._id},{$push:{logindevices:device._id}});

        await sendmail(email,'New login alert',
        `<p>A new login  was detected on your account,Login informations are given below:
         <span>OS:${info.os}</span> <span>Version:${info.version}</span> <span>Client Name:${info.clientname}</span> <span>Client Type:${info.clienttype}</span> <span>Device Type:${info.devicetype}</span> 
        </p>`);
        
        return device;
    } catch (error) {
        console.log('Error occured while performing IP related tasks',error);
        throw new Error('Error occured while performing IP related tasks');
    }
}


export const signIn = async (req:Request , res:Response) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({success:false, message:'Please provide all the details'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message:'User not found'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success:false, message:'Invalid credentials'});
        }

        if(user.secretenabled){
            return res.status(200).json({success:true, message:'Password verified',secretenabled:true,userid:user._id,username:user.username});
        }
        
        const qrCode = await get2faqrcode(user._id);
        return res.status(200).json({success:true, message:'Password verified',qrCode:qrCode,secretenabled:false,userid:user._id,username:user.username});

    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
}


export const verify2fa = async (req:Request, res:Response) => {
    try {
        const {userid,code} = req.body;
        if(!userid ||  !code){
            return res.status(400).json({success:false, message:'Please provide all the details'});
        }
        const user = await User.findById({_id:userid})
        if(!user){
            return res.status(400).json({success:false, message:'User not found'});
        }
       
        const isVerified = speakeasy.totp.verify({secret:user.secretKey,encoding:'base32',token:code});
        if(!isVerified){
            return res.status(400).json({success:false, message:'Invalid code'});
        }
        await User.findByIdAndUpdate({_id:userid},{secretenabled:true});
        const email = user.email;
        const device = await performdeviceregistration(user,email,req);
        const io = getio();
        io.to(userid).emit('new-device', device);
        const payload = {
            id:user._id,
            email:email,
            deviceid:device._id
        }

        const token = jwt.sign(payload,process.env.JWT_SECRET!,{expiresIn:'5d'});
        return res.cookie('token',token,{httpOnly:true,expires:new Date(Date.now()+5*24*60*60*1000)}).status(200).json({success:true, message:'User logged in successfully',token:token,deviceid:device._id,userid:user._id});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
};