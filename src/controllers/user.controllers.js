import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import validator from "email-validator";
// genrate Aceeses and refershtokens
const generateAccessRefreshTokens = async(userId) =>{
    try {
        const user= await User.findById(userId);
        const accessToken =  user.genrateAccessToken();
        const refreshToken=  user.generateRefreshToken();
        //saved inside the database
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {refreshToken,accessToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
// register User Route
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
    const isEmail=  validator.validate(email)
    if(!isEmail){
        throw new ApiError(409,"Please Enter a valid Email");
    }
    const isPresent=await User.findOne({
        $or:[{email},{username}]
    });
    if(isPresent){
        throw new ApiError(400,"User with email and Username is already Present");
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    let coverLocalpath;
    if(req.files &&Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverLocalpath=req.files.coverImage[0].path;
    }
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
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
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
    
    // Login User route
const loginUser= asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body
    console.log(req.body)
    //checking if username or email is empty
    if(!username&&!email){
        throw new ApiError(401,"Email or Username is required")
    }
    //checking by username
    const user= await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
    //compare the passwords using bcrypt
    const checkPassword=   await user.isPasswordCorrect(password);
    if(!checkPassword){
        throw new ApiError(401,"Password Incorrect");
    }
    // genratetokens AND set in db refreshtoken
    const {refreshToken,accessToken}=  await generateAccessRefreshTokens(user._id);
    
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options={
        httpOnly:true,
        secure:true,
    }
    res.status(200).cookie("refreshToken", refreshToken,options).cookie("accessToken",accessToken,options).json(
        new ApiResponse(201,{
            user:createdUser,accessToken,refreshToken,
        },"Logged In successfully!!")
    )
    

})


// logout User route
const logoutUser= asyncHandler(async(req,res)=>{
    const createdUser=await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{
                // it will remove refresh token
                refreshToken:true,
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200).clearCookie("refreshToken",options).clearCookie("accessToken",options).json(
        new ApiResponse(201,{},"Logged Out Successfully")
    )
})
export {
    RegisterUser,
    loginUser,
    logoutUser
}