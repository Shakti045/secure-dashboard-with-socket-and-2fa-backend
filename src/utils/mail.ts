import { transporter } from "../config/mailconfig.js";

export const sendmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from:'Testing app',
            to,
            subject,
            html
        });
    } catch (error) {
        console.log(error);
        throw new Error('Mail not sent');
    }
}