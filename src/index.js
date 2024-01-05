// entrypoint of the application
import dotenv from "dotenv";
import ConnectDb from "./db/db.js";
dotenv.config({
    path: './.env'
})

// connecting the database
ConnectDb();
