import express from "express";

import { getProfile, updateProfile } from "../controller/userController.js";

const userRouter = express.Router();

userRouter.patch("/profile", updateProfile);
userRouter.get("/profile", getProfile);

export default userRouter;
