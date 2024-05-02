import express from 'express';
import { getOtp , signUp , signIn, verify2fa } from '../controllers/auth/index.js';
import { ipcheck } from '../middlewares/ip.js';
import { getuserinfo, removedevice } from '../controllers/user.js';
import { authenticate } from '../middlewares/auth.js';


const router = express.Router();

router.post('/getotp', getOtp);
router.post('/signup', signUp);
router.post('/signin',ipcheck, signIn);
router.post('/verify2fa', verify2fa);

router.get('/getuserinfo',authenticate,getuserinfo);
router.delete('/removedevice/:deviceid',authenticate,removedevice);

export default router;

