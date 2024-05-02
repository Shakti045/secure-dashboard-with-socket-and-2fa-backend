import jwt from 'jsonwebtoken';
import { User } from "../models/user.js";
export const authenticate = async (req, res, next) => {
    try {
        const token = req?.header("Authorization")?.replace("Bearer ", "") || req?.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById({ _id: decoded.id });
        if (user?.logindevices.indexOf(decoded.deviceid) === -1) {
            return res.status(200).json({ success: false, message: 'Device has been removed' });
        }
        //@ts-ignore
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        console.log('Error in authenticate middleware', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=auth.js.map