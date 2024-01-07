import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    updateTweet,
} from "../controllers/tweets.controllers.js"
import {jwtVerify} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(jwtVerify); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
// router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router