import {  Response , Request } from "express"
import { User } from "../models/user.js";
import { Device } from "../models/device.js";
import { getio } from "../socket/index.js";
import speakeasy from 'speakeasy';
import bcrypt from 'bcrypt';



export const getuserinfo = async (req:Request & {userId?:string} & {mydeviceId?:string}, res: Response) => {
    try {
        const id = req.userId;
        const mydeviceId = req.mydeviceId;
        const userdetails = await User.findById({_id:id},{password:0}).populate({
            path:'logindevices',
            model:'Device',
            options: { sort: { timeoflogin: -1 } }
        });
        
        if(!userdetails){
            return res.status(400).json({success:false, message:'User not found'});
        }
        //@ts-ignore
        
        return res.status(200).json({success:true, message:'User details', data:userdetails,mydeviceId:mydeviceId});
    } catch (error) {
        console.log('Error in getuserinfo', error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
}



export const removedevice = async (req:Request & {userId?:string},res:Response)=>{
   try {
    const userId = req.userId;
    const deviceid = req.params.deviceid
    if(!userId || !deviceid){
        return res.status(400).json({success:false, message:'Please provide all the details'});
    }
    await Device.findByIdAndDelete({_id:deviceid});
    await User.findByIdAndUpdate({_id:userId},{$pull:{logindevices:deviceid}});
    const io = getio();
    io.to(userId).emit('remove-device',  deviceid );
    return res.status(200).json(
        {
            suceess:true,
            message:'Device logged out'
        }
    );
   } catch (error) {
      console.log('Error while deleting device',error);
      return res.status(500).json({
        success:false,
        message:'Internal server error'
      })

   }
}



export const changepassword = async (req:Request & {userId?:String},res:Response)=>{
    try {
        const userId = req.userId;
        const {oldpassword,newpassword} = req.body;
        if(!userId || !oldpassword || !newpassword){
            return res.status(400).json({success:false, message:'Please provide all the details'});
        }
        const user = await User.findById({_id:userId});
        if(!user){
            return res.status(400).json({success:false, message:'User not found'});
        }
        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if(!isMatch){
            return res.status(400).json({success:false, message:'Invalid credentials'});
        }
        const hashedpassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedpassword;
        await user.save();
        return res.status(200).json({success:true, message:'Password changed successfully'});
    } catch (error) {
        console.log('Error while changing password',error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
}


export const resetpassword = async (req:Request,res:Response)=>{
    try {
        const {email,newpassword,code} = req.body;
        if(!email || !newpassword || !code){
            return res.status(400).json({success:false, message:'Please provide all the details'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message:'User not found'});
        }
        if(!user.secretenabled){
            return res.status(400).json({success:false, message:'2FA not enabled,you have to login for atleast one time to enable 2fa'});
        }
        const isVerified = speakeasy.totp.verify({secret:user.secretKey,encoding:'base32',token:code});
        if(!isVerified){
            return res.status(400).json({success:false, message:'Invalid code'});
        }
        const hashedpassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedpassword;
        await user.save();
        return res.status(200).json({success:true, message:'Password reset successfully'});
    } catch (error) {
        console.log('Error while reseting password',error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
}