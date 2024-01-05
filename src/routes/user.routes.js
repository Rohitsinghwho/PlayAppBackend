import { Router } from "express";
import { RegisterUser } from "../controllers/user.controllers.js";
const router= Router();

router.route("/regisiter").post(RegisterUser);


export default router;