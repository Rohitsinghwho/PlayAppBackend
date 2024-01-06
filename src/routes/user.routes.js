import { Router } from "express";
import {
     RegisterUser, 
     loginUser,
     logoutUser,
     updateRefreshToken
    
    } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { jwtVerify } from "../middlewares/auth.middleware.js";
const router= Router();

router.route("/regisiter").post(
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
router.route("/login").post(loginUser);
//secured Access
router.route("/logout").post(jwtVerify, logoutUser);
router.route("/refresh-Token").post(updateRefreshToken)
export default router;