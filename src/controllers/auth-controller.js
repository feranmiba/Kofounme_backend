import db from "../db/db.js";
import bcrypt from "bcrypt";
import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { generateRandomCode } from "../utils/jwt-service.js";
import { sendEmail } from "../utils/email-service.js";
import dotenv from "dotenv"

dotenv.config()

const cache = new NodeCache({ stdTTL: 1200 }); 

const saltrounds = 10;

export const signUp = async (req, res) => {
    const details = req.body;
    try {
        const userExist = await db.query("SELECT * FROM usersigned WHERE email = $1", [details.email]);
        if (userExist.rows.length > 0) {
            res.send(`User already with email ${details.email} exists.`);
        } else {
            bcrypt.hash(details.password, saltrounds, async (err, hash) => {
                if (err) {
                    console.error('Error hashing password', err);
                    res.status(500).json({ error: "Internal server error, please try again." });
                } else {
                    const code = generateRandomCode();

                    await sendEmail(details.email, code);
                  const inputed =  await db.query(
                        "INSERT INTO usersigned (email, phone_number, password) VALUES ($1, $2, $3)",
                        [details.email, details.phone_no, hash]
                    );

                    console.log(inputed)
                    // jwt.sign()
                    const acessToken = jwt.sign(details, process.env.JWT_SECRET, {expiresIn: "20m"})
                    res.status(200).json({profile: details, accessToken: acessToken, message:"A verification code has been sent to you email"})
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

export const login = async (req, res) => {
    const profile = req.body;
    try {
        const usermailExist = await db.query("SELECT * FROM usersigned WHERE email = $1", [profile.email]);
        if (usermailExist.rows.length > 0) {
            const user = usermailExist.rows[0];
            bcrypt.compare(profile.password, user.password, (err, result) => {
                if (err) {
                    res.status(500).send("Internal error, please try again");
                } else if (result) {
                    const acessToken = jwt.sign(profile, process.env.JWT_SECRET, {expiresIn: "20m"})
                    res.status(200).json({profile: user, accessToken: acessToken})
                } else {
                    res.status(400).json({ message: "Incorrect password. Try again"});
                }
            });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

export const sendVerificationCode = async (req, res) => {
    const email = req.body.email;
    const code = generateRandomCode();

    cache.set(email, code);

    try {
        await sendEmail(email, code);
        res.status(200).send('Verification code sent');
    } catch (error) {
        console.error('Error sending email', error);
        res.status(500).send('Error sending email');
    }
};

export const verifyCode = (req, res) => {
    const { email, code } = req.body;
    const cachedCode = cache.get(email);

    if (!cachedCode) {
        return res.status(400).json({ message: 'Invalid email or code' });
    }

    if (code === cachedCode) {
        cache.del(email);
        return res.status(200).json({ message: 'Code verified successfully' });
    }

    res.status(400).json({ message: 'Invalid code' });
};
