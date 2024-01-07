import { Router } from "express";
import {
     RegisterUser, 
     loginUser,
     logoutUser,
     updateRefreshToken,
     UpdateAndChangePassword,
     getUser,
     UpdateAccountDetails,
     UpdateProfilePicture,
     updateCoverImage,
     getUserChannelInfo
    
    } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { jwtVerify } from "../middlewares/auth.middleware.js";
const router= Router();

router.route("/register-User").post(
    // upload.fields can upload multiple files at a time
    upload.fields([
        {
            name:"avatar",
            maxlength:1,
        },
        {
            name:"coverImage",
            maxlength:1,
            
        }
    ]),
    RegisterUser
    
    );
router.route("/login-User").post(loginUser);
//secured Access
router.route("/logout-User").post(jwtVerify, logoutUser);
router.route("/refresh-Token").post(updateRefreshToken)
router.route("/change-Password").post(jwtVerify, UpdateAndChangePassword);
router.route("/get-User").get(jwtVerify,getUser)
router.route("/update-Account-Detail").post(jwtVerify,UpdateAccountDetails)
router.route("/update-Profle-Picture").post(jwtVerify,upload.single("avatar"),UpdateProfilePicture);
router.route("/update-Cover-Picture").post(jwtVerify,upload.single("coverImage"),updateCoverImage);
router.route("/get-User-Profile/:username").post(jwtVerify,getUserChannelInfo)
export default router;