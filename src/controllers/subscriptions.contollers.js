import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) throw new ApiError(400,"Invalid channel");
    const isSubscribed= await Subscription.findOne({subscriber:new mongoose.Types.ObjectId(req.user._id),channel:new mongoose.Types.ObjectId(channelId)})
    if(isSubscribed){
        await Subscription.deleteOne(isSubscribed);
        return res.status(200).json(new ApiResponse(200,user,"UnSubscribed Successfully"))

    }
    const user= Subscription.create({
        subscriber:new mongoose.Types.ObjectId(req.user._id),
        channel:new mongoose.Types.ObjectId(channelId)

    })
    if(!user){
        throw new ApiError(500,'Server Error')
    }
    return res.status(200).json(new ApiResponse(200,user,"Subscribed Successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) throw new ApiError(400,"Invalid Channelid")
    
    const subscriber= await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"userInfo"
            }
        },
        {
            $unwind:"$userInfo"
        },
        {
            $project:{
                "userId":"$userInfo._id",
                "profilePicture":'$userInfo.profilePicture',
                "username":"$userInfo.username",
                "fullName":"$userInfo.fullName",
            }
        }
    ])
    console.log(subscriber)
    if(!subscriber){
        return res.status(200).json(new ApiResponse(200,{},"No Subscribers"));
    }
    return res.status(200).json(new ApiResponse(200,subscriber,"subscriber Fetched Succesfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId))throw new ApiError(400,"SubscriberId is invalid");

    const subscribedTo= await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId),
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'channel' ,
                foreignField:'_id',
                as : 'channelDetails'
            }
        },
        {
            $unwind:"$channelDetails"
        },
        {
            $project:{
                name:"$channelDetails.username",
                profilePicture:"$channelDetails.avatar"
            }
        }
    ])
    if(!subscribedTo){
        return res.status(200).json(new ApiResponse(200,{},"No Channels are Subscribed!!"))
    }
    else{
      return res.status(200).json(new ApiResponse(200,subscribedTo,"Subscribed channel fetched successfully"))  
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
