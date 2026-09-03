import express from "express";
import { getAllRoles } from "../controller/roleController.js";

const roleRouter = express.Router();

roleRouter.get("/", getAllRoles);

export default roleRouter;
