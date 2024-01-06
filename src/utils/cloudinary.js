import {v2 as cloudinary} from "cloudinary"
import fs from "fs"          
import { ApiError } from "./ApiError.js";
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDNIARY_API_SECRET 
});

const UploadOnCloudinary=async(filepath)=>{
    try {
        if(!filepath)return null;
        const result = await cloudinary.uploader.upload(filepath,{
            resource_type:"auto",
        });
        // console.log(`File Uploded successfully on Cloudinary : ${result.url}`);
        fs.unlinkSync(filepath);

        return result;
    } catch (error) {
        fs.unlinkSync(filepath);
        return null;
    }
}

const DeletefromCloudnary=async(filepath)=>{
    try {
        const publicIdToDelete = cloudinary.url(filepath, { secure: true, sign_url: true }).split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicIdToDelete, (error, result) => {
            if (error) {
              throw new ApiError(401,"Error in Uploading to cloud")
            } 
        })
    
    } catch (error) {
        return null;
    }
}
export {UploadOnCloudinary,DeletefromCloudnary}