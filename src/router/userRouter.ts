import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import {
   
  getProfile,  
  updateProfile} from "../controller/userController.js";


const userRouter = express.Router();

userRouter.patch("/profile", authMiddleware, updateProfile);

userRouter.get("/profile", authMiddleware, getProfile);

export default userRouter;

