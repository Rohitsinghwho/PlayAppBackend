import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"

export const jwtVerify= asyncHandler(async(req,res,next)=>{
try {
     const token=req?.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    //  decode jwt token
    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }
    const deconded= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user= await User.findById(deconded?._id).select(
        "-password -refreshToken"
        )
    if(!user){
        throw new ApiError(401,"User is not present");
    }
    req.user = user;
    next();

} catch (error) {
    throw new ApiError(401,error?error.message:"Not authenticated")
}    
})