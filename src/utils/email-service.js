import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()

export const sendEmail = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'KoFoundMe',
        text: `Your verification code is ${code}. It expires in 20 minutes. If you didn't request this code, please ignore it.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Error sending email');
    }
};
