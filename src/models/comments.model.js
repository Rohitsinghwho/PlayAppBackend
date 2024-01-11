import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentModel= new Schema(
    
    {
      content:{
        type:String,
        required:[true,"Content is required"],
      },
      video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
      },
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
      }  
    },

{timestamps:true})
CommentModel.plugin(mongooseAggregatePaginate)
export const Comment= mongoose.model("Comment",CommentModel);