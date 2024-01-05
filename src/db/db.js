// Database connections
import  mongoose  from "mongoose";
import { databaseName } from "../constants.js"
const ConnectDb= async()=>{
    try {
        const MongoConnection= await mongoose.connect(`${process.env.MONGODB_URI}/${databaseName}`);
        console.log("Mongo DB Connected !! DB HOST:  ",MongoConnection.connection.host);
    } catch (err) {
        console.error("MONGODB CONNECTION FAILED: ",err)
        process.exit(1);
    }
}
export default ConnectDb;