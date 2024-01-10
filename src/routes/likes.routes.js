import {Router} from 'express'
import { jwtVerify } from "../middlewares/auth.middleware.js";
import{
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos}from "../controllers/likes.contollers.js"
const router=Router();
router.use(jwtVerify)
// @route   GET api/users
router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);




export default router;