import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config({ path: '.env' });
export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
//# sourceMappingURL=mailconfig.js.map