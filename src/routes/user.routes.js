import { Router } from "express";
import { RegisterUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
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
export default router;