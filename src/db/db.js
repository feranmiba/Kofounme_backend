import pg from "pg";
import dotenv from "dotenv"

dotenv.config()


const db = new pg.Client({
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    ssl: {
        rejectUnauthorized: true, 
    },
})

export default db;