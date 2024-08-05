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
            return res.status(400).json({ message: `User already with email ${details.email} exists.` });
        }

        bcrypt.hash(details.password, saltrounds, async (err, hash) => {
            if (err) {
                console.error('Error hashing password', err);
                return res.status(500).json({ error: "Internal server error, please try again." });
            }

            const code = generateRandomCode();
            await sendEmail(details.email, code);

            // Store temporary user details in a cache or a temporary database
            cache.set(details.email, { ...details, password: hash, code });

            res.status(200).json({ message: "A verification code has been sent to your email" });
        });
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
                    res.status(200).json({profile: {id:user.id, email: user.email, phone: user.phone_number}, accessToken: acessToken})
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

export const verifyCode = async (req, res) => {
    const { email, code } = req.body;
    const cachedDetails = cache.get(email);

    if (!cachedDetails) {
        return res.status(400).json({ message: 'Invalid email or code' });
    }

    if (code === cachedDetails.code) {
        try {
            await db.query(
                "INSERT INTO usersigned (email, phone_number, password) VALUES ($1, $2, $3)",
                [cachedDetails.email, cachedDetails.phone_no, cachedDetails.password]
            );

            const accessToken = jwt.sign({ email: cachedDetails.email }, process.env.JWT_SECRET, { expiresIn: "20m" });
            cache.del(email);

            return res.status(200).json({ profile: cachedDetails, accessToken, message: 'Code verified and user registered successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Server error, please try again' });
        }
    }

    res.status(400).json({ message: 'Invalid code' });
};
