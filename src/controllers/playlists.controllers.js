import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlists.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/AsyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name){
        throw new ApiError(400,"Title is Required");
    }
    const playlist= await Playlist.create({
        name,
        description:description?description:"",
        owner:new mongoose.Types.ObjectId(req.user._id),
    })
    if(!playlist){
        throw new ApiError(500,"Cannot Create A playlist");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Created Successfully"));

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) { 
        throw new ApiError(400,'Invalid User ID')
        }
    const playlists = await Playlist.find({owner : userId});
    if(!playlists){
        throw new ApiError(400,"No playlist to fetch")
    }
    return res.status(200).json(new ApiResponse(200,playlists,"User's playlists fetched successfully"))


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId))throw new ApiError(400,"Invalid Playlist Id")
    const playlist =await Playlist.findById(playlistId);
    if(!playlist){
     throw new ApiError(400,"No Playlist present")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched Successfylly"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId&&!videoId){
        throw new ApiError(400,"All fields are required");
    }
    const userId= req.user._id
    const ispresentVideo= await Playlist.findOne({videos:videoId})
    if(ispresentVideo){
        throw new ApiError(400,"Video is already Added")
    }
    const Authorized =await Playlist.findOne({_id:new mongoose.Types.ObjectId(playlistId)});
    // console.log(comment.owner._id)
    // console.log(userId)
    if(userId.toString() !== Authorized.owner._id.toString()){
        throw new ApiError(400,"Unauthorized")
    }
    const playlist=await Playlist.findByIdAndUpdate(playlistId ,{ $push:{videos:videoId}},{new:true}).catch((err)=>{
            console.log("error in adding video to the playlist", err);
            throw new ApiError(500,"Something went wrong while Adding Video To The Playlist")
    })
    return res.status(200).json(new ApiResponse(200,playlist,"Added videos Successfully"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    const userId= req.user._id
    const Authorized =await Playlist.findOne({_id:new mongoose.Types.ObjectId(playlistId)});
    // console.log(comment.owner._id)
    // console.log(userId)
    if(userId.toString() !== Authorized.owner._id.toString()){
        throw new ApiError(400,"Unauthorized")
    }
    // const playlist=await Playlist.findByIdAndDelete(playlistId,{video:videoId})
    const playlist= await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400,"No playlist present")
    }
    // console.log(...playlist.videos)
    playlist.videos = playlist.videos.filter(video => video.toString() !== videoId);
    const updatedPlaylist= playlist.save();
    
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Removed videos Successfully"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid Playlist Id");
    }
    const userId= req.user._id
    const Authorized =await Playlist.findOne({_id:new mongoose.Types.ObjectId(playlistId)});
    // console.log(comment.owner._id)
    // console.log(userId)
    if(userId.toString() !== Authorized.owner._id.toString()){
        throw new ApiError(400,"Unauthorized")
    }
    const deletedObj= await Playlist.deleteOne(new mongoose.Types.ObjectId(playlistId))
    if(!deletedObj){
        throw new ApiError(501,"Unable to delete the playlist")
    }
    return res.status(200).json(new ApiResponse(200,{},"Playlist Deleted Successfully"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Object")
    }
    if(!name){
        throw new ApiError(400,"Title is Required");
    }
    const userId= req.user._id
    const Authorized =await Playlist.findOne({_id:new mongoose.Types.ObjectId(playlistId)});
    // console.log(comment.owner._id)
    // console.log(userId)
    if(userId.toString() !== Authorized.owner._id.toString()){
        throw new ApiError(400,"Unauthorized")
    }
    const playlist= await Playlist.findByIdAndUpdate(playlistId,{
        name,
        description:description?description:""
    },{new:true})
    if(!playlist){
        throw new ApiError(500,"Cannot Update  playlist");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Updated Successfully"));


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
