import db from "../db/db.js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the folder to store uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename with a timestamp
    }
});

// Initialize Multer with storage settings and file size limit
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Set a 5MB file size limit
});

export default upload;
  

export const createProfile = async (req, res) => {
    const { email, first_name, last_name, pronouns, city, tagline, role, looking_for, business, skill, interest } = req.body;
    const picture = req.file ? req.file.path : null; 

    try {
        const result = await db.query("SELECT id FROM usersigned WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
          }
        const user_id = result.rows[0].id;

        const data = await db.query("INSERT INTO user_profile (user_id, first_name, last_name, pronouns, city, tagline, picture, role, looking_for, business_into, skill, interest) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)  RETURNING *",
            [user_id, first_name, last_name, pronouns, city, tagline, picture, role, looking_for, business, skill, interest]
        );
        
        if (data) {
            console.log(data.rows[0])
            res.status(200).json({ userID: data.rows[0], message: "Profile created successfully" });
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
    const { email } = req.body;
    try {
        const result = await db.query("SELECT id FROM usersigned WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
          }
        const user_id = result.rows[0].id;


        const user = await db.query("SELECT FROM user_profile WHERE user_id = $1", [user_id]);
        console.log(user.rows[0])
        res.status(200).json(user.rows[0]);     
    } catch (error) {
       res.status(500).json({
        message: "Internal server Error. Please try again "
       }); 
    }
};
