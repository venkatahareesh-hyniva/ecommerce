import express from "express";
import { searchProducts } from "../controller/searchController.js";

const searchRouter = express.Router();

searchRouter.get("/", searchProducts);

searchRouter.get("/:id", searchProducts);

export default searchRouter;
