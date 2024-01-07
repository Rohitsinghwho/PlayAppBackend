import mongoose,{Schema} from "mongoose"

const TweetsModel= new Schema(
    
    {
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        content:{
            type:String,
            required:[true,"Content is required"],
            mxlength:2000,  
        }
    },

{timestamps:true})

export const Tweet= mongoose.model("Tweet",TweetsModel);