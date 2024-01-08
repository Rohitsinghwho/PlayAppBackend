import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
    UploadOnCloudinary,
    DeletefromCloudnary,
  } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video} from "../models/video.model.js"
import { mongoose } from "mongoose";
// import { User } from "../models/user.model.js";


// link from postman
//http://localhost:8000/api/v1/videos?userId=6599b1ad18d0fb51a83a1cea&query=Hey this is second video
// &sortBy=createdAt&sortType=desc&page=2&limit=2
const getAllVideos= asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

   // Match stage for filtering
   const pipeline = [];
    if (query) {
    pipeline.push(
        { 
            $match: { 
                title: { 
                    //regex --regular expression matches the query according to the title
                    $regex: new RegExp(query, 'i') 
                } 
            } 
        });
    }
    // console.log(userId)
    if(userId){
    //  console.log("Getting into userId pipeline")
        pipeline.push(
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(userId)           
                }
            }
            
        )
    }
    // console.log(new mongoose.Types.ObjectId(userId))
    // sortby- view or createdAt
    //sorttype- asc or desc
    if(sortBy){
        let sortOrder;
        if(sortType==="desc"){
            sortOrder=-1;
        }
        else{
            sortOrder=1;
        }
        pipeline.push({
            $sort:{
                [sortBy]:sortOrder,
            }
        })
    }
    pipeline.push({$skip:(page-1)*limit});
    pipeline.push({$limit:Number(limit)});
    const videos = await Video.aggregate(pipeline).exec();    
    res.status(200).json(new ApiResponse(200,{
        videos,
        page:Number(page),
        limit:Number(limit),
        totalCount:videos.length
    },"Videos Fetched successfully"));
})
//publish Video route
const publishAVideo= asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
    const userId = req.user._id; // Assuming the user's _id is available in req.user
    if(!title || !description){
        throw new ApiError(400,"Title or description fields are missing")
    }
    let thumbnailLocalPath;
    let VideoLocalPath
    if(req.files&&Array.isArray(req.files.thumbnail)&&req.files.thumbnail.length>0){
        thumbnailLocalPath=req.files.thumbnail[0].path;
    }
    if(req.files&&Array.isArray(req.files.videoFile)&&req.files.videoFile.length>0){
         VideoLocalPath=  req.files.videoFile[0].path;
    }
    if(!VideoLocalPath){
        throw new ApiError(422,"No file is Selected to uploaded");
    }
    const videoFile= await UploadOnCloudinary(VideoLocalPath);
    const thumbnail=await UploadOnCloudinary(thumbnailLocalPath);
    if(!videoFile.url){
        throw new ApiError(501,"Failed To upload the video");
    }
    // save in databases
    const CreatedVideo= await Video.create({
        title,
        description,
        owner:userId,
        videoFile:videoFile.url,
        thumbnail:thumbnail?thumbnail.url:"",
        duration:videoFile.duration,    
    });
    if(!CreatedVideo){
        throw new ApiError(501,"Unable to create a Video");
    }
    return res.status(200).json(new ApiResponse(201,CreatedVideo,"Video Uploaded Successfully"));


})
const
 getVideoById= asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(501,"User id is required")
    }
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video does not exist")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video fetched Successfully"))
    
})
const updateVideo=asyncHandler(async(req,res)=>{
   const {title,description}=req.body;
   const {videoId}=req.params;
   if(!videoId){
    throw new ApiError(501,"Video id is requried")
   }
   const duplicateVid= await Video.findById(videoId);
   if(!duplicateVid){
    throw new ApiError(400,"Video does not exist")
   }
   const TodeleteThum=duplicateVid.thumbnail;
   const thumbnailLocalPath=req?.file?.path;
//    if(!thumbnailLocalPath){
//     throw new ApiError(400,"Thumbnail is required")
//    }
    const thumbnail =await UploadOnCloudinary(thumbnailLocalPath);
    await DeletefromCloudnary(TodeleteThum);
    if(!thumbnail){
         throw new ApiError(501,"Unable to update the thumbnail")
    }
    
   const video= await Video.findByIdAndUpdate(videoId,{
    $set:{
        title,
        description,
        thumbnail:thumbnail?thumbnail.url:duplicateVid.thumbnail,
    }
   },{new:true})
   return res.status(200).json(new ApiResponse(201,video,"Video Updated Successfully"));
})
//toogle isPublshed route
const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {isPublished}=req.body;
    if(!videoId){
        throw new ApiError(501,"User id is required")
    }
    const video =await Video.findByIdAndUpdate(videoId,{
        $set:{
            isPublished,
        }

    },
    {
        new:true,
    })
    if(!video){
        throw new ApiError(501,"Video does not exist")
    }
    return res.status(200).json(new ApiResponse(201,video,"isPublished Status Toggled Successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(501,"Video id is required")
    }
    //TODO: delete video
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video Id is either Invalid or Video has been already deleted")
    }
    const videoUrl=video.videoFile;
    const thumbnailurl= video.thumbnail;
    await Video.deleteOne(video);
    await DeletefromCloudnary(videoId);
    await DeletefromCloudnary(thumbnailurl);
    return res.status(200).json(new ApiResponse(200,{},"Video deleted SuccessFully"));
}) 

export{
    publishAVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
    getAllVideos
}