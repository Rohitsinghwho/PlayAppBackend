import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
    UploadOnCloudinary,
    DeletefromCloudnary,
  } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video} from "../models/video.model.js"



// const getAllVideos= asyncHandler(async(req,res)=>{
//     //title,description,thumbnail

// })
//publish Video route
const publishAVideo= asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
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
        videoFile:videoFile.url,
        thumbnail:thumbnail?thumbnail.url:"",
        duration:videoFile.duration,    
    });
    if(!CreatedVideo){
        throw new ApiError(501,"Unable to create a Video");
    }
    return res.status(200).json(new ApiResponse(201,CreatedVideo,"Video Uploaded Successfully"));


})
const getVideoById= asyncHandler(async(req,res)=>{
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
    deleteVideo
}