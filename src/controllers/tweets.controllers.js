import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { mongoose } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const userId = req.user._id; // Assuming the user's _id is available in req.user

  const CreateTweet = await Tweet.create({
    content: content,
    owner: userId, // Set the owner of the tweet as the user's _id

  });
  if (!CreateTweet) {
    throw new ApiError(501, "Unable to create Tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, CreateTweet, "Tweeted Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const UserId = req.params.id || req.user._id;
  const tweets = await User.aggregate([
    {
        //first pipeline
      $match: {
        _id:  new mongoose.Types.ObjectId(UserId)
      },
    },
    {
        //second Pipeline
        $lookup:{
            from:"tweets",
            localField:"_id",
            foreignField:"owner",
            as:"posts"
        }

    },
    {
        $addFields:{
            ownerPosts : "$posts",
        }
    },
    {
        //third pipeline
        $project:{
            username:1,
            fullName:1,
            ownerPosts:1,
        }
    }
  ]);
// console.log(tweets)
  if (!tweets.length) {
    throw new ApiError(404, "No tweets found for the user.");
  }

  return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(401, "User does not Exist");
  }
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  tweet.content = content;
  await tweet.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Content Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(501, "Tweet not found");
  }
  await Tweet.deleteOne(tweet);
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Tweet Deleted Successfully"));
});

export {
  // createTweet,
  getUserTweets,
  createTweet,
  deleteTweet,
  updateTweet,
};
