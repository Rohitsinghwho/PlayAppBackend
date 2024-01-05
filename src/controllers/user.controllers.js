import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
const RegisterUser= asyncHandler(async(req,res)=>{
   /*
    1- extract the user from body
    2- validate the user not empty
    3- check if user is already exist
    4-check for images ,check for avatar 
    5-file handle 
    5-file upload on cloudnary,check avatar
    6-create user object and save the user
    7-remove the password and refreshtoken from payload
    8-check for user creation
    9-send response
   */
//extracted the user information from req.boby   
  const {email,password,fullName,username}=req.body;
    // validate the data
    if(!email || !password ||!fullName||!username){
        throw new ApiError(409,"Input Fields are required");
    }
    
    const isPresent=User.findOne({
        $or:[{email},{username}]
    });
    if(!isPresent){
        throw new ApiError(400,"User Already present");
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverLocalpath= req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }
    const avatar =await UploadOnCloudinary(avatarLocalPath)
    const coverImage= await UploadOnCloudinary(coverLocalpath)
    if(!avatar){
        throw new ApiError(400," Error avatar is not uploaded");
    }
    const user= await User.create({
        fullName,
        username:username.toLowerCase(),
        email,
        avatar:avatar.url,
        coverImage:coverImage?coverImage.url:"",
    })
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Server error while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Succesfully")
    )
})




export {RegisterUser}