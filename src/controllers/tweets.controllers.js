import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweets.model.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}= req.body;
    if(!content){
        throw new ApiError(400,"Content is required");
    }
    const CreateTweet= Tweet.create({
        content,
    });
    if(!CreateTweet){
        throw new ApiError(501,"Unable to create Tweet");
    }
    return res.status(200).json(new ApiResponse(201,CreateTweet,"Tweeted Successfully"));
})

// const getUserTweets = asyncHandler(async (req, res) => {
//     // TODO: get user tweets
// })

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content}=req.body;
    const {tweetId}= req.params;
    const tweet= await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(401,"User does not Exist");
    }
    if(!content){
        throw new ApiError(400,"Content is required");
    }
    tweet.content=content;
    await tweet.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(new ApiResponse(201, {}, "Content Updated Successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;
    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(501,"Tweet not found");
    }
    await Tweet.deleteOne(tweet);
    return res.status(200).json(new ApiResponse(201,{},"Tweet Deleted Successfully"))
})

export {
    // createTweet,
    createTweet,
    deleteTweet,
    updateTweet,
}