import mongoose ,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema= new Schema(
    {
        thumbnail:{
            type:String,
            required:[true,"Please provide a Thumbnail Url"]
        },
        owner:{
            type : Schema.Types.ObjectId,  //connecting with user model
            ref:"user",
        },
        title:{
            type:String,
            required:[true,'Title is required'],
            maxlength:[200,"Title should be less than or equal to 200"],
            // trim:true,
        },
        description:{
            type:String,
            maxlength:[500,"Description should be less than or equal to 500"],
        },
        views:{
            type:Number,
            default:0,
            // required:true,
        },
        duration:{
            type:Number,  //cloudnary
            required:[true,"Duration is required"],          
        },
        isPublished:{
            type:Boolean,
            default:true,
            // required:true,
        },
        videoFile:{
            type:String,
            required:[true,'Video file is required'],
        }
    },
    {
        timestamps:true,
    }
)
// now we can write aggrgate queries 
VideoSchema.plugin(mongooseAggregatePaginate);

export const video= mongoose.model("video",VideoSchema);