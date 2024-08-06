import express from "express";
import db from "./src/db/db.js";
import bodyParser from "body-parser";
import authRoutes from "./src/routes/auth-route.js";
import profileRoutes from "./src/routes/profile-route.js";
import dotenv from "dotenv";
import cors from "cors"


dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());

db.connect();

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

