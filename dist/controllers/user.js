import { User } from "../models/user.js";
import { Device } from "../models/device.js";
import { getio } from "../socket/index.js";
export const getuserinfo = async (req, res) => {
    try {
        const id = req.userId;
        const userdetails = await User.findById({ _id: id }, { password: 0 }).populate({
            path: 'logindevices',
            model: 'Device',
            options: { sort: { timeoflogin: -1 } }
        });
        if (!userdetails) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User details', data: userdetails });
    }
    catch (error) {
        console.log('Error in getuserinfo', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const removedevice = async (req, res) => {
    try {
        const userId = req.userId;
        const deviceid = req.params.deviceid;
        if (!userId || !deviceid) {
            return res.status(400).json({ success: false, message: 'Please provide all the details' });
        }
        await Device.findByIdAndDelete({ _id: deviceid });
        await User.findByIdAndUpdate({ _id: userId }, { $pull: { logindevices: deviceid } });
        const io = getio();
        io.to(userId).emit('remove-device', deviceid);
        return res.status(200).json({
            suceess: true,
            message: 'Device logged out'
        });
    }
    catch (error) {
        console.log('Error while deleting device', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//# sourceMappingURL=user.js.map