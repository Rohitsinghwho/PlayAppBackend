import mongoose from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    if(!videoId){
        throw new ApiError(400,"video id is required");
    }
    const AllComments= await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"User_details"
            }
        },
        {
            $addFields:{
                ownerDetails:{
                    $first:"$User_details.username"
                }
            },
        },
        {
            $project:{
                content:1,
                ownerDetails:1,
                createdAt:"$createdAt",
                

            }
        },
        {
            $skip:(page-1)*limit,
        },
        {
            $limit:Number(limit),
        }
    ])
    // console.log(AllComments)
    if(!AllComments){
        throw new ApiError(400,"No Comment On this video")
    }
    return res.status(200).json(new ApiResponse(200,AllComments,"Comments Fetched Successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body;
    const userId= req.user._id;
    const {videoId}=req.params;
    if (!content){
        throw new ApiError(400,"content is required");
    }
    const Post= await Comment.create({
        content,
        video:videoId,
        owner:userId,
    })
    if(!Post){
        throw new ApiError(500,"Unable to comment");
    }
    return res.status(200).json(new ApiResponse(200,Post,"Comment successfully"));

})

const updateComment = asyncHandler(async (req, res) => {

    // TODO: update a comment
    const {content}=req.body;
    const {commentId}=req.params;
    const userId= req.user._id;
    if (!content){
        throw new ApiError(400,"content is required");
    }
    const comment =await Comment.findOne({_id:new mongoose.Types.ObjectId(commentId)});
    // console.log(comment.owner._id)
    // console.log(userId)
    if(userId.toString() !== comment.owner._id.toString()){
        throw new ApiError(400,"Unauthorized")
    }
    const Post= await Comment.findByIdAndUpdate(new mongoose.Types.ObjectId(commentId),{
        content,
    },{
        new:true,
    })
    if(!Post){
        throw new ApiError(500,"Unable to Update comment");
    }
    return res.status(200).json(new ApiResponse(200,Post,"Comment Updated successfully"));
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    const userId= req.user._id;
    if (!commentId){
        throw new ApiError(400,"comment Id is required");
    }
    let comment =await Comment.findOne({_id:new mongoose.Types.ObjectId(commentId)});
    if(userId.toString() !== comment.owner._id.toString()){
        throw new ApiError(400,"Unauthorized")
    }
    const Post= await Comment.deleteOne(new mongoose.Types.ObjectId(commentId))
    if(!Post){
        throw new ApiError(500,"Unable to Delete comment");
    }
    return res.status(200).json(new ApiResponse(200,Post,"Comment Deleted successfully"));
    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }