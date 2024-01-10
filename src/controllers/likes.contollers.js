import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
// import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    // console.log(videoId)
    const userId= req.user._id;
    if (!isValidObjectId(userId)) throw new ApiError("User not found")
    if (!isValidObjectId(videoId)) throw new ApiError("Video not found")

    const isLiked= await Like.findOne({likedBy:new mongoose.Types.ObjectId(userId),video:new mongoose.Types.ObjectId(videoId)});
    // console.log(isLiked)
    if(!isLiked){
        await Like.create({
            likedBy:userId,
            video:videoId
        })
    }
    else{
        await Like.deleteOne(isLiked)
        return res.status(200).json(new ApiResponse(200,{},"Video Unliked successfully"))
    }
    return res.status(200).json(new ApiResponse(200,{},"Video Liked Fetching Successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const {videoId}=req.query;
    if(!videoId)throw new ApiError(400,'No Video Provided');
    const userId= req.user._id;
    if (!isValidObjectId(userId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid User or Video")
    }
    // const isComment= await Like.findById(commentId)
    const comment= await Like.findOne({likedBy:new mongoose.Types.ObjectId(userId),comment:new mongoose.Types.ObjectId(commentId)});
    if(comment){
        await Like.deleteOne(comment);
        return res.status(200).json(new ApiResponse(200,{},"comment Unliked Successfully"))
    }
    else{
        await Like.create({
            likedBy:userId,
            comment:commentId,
        })
    }


    return res.status(200).json(new ApiResponse(200,{},"Comment Liked Successfully"));


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id;
    if (!isValidObjectId(userId) || !isValidObjectId(tweetId)){
        throw new ApiError(400 ,"Invalid User or TweetId")
    }
    const tweetLike = await Like.findOne({likedBy:new mongoose.Types.ObjectId(userId),tweet:new mongoose.Types.ObjectId(tweetId)});
    if(tweetLike){
        await Like.deleteOne(tweetLike);
        return res.status(200).json(new ApiResponse(200,{},"Tweet Unliked Successfully"))
    }
    else{
        await Like.create({
            likedBy:userId,
            tweet:tweetId,
        })
    }
    return res.status(200).json(new ApiResponse(200,{},"Tweet Liked Successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId= req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid userId");
    }
    const LikedVideos= await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId),
                video:{$exists:true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"AllVideos"
            }
        },{
            $unwind:{
                path:"$AllVideos",
            }
        },
        {
            $project:{
                _id:"$AllVideos._id",
                title:"$AllVideos.title",
                videoFile:"$AllVideos.videoFile",
                createdAt:"$AllVideos.createdAt"

            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, LikedVideos,"All Liked videos Fetched Successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}