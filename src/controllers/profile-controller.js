import db from "../db/db.js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); 
    }
});
  
const upload = multer({ storage: storage });
  

export const createProfile = async (req, res) => {
    const { email, first_name, last_name, pronouns, city, tagline, role, looking, business, skil, interest } = req.body;
    const picture = req.file ? req.file.path : null; 

    try {
        const result = await db.query("SELECT id FROM usersigned WHERE email = $1", [email]);
        const user_id = result.rows[0].id;

        const data = await db.query("INSERT INTO user_profile (user_id, first_name, last_name, pronouns, city, tagline, picture, role, looking_for, business_into, skill, interest) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
            [user_id, first_name, last_name, pronouns, city, tagline, picture, role, looking, business, skil, interest]
        );

        if (data) {
            res.status(200).json({ profile: data.rows[0], message: "Profile created successfully" });
        } else {
            res.status(400).json({ message: "User not authenticated" });
        }
    } catch (error) {
        console.error('Error creating profile:', error); // Log error details
        res.status(500).json({ message: "Internal Server error. Try again later" });
    }
};


export const uploadMiddleware = upload.single('picture');

export const getProfile = async (req, res) => {
    const user_id = req.params.id;

    try {
        const user = await db.query("SELECT FROM user_profile WHERE user_id = $1", [user_id]);
        res.status(200).json(user);     
    } catch (error) {
       res.status(500).json({
        message: "Internal server Error. Please try again "
       }); 
    }

};
