import { Router } from 'express';
import {
    publishAVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
    getAllVideos

} from "../controllers/video.controllers.js"
import {jwtVerify} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(jwtVerify); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router.route("/:videoId").get(getVideoById)
router.route("/:videoId").delete(deleteVideo)
router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router