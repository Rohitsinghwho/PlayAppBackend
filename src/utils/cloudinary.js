import {v2 as cloudinary} from "cloudinary"
import fs from "fs"          
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
        console.log(`File Uploded successfully on Cloudinary : ${result.url}`);
        return result;
    } catch (error) {
        fs.unlinkSync(filepath);
        return null;
    }
}


export {UploadOnCloudinary}