// Database connections
import  mongoose  from "mongoose";
import { databaseName } from "../constants.js"
// const ConnectDb= async()=>{
//     try {
//         const MongoConnection= await mongoose.connect(`${process.env.MONGODB_URI}/${databaseName}`);
//         console.log("Mongo DB Connected !! DB HOST:  ",MongoConnection.connection.host);
//     } catch (err) {
//         console.error("MONGODB CONNECTION FAILED: ",err)
//         process.exit(1);
//     }
// }
const ConnectDb=()=>{
    mongoose.connect(`${process.env.MONGODB_URI}/${databaseName}`).then((res)=>{
        // console.log('Database connected successfully');
        return res.connection.host;
    }).catch((err)=>console.log(err)).then((res)=>{
        console.log("Database connected ",res);
    })
}

export default ConnectDb;