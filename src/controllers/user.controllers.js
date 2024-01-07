import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  UploadOnCloudinary,
  DeletefromCloudnary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import validator from "email-validator";
import jwt from "jsonwebtoken";
import { mongoose } from "mongoose";
// genrate Aceeses and refershtokens
const generateAccessRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //saved inside the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
// register User Route
const RegisterUser = asyncHandler(async (req, res) => {
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
  const { email, password, fullName, username } = req.body;
  // validate the data
  if (!email || !password || !fullName || !username) {
    throw new ApiError(409, "Input Fields are required");
  }
  const isEmail = validator.validate(email);
  if (!isEmail) {
    throw new ApiError(409, "Please Enter a valid Email");
  }
  const isPresent = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (isPresent) {
    throw new ApiError(400, "User with email and Username is already Present");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverLocalpath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await UploadOnCloudinary(avatarLocalPath);
  const coverImage = await UploadOnCloudinary(coverLocalpath);
  if (!avatar) {
    throw new ApiError(400, " Error avatar is not uploaded");
  }
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Server error while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Succesfully"));
});

// Login User route
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  // console.log(req.body)
  //checking if username or email is empty
  if (!username && !email) {
    throw new ApiError(401, "Email or Username is required");
  }
  //checking by username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  //compare the passwords using bcrypt
  const checkPassword = await user.isPasswordCorrect(password);
  if (!checkPassword) {
    throw new ApiError(401, "Password Incorrect");
  }
  // genratetokens AND set in db refreshtoken
  const { refreshToken, accessToken } = await generateAccessRefreshTokens(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "Logged In successfully!!"
      )
    );
});

// logout User route
const logoutUser = asyncHandler(async (req, res) => {
  const createdUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        // it will remove refresh token
        refreshToken: true,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(201, {}, "Logged Out Successfully"));
});

// update refresh token
const updateRefreshToken = asyncHandler(async (req, res) => {
  const IncomingUsertoken = req.cookies.refreshToken || req.body.refreshToken;
  if (!IncomingUsertoken) {
    throw new ApiError(401, "Invalid Token , please login again");
  }
  const decodedToken = jwt.verify(
    IncomingUsertoken,
    process.env.REFRESH_TOKEN_SECRET
  );
  let user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Unauthoried Access");
  }
  // compare tokens
  if (user?.refreshToken != IncomingUsertoken) {
    throw new ApiError(401, "Refresh Token is expired or used");
  }
  // save the new token and old one to blacklist
  const { refreshToken, accessToken } = await generateAccessRefreshTokens(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(201, { accessToken, refreshToken }));
});

// updatePassword route
const UpdateAndChangePassword = asyncHandler(async (req, res) => {
  const { Oldpassword, NewPassword } = req.body;
  if (!Oldpassword || !NewPassword) {
    throw new ApiError(400, "Password details cannot be empty");
  }
  const user = await User.findById(req.user?._id);
  const isMatched = await user.isPasswordCorrect(Oldpassword);
  if (!isMatched) {
    throw new ApiError(401, "Wrong Current Password");
  }
  user.password = NewPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Password Changed Successfully"));
});

//get User route
const getUser = asyncHandler(async (req, res) => {
  // const user = await User.findById(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched Successfully"));
});
// UpdateAccountDetails route
const UpdateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  const OldEmail = req.user.email;
  const oldfullName = req.user.fullName;
  if (oldfullName === fullName && OldEmail === email) {
    throw new ApiError(
      400,
      "User details are already updated with same values"
    );
  }
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are requierd");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(201, user, "FullName and Email are Updated"));
});

//updateProfilepicture route
const UpdateProfilePicture = asyncHandler(async (req, res) => {
  const profilePic = req.file?.path;
  if (!profilePic) {
    throw new ApiError(400, "No Image is selected to upload");
  }
  let user = await User.findById(req.user._id);
  await DeletefromCloudnary(user.avatar);
  const avatar = await UploadOnCloudinary(profilePic);
  if (!avatar) {
    throw new ApiError(500, "internal Server error file not uploaded on cloud");
  }
  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "profile picture Uploded Successfully"));
});

//updateCoverImage route
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImage = req.file?.path;
  if (!coverImage) {
    throw new ApiError(400, "No Image is selected to upload");
  }
  let user = await User.findById(req.user._id);
  const coverfile = await UploadOnCloudinary(coverImage);
  await DeletefromCloudnary(user.coverImage);
  await DeletefromCloudnary(user.coverImage);
  if (!coverfile) {
    throw new ApiError(500, "internal Server error file not uploaded on cloud");
  }
  user.coverImage = coverfile.url;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Cover picture Uploded Successfully"));
});
//get UserProfilePage/dashboard
const getUserChannelInfo = asyncHandler(async (req, res) => {
  const { username } = req.params;
  // console.log(username);
  // fint the subscriber and subscribedtocount , isSubscribed
  if (!username) {
    throw new ApiError(400, "User is not present");
  }
  const channel = await User.aggregate([
    {
      // first pipeline
      $match: { username: username.toLowerCase() },
    },
    {
      //second pipeline
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedto",
      },
    },
    {
      $addFields: {
        subscribedToCount: { $size: "$subscribedto" },
        subscriberCount: { $size: "$subscribers" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribedToCount: 1,
        subscriberCount: 1,
        isSubscribed: 1,
        fullName: 1,
        createdAt: 1,
      },
    },
  ]);
  if (!channel || channel.length === 0) {
    throw new ApiError(404, "Channel not found");
  }

  if (channel.length > 1) {
    // Handle the case where multiple documents match the criteria
    throw new ApiError(
      500,
      "Unexpected: Multiple channels found for the same username"
    );
  }

  // Send the single document in the response
  return res
    .status(200)
    .json(new ApiResponse(201, channel[0], "Channel Fetched Successfully"));
});
//get Userwatchhistory  route//
const getUserWatchHistory = asyncHandler(async(req, res) => {
const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    console.log(user)
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


// all exports
export {
  RegisterUser,
  loginUser,
  logoutUser,
  updateRefreshToken,
  UpdateAndChangePassword,
  getUser,
  UpdateAccountDetails,
  UpdateProfilePicture,
  updateCoverImage,
  getUserChannelInfo,
  getUserWatchHistory,
};
