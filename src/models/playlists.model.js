import mongoose,{Schema} from "mongoose"

const PlaylistModel= new Schema(
    
    {
     name:{
        type:String,
        required:[true,"Please provide a playlist name"]
     },
     description:{
        type: String,
     },
     videos:[
        {
        type:Schema.Types.ObjectId,
        ref:"Video",
        unique:true,
        }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
          
    },

{timestamps:true})

export const Playlist= mongoose.model("Playlist",PlaylistModel);