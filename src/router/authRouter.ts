import express from "express";
import { register, Login, logout } from "../controller/authController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";


const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", Login);
authRouter.post("/logout", authMiddleware, logout);

export default authRouter;
