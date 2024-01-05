// entrypoint of the application
import dotenv from "dotenv";
import ConnectDb from "./db/db.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})

// connecting the database
ConnectDb().then(()=>{
    app.on('error',(error)=>{
        console.log(`CONNECTION TO THE SERVER IS FAILED ${error}`)
        throw error;
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}).catch((err)=>console.log("SERVER CONNECTION FAILED !! ",err))
