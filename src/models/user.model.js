import mongoose ,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const UserSchema= new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            trim: true , // remove extra spaces
            lowercase:true,
            index:true,
        },
        email:{
            type:String,
            required:[true, 'Email is Required'],
            unique:true,
            trim: true , // remove extra spaces
            lowercase:true,
        },
        fullName:{
            type:String,
            required:[true, 'FullName is Required'],
            trim: true , // remove extra spaces
            index:true
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",
            }
        ],
        password:{
            type:String, //bcrypt 
            required:[true,'Passowrd is required'],
        },
        avatar:{
            type:String,  //cloudnary
            required:true,
        },
        coverImage:{
            type:String,
        },
        refreshToken:{
            type:String,
        }
    },
    {
        timestamps:true,
    }
)
// password encryption done
UserSchema.pre("save" ,async function(next){
    if(!this.isModified("password"))return next();
    this.password=await bcrypt.hash(this.password,10);
    next();

})
// passowrd comparison
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}
// Sign the jwt token to genrate AccessTokens
UserSchema.methods.genrateAccessToken=function(){
    {
        return jwt.sign(
            {
            _id : this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
        )
    }
}
// Sign the jwt token to generate RefreshTokens
UserSchema.methods.generateRefreshToken=function() {
    {
        return jwt.sign(
            {
            _id : this._id,
        },process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
        )
    }
}
export const User= mongoose.model("User",UserSchema);