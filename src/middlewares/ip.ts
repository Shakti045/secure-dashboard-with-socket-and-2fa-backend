import { Ip } from "../models/ip.js";
import { Request, Response ,NextFunction } from 'express';

export const ipcheck = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const ip = req.ip;
        const ipdata = await Ip.findOne({address:ip});
        if(!ipdata){
            await Ip.create({address:ip});
            return next();
        }else if(ipdata.attemptnumber>=5){
            if(ipdata.date.getTime() + 5*60*1000 < Date.now()){
              await Ip.findByIdAndUpdate(ipdata._id, {attemptnumber:1});
                return next();
            }else{
                return res.status(400).json({success:false, message:'Ip blocked!! Try after 5 minutes'});
            }
        }else{
           await Ip.findByIdAndUpdate(ipdata._id, {$inc:{attemptnumber:1}});
            return next();
        }
    } catch (error) {
        console.log('Error in ip middleware', error);
        return res.status(500).json({success:false, message:'Internal server error'});
    }
};