// server
import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app= express();

// use is used for setting middlewares or configuring
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
// this middleware is for getting a json response
app.use(express.json({limit:"16kb"}))
// this middleware is for url res
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static('../public/temp'))
// cokkie parser is used to set the cookies in user browser and remove them
app.use(cookieParser())



import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweets.routes.js"
import likeRouter from "./routes/likes.routes.js"




app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/likes",likeRouter);
export{app};